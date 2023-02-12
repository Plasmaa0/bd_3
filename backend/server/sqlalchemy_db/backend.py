import uuid
from datetime import datetime, timedelta
from typing import Tuple, List

from sqlalchemy.orm import Session

from . import models, schemas


# decorator that passes db session to function as first argument
def db_session(func):
    from .database import SessionLocal

    def wrapper(*args, **kwargs):
        # fixme this is horrible implementation of getting session
        db = SessionLocal()
        result = func(db, *args, **kwargs)
        db.close()
        return result

    return wrapper


@db_session
def init_db(db: Session):
    from sqlalchemy import text
    from .database import engine
    db.execute(text("DROP TABLE IF EXISTS classification CASCADE;"
                    "DROP TABLE IF EXISTS files CASCADE;"
                    "DROP TABLE IF EXISTS project_classes CASCADE;"
                    "DROP TABLE IF EXISTS projects CASCADE;"
                    "DROP TABLE IF EXISTS tokens CASCADE;"
                    "DROP TABLE IF EXISTS users CASCADE;"))
    db.commit()
    models.Base.metadata.create_all(bind=engine)
    root = models.Classification(name='root', parent_name=None)
    db.add(root)
    db.commit()
    db.refresh(root)

    database_files = 'functions.sql'
    try:
        with open(database_files) as f:
            db.execute(text(f.read()))
    except FileNotFoundError:
        print(f'File {database_files} not found')
        print('Trying with prefix ../database/')
        with open(f'../database/{database_files}') as f:
            db.execute(text(f.read()))
    else:
        print('Database functions loaded')
    db.commit()


@db_session
def user_token_expired(db: Session, user: str):
    db_token = db.query(models.Tokens).filter(models.Tokens.owner == user).first()
    if db_token:
        # compare token expiration date with current date
        return db_token.expire < datetime.now()
    return True


@db_session
def user_valid_token(db: Session, user: str, token: str):
    db_token = db.query(models.Tokens).filter(models.Tokens.owner == user).first()
    if db_token:
        return db_token.token == token
    return False


@db_session
def is_user_exist(db: Session, user: str):
    db_user = db.query(models.Users).filter(models.Users.name == user).first()
    if db_user:
        return True
    return False


@db_session
def user_have_token(db: Session, user: str):
    db_token = db.query(models.Tokens).filter(models.Tokens.owner == user).first()
    if db_token:
        return True
    return False


@db_session
def check_auth(db: Session, user: str, token: uuid) -> Tuple[bool, str]:
    if len(user) == 0:
        return False, "User name is empty"
    if token is None:
        return False, "Token is empty"
    if not is_user_exist(user):
        return False, "User not found"
    if user_token_expired(user):
        return False, "Token expired, please login again"
    if not user_valid_token(user, uuid.UUID(token)):
        return False, "Invalid token, try login again or contact administrator"
    return True, "Auth OK"


@db_session
def get_user_role(db: Session, user: str):
    db_user = db.query(models.Users).filter(models.Users.name == user).first()
    if db_user:
        return db_user.role
    return None


@db_session
def check_permissions_and_auth(db: Session, page: str, user: str, token: str) -> Tuple[bool, str]:
    success, message = check_auth(user, token)
    if not success:
        return False, message
    if len(page) == 0:
        return False, "No user-page specified"
    if not is_user_exist(page):
        return False, "No such user-page"
    if user != page and get_user_role(user) != "admin":
        return False, "You have no permissions to access this page"
    return True, "Permissions and Auth OK"


@db_session
def is_password_correct(db: Session, user: str, password: str):
    db_user = db.query(models.Users).filter(models.Users.name == user).first()
    if db_user:
        return db_user.password == password
    return False


first_user_registered = False


@db_session  # make first registered user admin
def register_new_user(db: Session, user: str, password: str) -> bool:
    global first_user_registered
    role = 'default'
    if not first_user_registered:
        role = 'admin'
        first_user_registered = True
    db_user = models.Users(name=user, password=password, role=role)
    db.add(db_user)
    try:
        db.commit()
    except Exception as e:
        print(type(e).__name__)
        return False
    db.refresh(db_user)
    return True


