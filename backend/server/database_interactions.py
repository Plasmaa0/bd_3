import os
import pprint
import shutil
import time
import uuid
from datetime import datetime, timedelta
from typing import Tuple, List

from filters.FileSearchFilter import FileSearchFilter
from filters.ProjectSearchFilter import ProjectSearchFilter
from filters.UserSearchFilter import UserSearchFilter
from postgres_backend import PostgresBackend
# from .postgres_backend import PostgresBackend
from settings import DATA_DIR, TOKEN_EXPIRE_DELTA_SECONDS, load_settings
# from .settings import DATA_DIR, TOKEN_EXPIRE_DELTA_SECONDS
# from .settings import load_settings


class Database:
    def __init__(self):
        self.backend = PostgresBackend(load_settings())
        self.first_user_registered = False
        self.cached_class_tree = {}
        self.update_class_tree()  # fixme maybe not needed

    def user_token_expired(self, user: str) -> bool:
        err, res = self.backend.query(f"SELECT user_token_expired(%s);", user)
        if err:
            # fixme
            pass
        else:
            return res[1][0][0]

    def user_valid_token(self, user: str, token: str) -> bool:
        err, res = self.backend.query(f"SELECT user_valid_token(%s, %s);", user, token)
        if err:
            # fixme
            return False
        else:
            return res[1][0][0]

    def is_user_exist(self, user: str):
        err, res = self.backend.query(f"SELECT COUNT(*)=1 AS RESULT FROM users WHERE name = %s;", user)
        if err:
            # fixme
            pass
        else:
            return res[1][0][0]

    def user_have_token(self, user: str) -> bool:
        err, res = self.backend.query(f"SELECT COUNT(*)=1 AS RESULT FROM tokens WHERE username = %s;", user)
        if err:
            # fixme
            pass
        else:
            return res[1][0][0]

    def check_auth(self, user: str, token: str = '') -> Tuple[bool, str]:
        if len(user) == 0:
            print("no user given")
            return False, "no user given"
        if not self.is_user_exist(user):
            print("no such user")
            return False, "no such user"
        if len(token) == 0:
            print("no token given")
            return False, "no token given"
        elif self.user_token_expired(user):
            print("token expired")  # fixme error here
            return False, "Token expired, please login again"
        elif not self.user_valid_token(user, token):
            print("invalid token")
            return False, "invalid token"
        return True, ""

    def check_permissions_and_auth(self, user_page: str, user: str, token: str):
        success, msg = self.check_auth(user, token)
        if not success:
            return False, msg
        if len(user_page) == 0:
            print("no user given")
            return False, "no user given"
        if not self.is_user_exist(user_page):
            print("no such user")
            return False, "no such user"
        if user_page != user and self.get_user_role(user) != 'admin':
            return False, 'not allowed'
        return True, ""

    def is_password_correct(self, user: str, password: str) -> bool:
        err, res = self.backend.query(
            f"SELECT COUNT(*)=1 AS is_valid FROM users WHERE name=%s AND password=%s;", user, password)
        if err:
            # fixme
            pass
        else:
            return res[1][0][0]

    def register_new_user(self, user: str, password: str) -> bool:
        role = 'default'
        if not self.first_user_registered:
            role = 'admin'
            print("first user registered, role set to admin", user, password)
            self.first_user_registered = True
        err, res = self.backend.query(
            f"INSERT INTO users (name, password, role) VALUES (%s, %s, %s);", user, password, role)
        # print(err, res)
        if err:
            # fixme
            return False
        else:
            return True

    def generate_token(self, user: str) -> Tuple[bool, dict]:
        token = uuid.uuid4()
        print(token)
        expire = datetime.now() + timedelta(seconds=TOKEN_EXPIRE_DELTA_SECONDS)
        err, res = self.backend.query(
            f"INSERT INTO public.tokens(username, token, expire) VALUES(%s, %s, %s) "
            f"ON CONFLICT (username) "
            f"DO UPDATE SET "
            f"token=%s, expire=%s;", user, str(token), expire, str(token), expire)
        if err:
            # fixme
            return False, {}
        else:
            return self.get_token(user)

    def get_token(self, user: str) -> Tuple[bool, dict]:
        err, res = self.backend.query(f"SELECT token, expire FROM tokens WHERE username = %s;", user)
        if err:
            # fixme
            return False, {}
        else:
            token_str, expire_datetime = res[1][0]
            token = uuid.UUID(token_str)
            expire = time.mktime(expire_datetime.timetuple())
            # print(token, expire_datetime)
            return True, {"token": str(token), "expire": expire}

    def get_project_classes(self, user: str, project_path: str) -> List[str]:
        err, res = self.backend.query(
            f"SELECT class FROM project_classes WHERE owner=%s AND path_to=%s;", user, project_path)
        if err:
            return ['']
        result = []
        for line in res[1]:
            result += line
        return result

    def get_user_page(self, user: str):
        err, res = self.backend.query(
            f"SELECT name, tags, path_to FROM projects WHERE owner=%s AND parent_project IS NULL;", user)
        if err:
            # fixme
            return False, {}
        else:
            result = []
            i = 0
            for line in res[1]:
                entry = {}
                name = line[0]
                tags = line[1]  # fixme
                # tags = [i for i in line[1][1:-1].split(',')]
                entry['name'] = name
                entry['tags'] = tags
                entry['key'] = i
                path = line[2]
                entry['classes'] = self.get_project_classes(user, path)
                i += 1
                result.append(entry)
            print(result)
            return result

    def get_project_page(self, user: str, project_path: str):
        # информация о проекте
        err, res = self.backend.query(
            f"SELECT parent_project, name, tags FROM projects WHERE path_to=%s AND owner=%s;", project_path, user)
        if err or len(res[1]) == 0:
            # fixme
            print('early exit')
            return {
                'parent': [],
                'name': [],
                'tags': [],  # fixme
                'items': {
                    'files': [],
                    'children': []
                }
            }
        result = {
            'parent': res[1][0][0],
            'name': res[1][0][1],
            'tags': res[1][0][2],  # fixme
            'classes': self.get_project_classes(user, project_path),
            'items': {
                'files': [],
                'children': []
            }
        }
        # информация о файлах в проекте
        err, res = self.backend.query(
            f"SELECT name, split_part(name, '.', 2) AS extension FROM files WHERE owner = %s AND path = %s;", user,
            project_path)
        # print(res)
        if err:
            # fixme
            return {}
        i = 0
        for file in res[1]:
            result['items']['files'].append({
                'name': file[0],
                'ext': file[1],
                'key': i
            })
            i += 1

        # информация о вложенных проектах
        err, res = self.backend.query(
            f"SELECT p1.name, p1.tags, p1.path_to FROM projects p1 JOIN projects p2 ON p2.name=p1.parent_project AND p2.owner=p1.owner WHERE p2.path_to=%s AND p2.owner=%s;",
            project_path, user)

        # TODO github copilot suggested this. figure out if it is better
        # err, res = self.backend.query(
        #     f"SELECT name, tags, path_to FROM projects WHERE parent_project=%s AND owner=%s;", project_path, user)
        if err:
            # fixme
            return {}
        i = 0
        for child in res[1]:
            result['items']['children'].append({
                'name': child[0],
                'tags': child[1],
                'classes': self.get_project_classes(user, child[2]),
                'key': i
            })
            i += 1
        pprint.pprint(result)
        return result

    def register_new_file(self, user: str, project_path: str, filename: str):
        parent = project_path.split('/')[-1]
        err, res = self.backend.query(
            f"INSERT INTO files(id, owner, parent_project, name, path) VALUES(DEFAULT, %s, %s, %s, %s);", user, parent,
            filename, project_path)
        print(err, res)

    def remove_file(self, user: str, project_path: str) -> Tuple[bool, str]:
        arr = project_path.split('/')
        name = arr.pop()
        err, res = self.backend.query(
            f"DELETE FROM files WHERE owner=%s AND name=%s AND path=%s;", user, name, '/'.join(arr))
        print(err, res)
        if err:
            return False, err
        else:
            return True, ''

    def remove_project(self, user: str, project_path: str) -> Tuple[bool, str]:
        # fixme it does not remove recursively because of no foreign key with cascade deletion
        #  representing tree structure on projects table
        if '/' in project_path:
            arr = project_path.split('/')
            name = arr[-1]
            query = "DELETE FROM projects WHERE owner = %s AND name = %s AND path_to = %s;"
            err, res = self.backend.query(query, user, name, project_path)
        else:
            query = "DELETE FROM projects WHERE owner = %s AND name = %s AND path_to = %s;"
            err, res = self.backend.query(query, user, project_path, project_path)
        print(query)
        if err:
            return False, err
        else:
            return True, ''

    def create_project(self, user, project_path, tags):
        print(f'db create project {user} {project_path} {tags}')
        # return True
        if '/' in project_path:
            # nested project
            arr = project_path.split('/')
            parent = arr[-2]
            name = arr[-1]
            err, res = self.backend.query(
                f"INSERT INTO projects (owner, parent_project, name, tags, path_to) VALUES (%s, %s, %s, %s, %s);",
                user, parent, name, tags, '/'.join(arr))
            # user page
            if err:
                print(err)
                return False
            else:
                return True
            pass
        else:
            err, res = self.backend.query(
                f"INSERT INTO projects (owner, parent_project, name, tags, path_to) VALUES (%s, null, %s, %s, %s);",
                user, project_path, tags, project_path)
            # user page
            if err:
                print(err)
                return False
            else:
                return True

    def update_tags(self, user, project_path, tags):
        err, res = self.backend.query(
            f"UPDATE projects SET tags = %s WHERE owner = %s AND path_to = %s;", tags, user, project_path)
        if err:
            print(err, res)
            return False
        else:
            return True

    def find_projects(self, owner: str, project: str, tags: str, class_names: List[str], limit: int, only_top_level):
        """
        :param owner: owner of project
        :param project: name of project
        :param tags: tags of project
        :param class_names: list of class names
        :param limit: limit of projects
        :param only_top_level: if True, then only top level projects will be returned (top level project is a project without parent project). if project is nested, then it will not be returned.
        """
        try:
            filters = ProjectSearchFilter(owner, project, tags, class_names, limit, only_top_level)
            query = f"SELECT DISTINCT p.owner, name, tags, p.path_to, class FROM projects p " \
                    f"JOIN project_classes pc on p.owner = pc.owner and p.path_to = pc.path_to " \
                    f"WHERE {filters}"
            print(query)
            err, res = self.backend.query(query, *filters.args())
            if err:
                print(err, res)
                return False, {}
            else:
                result = []
                i = 0
                for matching_project in res[1]:
                    result.append({
                        'key': i,
                        'owner': matching_project[0],
                        'name': matching_project[1],
                        'tags': matching_project[2],
                        'path_to': matching_project[3],
                        'class': matching_project[4]
                    })
                    i += 1
                pprint.pprint(result)
                return True, result
        except Exception as e:
            print(e)
            return False, {}

    def find_users(self, user_to_find: str, role: str, limit: int):
        try:
            filters = UserSearchFilter(user_to_find, role, limit)
            err, res = self.backend.query(f"SELECT name, role FROM users WHERE {filters}", *filters.args())
            if err:
                print(err, res)
                return False, {}
            else:
                result = []
                i = 0
                for matching_user in res[1]:
                    result.append({
                        'key': i,
                        'name': matching_user[0],
                        'role': matching_user[1]
                    })
                    i += 1
                pprint.pprint(result)
                return True, result
        except Exception as e:
            print(e)
            return False, {}

    def find_file(self, owner: str, parent_project: str, filename: str, path: str, limit: int):
        try:
            filters = FileSearchFilter(owner, parent_project, filename, path, limit)
            err, res = self.backend.query(f"SELECT owner, parent_project, name, path FROM files WHERE {filters}",
                                          *filters.args())
            if err:
                print(err, res)
                return False, {}
            else:
                result = []
                i = 0
                for matching_file in res[1]:
                    result.append({
                        'key': i,
                        'owner': matching_file[0],
                        'parent_project': matching_file[1],
                        'name': matching_file[2],
                        'path': matching_file[3]
                    })
                    i += 1
                pprint.pprint(result)
                return True, result
        except Exception as e:
            print(e)
            return False, {}

    def get_user_role(self, user: str):
        err, res = self.backend.query(f"SELECT role FROM users WHERE name=%s;", user)
        if err:
            print(err, res)
            return 'default'
        else:
            return res[1][0][0]

    def edit_user_role(self, user: str, new_role: str):
        err, res = self.backend.query(f"UPDATE users SET role=%s WHERE name=%s;", new_role, user)
        if err:
            print(err, res)
            return False
        else:
            return True

    def update_class_tree(self):
        def parse_class(class_name: str, parent_node, depth: int):
            _err, _res = self.backend.query("SELECT * FROM class_children(%s)", class_name)
            if _err:
                print(_err)
                return False
            for _name in _res[1]:
                _node = {
                    'title': _name[0],
                    'value': _name[0],
                    'key': _name[0],
                    'children': []
                }
                parse_class(_name[0], _node, depth + 1)
                parent_node['children'].append(_node)

        err, res = self.backend.query("SELECT * FROM class_children('root')")
        if err:
            print(err)
            return False
        root = [{
            'title': 'Корень дерева классификаций',
            'value': 'root',
            'key': 'root',
            'children': []
        }]
        for name in res[1]:
            node = {
                'title': name[0],
                'value': name[0],
                'key': name[0],
                'children': []
            }
            parse_class(name[0], node, 1)
            root[0]['children'].append(node)
        self.cached_class_tree.clear()
        self.cached_class_tree = root

    def get_class_tree(self):
        return self.cached_class_tree

    def link_project(self, user_page, project_path, class_names):
        print(class_names)
        for class_name in class_names:
            err, res = self.backend.query(
                f"INSERT INTO project_classes(owner, path_to, class) VALUES (%s, %s, %s);", user_page, project_path,
                class_name)
            if err:
                print(err, res)
                return False
        return True

    def find_projects_by_class(self, search_user, class_filter):
        return self.find_projects(search_user, '%', '%', class_filter, 100, True)

    def remove_class(self, class_name: str):
        err, res = self.backend.query(f"DELETE FROM project_classes WHERE class=%s;", class_name)
        if err:
            print(err)
            return False, str(err)
        err, res = self.backend.query(f"DELETE FROM classification WHERE name=%s;", class_name)
        if err:
            print(err)
            return False, str(err)
        self.update_class_tree()  # fixme
        return True, ''

    def add_child_class(self, class_name: str, child_name: str):
        err, res = self.backend.query(
            f"INSERT INTO classification(name, parent_name) VALUES (%s, %s);", child_name, class_name)
        if err:
            print(err)
            if 'already exists' in str(err):
                return False, f"Child class '{child_name}' already exists"
            else:
                return False, str(err)
        self.update_class_tree()  # fixme
        return True, ''

    def init_db(self, files: List[str] = [], force: bool = False):
        # print current working directory
        print('Current working directory:', os.getcwd())
        # if not force check if initialization is done
        if (not force) and ('WEBSITE_BACKEND_INITIALIZED' in os.environ):
            return
        print('Initializing app...')
        self.reset_data_dir()
        self.reset_database(files)
        # set environment variable to indicate that initialization is done
        os.environ['WEBSITE_BACKEND_INITIALIZED'] = '1'

    def reset_database(self, files: List[str] = []):
        database_files = ['tables.sql', 'functions.sql'] if len(files) == 0 else files
        print('Resetting database...')
        try:
            # when running locally. database files are in the "../database" directory
            self.execute_files(list(map(lambda x: '../database/' + x, database_files)))
        except Exception as e:
            # when deploying using docker. database files are in the same directory
            self.execute_files(database_files)

    def execute_files(self, files):
        for file in files:
            with open(file, 'r') as f:
                self.backend.query('\n'.join(f.readlines()))
                print(f'Executed {file}')

    @staticmethod
    def reset_data_dir():
        print('Resetting data directory...')
        try:
            shutil.rmtree(DATA_DIR)
            print('Removed old data directory')
        except Exception as e:
            print(e)
        try:
            os.mkdir(DATA_DIR)
            print('Created new data directory')
        except Exception as e:
            print(e)