@db_session
def get_token(db: Session, user: str) -> Tuple[bool, dict]:
    db_token = db.query(models.Tokens).filter(models.Tokens.owner == user).first()
    if db_token:
        return True, {"token": str(db_token.token), "expire": str(db_token.expire)}
    return False, {}


@db_session
def generate_token(db: Session, user: str) -> Tuple[bool, dict]:
    token = uuid.uuid4()
    expire = datetime.now() + timedelta(days=1)
    # if user already have token, update it
    if user_have_token(user):
        db_token = db.query(models.Tokens).filter(models.Tokens.owner == user).first()
        db_token.token = token
        db_token.expire = expire
    else:
        # else create new token
        db_token = models.Tokens(token=token, owner=user, expire=expire)
        db.add(db_token)
        db.commit()
        db.refresh(db_token)
    return get_token(user)


@db_session
def get_project_classes(db: Session, user: str, project_path: str) -> List[str]:
    db_project_classes = db.query(models.ProjectClasses) \
        .filter(models.ProjectClasses.owner == user,
                models.ProjectClasses.path_to == project_path).all()
    if db_project_classes:
        return [db_project_class.class_name for db_project_class in db_project_classes]
    return ['']


@db_session
def get_user_page(db: Session, user: str) -> List[schemas.UserPageProject]:
    # get all projects for user where user is owner and parent_project is None
    db_projects = db.query(models.Projects) \
        .filter(models.Projects.owner == user) \
        .filter(models.Projects.parent_project == None).all()
    if db_projects:
        projects = []
        # use enumerate to get index of project in list
        for index, db_project in enumerate(db_projects):
            project = schemas.UserPageProject(
                name=db_project.name,
                tags=db_project.tags,
                key=index,
                classes=get_project_classes(user, db_project.path_to)
            )
            projects.append(project)
        return projects
    return []


@db_session
def get_project_page(db: Session, user: str, project_path: str) -> schemas.ProjectPageProject:
    # get info about project
    db_project = db.query(models.Projects) \
        .filter(models.Projects.owner == user,
                models.Projects.path_to == project_path).first()
    # early return if project not found
    if not db_project:
        return schemas.ProjectPageProject()
    result = schemas.ProjectPageProject(
        parent=db_project.parent_project,
        name=db_project.name,
        tags=db_project.tags,
        classes=get_project_classes(user, project_path),
        items=schemas.ProjectItems(
            files=[],
            children=[]
        )
    )
    # get info about files in project
    db_project_files = db.query(models.Files) \
        .filter(models.Files.owner == user,
                models.Files.path_to == project_path).all()
    if db_project_files:
        files = []
        for index, db_project_file in enumerate(db_project_files):
            extension = db_project_file.name.split('.')[-1]
            file = {
                'name': db_project_file.name,
                'key': index,
                'ext': extension
            }
            files.append(file)
        result.items.files = files

    # get info about subprojects in project
    db_project_subprojects = db.query(models.Projects) \
        .filter(models.Projects.owner == user,
                # projects with path_to = project_path + '/' + project_name
                models.Projects.path_to.like(project_path + '/' + models.Projects.name)).all()
    if db_project_subprojects:
        subprojects = []
        for index, db_project_subproject in enumerate(db_project_subprojects):
            subproject = {
                'name': db_project_subproject.name,
                'key': index,
                'tags': db_project_subproject.tags,
                'classes': get_project_classes(user, db_project_subproject.path_to)
            }
            subprojects.append(subproject)
        result.items.children = subprojects
    return result


@db_session
def register_new_file(db: Session, user: str, project_path: str, file_name: str):
    db_file = models.Files(owner=user, path_to=project_path, name=file_name, parent_project=project_path.split('/')[-1])
    db.add(db_file)
    try:
        db.commit()
        db.refresh(db_file)
    except:
        return False
    else:
        return True


@db_session
def remove_file(db: Session, user: str, project_path: str):
    arr = project_path.split('/')
    if '/' in project_path:
        name = arr.pop()
    else:
        name = project_path
    project_path = '/'.join(arr)
    f = db.query(models.Files).filter(models.Files.owner == user,
                                      models.Files.path_to == project_path,
                                      models.Files.name == name)
    try:
        if f:
            f.delete()
            db.commit()
        else:
            print('File not found')
            return False, 'File not found'
    except:
        return False, 'Failed to delete file'
    else:
        # db.refresh(db)
        return True, 'File deleted'


@db_session
def remove_project(db: Session, user: str, project_path: str):
    name = project_path.split('/')[-1] if '/' in project_path else project_path
    db.query(models.Projects).filter(models.Projects.owner == user,
                                     models.Projects.name == name,
                                     models.Projects.path_to == project_path).delete()
    try:
        db.commit()
    except:
        return False, 'Failed to delete project'
    else:
        # db.refresh(db)
        return True, 'Project deleted'


@db_session
def create_project(db: Session, user: str, project_path: str, tags: str):
    is_complex_path = '/' in project_path
    path_split = project_path.split('/')
    name_ = path_split[-1] if is_complex_path else project_path
    parent = path_split[-2] if is_complex_path else None
    db_project = models.Projects(owner=user,
                                 parent_project=parent,
                                 name=name_,
                                 tags=tags,
                                 path_to=project_path
                                 )
    db.add(db_project)
    try:
        db.commit()
        db.refresh(db_project)
    except:
        return False
    return True


@db_session
def update_tags(db: Session, user: str, project_path: str, tags: str):
    db_project = db.query(models.Projects) \
        .filter(models.Projects.owner == user,
                models.Projects.path_to == project_path).first()
    db_project.tags = tags
    try:
        db.commit()
        db.refresh(db_project)
    except:
        return False
    else:
        return True


@db_session
def find_projects(db: Session,
                  owner: str,
                  project_name: str,
                  tags: str,
                  classes: List[str],
                  limit: int,
                  only_top_level: bool = False) -> Tuple[bool, List[schemas.SearchResultProject]]:
    """
    :param db: database session
    :param owner: owner of project
    :param project_name: name of project
    :param tags: tags of project
    :param classes: list of class names
    :param limit: limit of projects
    :param only_top_level: if True, then only top level projects will be returned (top level project is a project without parent project). if project is nested, then it will not be returned.
    """
    try:
        query = db.query(models.Projects)
        if owner:
            query = query.filter(models.Projects.owner.ilike(f'{owner}'))
        # todo use levenstein distance to find similar projects
        if project_name:
            query = query.filter(models.Projects.name.ilike(f'{project_name}'))
        if tags:
            query = query.filter(models.Projects.tags.ilike(f'{tags}'))
        if only_top_level:
            query = query.filter(models.Projects.parent_project == None)
        if classes:
            from sqlalchemy import and_
            # join with ProjectClasses on project path and owner
            query = query.join(models.ProjectClasses, and_(models.ProjectClasses.path_to == models.Projects.path_to,
                                                           models.ProjectClasses.owner == models.Projects.owner))
            # filter by class name
            query = query.filter(models.ProjectClasses.class_name.in_(classes))  # todo check if this works
        res = query.limit(limit).all()
        res = [schemas.SearchResultProject(
            name=project.name,
            owner=project.owner,
            tags=project.tags,
            class_=get_project_classes(project.owner, project.path_to),
            path_to=project.path_to
        ) for project in res]
        return True, res
    except Exception as e:
        print(e)
        return False, []


@db_session
def find_users(db: Session, user: str, role: str, limit: int):
    """
    :param db: database session
    :param user: username
    :param role: user role
    :param limit: limit of users
    """
    try:
        query = db.query(models.Users)
        # todo use levenstein distance to find similar users
        if user:
            query = query.filter(models.Users.name.ilike(f'%{user}%'))
        if role:
            query = query.filter(models.Users.role == role)
        res = query.limit(limit).all()
        res = [schemas.User(
            name=user.name,
            role=user.role,
            password='Not shown'
        ) for user in res]
        return True, res
    except:
        return False, []


@db_session
def find_file(db: Session, owner: str, parent_project: str,
              filename: str, path: str, limit: int):
    """
    :param db: database session
    :param owner: owner of file
    :param parent_project: parent project of file
    :param filename: name of file
    :param path: path to file
    :param limit: limit of files
    :return: list of files
    """
    # use levenstein distance to find similar files
    try:
        query = db.query(models.Files).filter(models.Files.owner.ilike(f'%{owner}%'))
        if parent_project:
            query = query.filter(models.Files.parent_project.ilike(f'%{parent_project}%'))
        if filename:
            query = query.filter(models.Files.name.ilike(f'%{filename}%'))
        if path:
            query = query.filter(models.Files.path_to.ilike(f'%{path}%'))
        res = query.limit(limit).all()
        return True, [schemas.Files(**file.__dict__) for file in res]
    except:
        return False, []


@db_session
def get_user_role(db: Session, user: str):
    """
    :param db: database session
    :param user: username
    :return: user role
    """
    db_user = db.query(models.Users).filter(models.Users.name == user).first()
    return db_user.role


@db_session
def edit_user_role(db: Session, user: str, role: str) -> bool:
    """
    :param db: database session
    :param user: username
    :param role: user role
    """
    db_user = db.query(models.Users).filter(models.Users.name == user).first()
    db_user.role = role
    try:
        db.commit()
    except:
        return False
    db.refresh(db_user)
    return True


cached_class_tree = None


def get_class_tree():
    global cached_class_tree
    return cached_class_tree


@db_session
def update_class_tree(db: Session):
    def parse_class(class_name: str, parent_node, depth: int):
        # database has function to get all children of class.
        # it is named 'class_children' and it returns list of class names
        from sqlalchemy import func
        children = db.query(func.class_children(class_name)).all()
        for child in children:
            node = {
                'title': child[0],
                'value': child[0],
                'key': child[0],
                'children': []
            }
            parent_node['children'].append(node)
            parse_class(child[0], node, depth + 1)

    global cached_class_tree
    root = [{
        'title': 'Корень дерева классификаций',
        'value': 'root',
        'key': 'root',
        'children': []
    }]
    parse_class('root', root[0], 0)
    try:
        cached_class_tree.clear()
    except:
        pass
    cached_class_tree = root


@db_session
def link_project(db: Session, owner: str, project_path: str, classes: List[str]):
    """
    :param db: database session
    :param owner: owner of project
    :param project_path: path to project
    :param classes: list of class names
    """
    for class_name in classes:
        # check if already exists
        if db.query(models.ProjectClasses).filter(models.ProjectClasses.owner == owner,
                                                  models.ProjectClasses.path_to == project_path,
                                                  models.ProjectClasses.class_name == class_name).first():
            continue
        # if not exists, create new link
        db_class = models.ProjectClasses(owner=owner,
                                         path_to=project_path,
                                         class_name=class_name
                                         )
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
    return True


def find_projects_by_class(search_user: str, class_filter: List[str]):
    return find_projects(search_user, '%', '%', class_filter, 1000, True)  # todo fix limit


@db_session
def remove_class(db: Session, class_name: str):
    # fixme do i need to delete all projects links to this class?
    # db.query(models.ProjectClasses).filter(models.ProjectClasses.class_name == class_name).delete()
    # db.commit()

    db.query(models.Classification).filter(models.Classification.name == class_name).delete()
    db.commit()
    update_class_tree()
    return True, 'OK'


@db_session
def add_child_class(db: Session, parent_class: str, child_class: str):
    db_class = models.Classification(name=child_class,
                                     parent_name=parent_class
                                     )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    update_class_tree()
    return True, 'OK'
