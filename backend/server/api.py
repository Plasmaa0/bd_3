import json
import time
from os import listdir
from shutil import make_archive

from fastapi import FastAPI, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.responses import JSONResponse

import database_interactions
import file_interactions
from file_interactions import DATA_DIR

database_interactions.init_db()

app = FastAPI()

GLOBAL_HEADERS = {"Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"}

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/edit_tags/{user_page}/{project_path:path}")
async def edit_tags(user_page: str, project_path: str, tags: str = '', user: str = '', token: str = ''):
    print(user_page, project_path, tags)
    # todo mb extract token validation to function?
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if database_interactions.update_tags(user_page, project_path, tags):
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content='updated tags successfully')
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="failed to update tags")


@app.get('/edit_role/{user_page}')
async def edit_role(user_page: str, new_role: str, user: str = '', token: str = ''):
    print(f"{user} updates role of {user_page} to {new_role}")
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    if database_interactions.edit_user_role(user_page, new_role):
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="role updated")
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="failed to update role")


@app.post("/uploadfiles/{user_page}/{project_path:path}")
async def create_upload_file(user_page: str, project_path: str, file: UploadFile, user: str = '',
                             token: str = '', overwrite: bool = False, create_missing_dir: str = '',
                             class_names: str = ''):
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if not database_interactions.is_user_exist(user_page):  # FIXME user directory must be created when user registers
        print("no such user " + user_page)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=("no such user " + user_page))
    try:
        user_project_path = f"{DATA_DIR}/{user_page}/{project_path}"
        filepath = f"{user_project_path}/{file.filename}"
        if create_missing_dir:
            arr = project_path.split('/')
            filename = arr.pop()
            path_without_filename = '/'.join(arr)
            file_interactions.create_directories(user_page, path_without_filename)  # ignoring errors on already exists
            database_interactions.create_project(user_page, path_without_filename, '')  # ignoring errors on duplicates
            database_interactions.link_project(user_page, path_without_filename, class_names.split('/'))
            database_interactions.register_new_file(user_page, path_without_filename, filename)
            with open(user_project_path, "wb") as f:
                f.write(await file.read())
        elif file.filename in listdir(user_project_path) and (not overwrite):
            # todo what to do here? (file already exists)
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=200,
                                content=f"file '{file.filename}' already exists and overwrite=False")
        else:
            with open(filepath, "wb") as f:
                f.write(await file.read())
    except Exception as e:
        print(e)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="caught exception")
    else:
        database_interactions.register_new_file(user_page, project_path, file.filename)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="written " + file.filename)


@app.get("/rm/{user_page}/{project_path:path}")
async def remove_file(user_page: str, project_path: str, user: str = '', token: str = ''):
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if not database_interactions.is_user_exist(user_page):  # FIXME user directory must be created when user registers
        print("no such user " + user_page)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=("No such user " + user_page))
    success, msg = file_interactions.remove_file(user_page, project_path)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=f"Error removing {project_path}: {msg}")
    success, msg = database_interactions.remove_file(user_page, project_path)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=f"Error removing {project_path}: {msg}")
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="Removed " + project_path)


@app.get("/rmdir/{user_page}/{project_path:path}")
async def remove_directory(user_page: str, project_path: str, user: str = '', token: str = ''):
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if not database_interactions.is_user_exist(user_page):  # FIXME user directory must be created when user registers
        print("no such user " + user_page)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=("No such user " + user_page))
    success, msg = file_interactions.remove_directory(user_page, project_path)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=f"Error removing {project_path}: {msg}")
    success, msg = database_interactions.remove_project(user_page, project_path)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=f"Error removing {project_path}: {msg}")
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="Removed " + project_path)


@app.post("/mkdir/{user_page}/{project_path:path}")
async def create_directory(user_page: str, project_path: str, request: Request, user: str = '', token: str = '',
                           tags: str = ''):
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if not database_interactions.is_user_exist(user_page):  # FIXME user directory must be created when user registers
        print("no such user " + user_page)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=("no such user " + user_page))
    # fixme implement me
    mkdir_success = file_interactions.create_directory(user_page, project_path)
    db_success = database_interactions.create_project(user_page, project_path, tags)
    link_success = database_interactions.link_project(user_page, project_path, await request.json())
    if mkdir_success and db_success and link_success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="created " + project_path)
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="error creating " + project_path)


@app.post("/register")
async def register_page(user: str = '', password: str = ''):
    # todo sql injection protection
    if database_interactions.is_user_exist(user):
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=400, content="user already exists")
    success = database_interactions.register_new_user(user, password)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500,
                            content="Internal error. falied to register new user")
    # fixme create user's directory
    file_interactions.create_user_directory(user)
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="successful registration")


@app.get("/login")
async def login(user: str = '', password: str = ''):
    # todo sql injection protection
    if not database_interactions.is_user_exist(user):
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content="user not exist")
    if database_interactions.is_password_correct(user, password):
        if (not database_interactions.user_have_token(user)) or database_interactions.user_token_expired(user):
            # generate new token
            # save new token (or replace old expired one)
            # return new token
            success, json_token = database_interactions.generate_token(user)
            if success:
                print("token success expired", json_token)
                json_token['role'] = database_interactions.get_user_role(user)
                return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=json_token)
            else:
                return JSONResponse(headers=GLOBAL_HEADERS, status_code=500,
                                    content="Internal error. failed to generate token")
        else:
            success, json_token = database_interactions.get_token(user)
            # return existing token
            if success:
                json_token['role'] = database_interactions.get_user_role(user)
                print("token success not expired", json_token)
                return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=json_token)
            else:
                return JSONResponse(headers=GLOBAL_HEADERS, status_code=500,
                                    content="Internal error. failed to retrieve token from database")
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content="wrong password!")


@app.get("/dir/{user_page}")
async def get_user_page(user_page: str, user: str = '', token: str = ''):
    print('user page', user_page)
    # todo mb extract token validation to function?
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    files = database_interactions.get_user_page(user_page)
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=files)


@app.get("/dir/{user_page}/{project_path:path}")
async def project_page(user_page: str, project_path: str, user: str = '', token: str = ''):
    # todo mb extract token validation to function?
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    files = database_interactions.get_project_page(user_page, project_path)
    print(time.time())
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=files)


@app.get("/file/{user_page}/{file_path:path}")
async def file_page(user_page: str, file_path: str, user: str = '', token: str = ''):
    # todo mb extract token validation to function?
    success, msg = database_interactions.check_permissions_and_auth(user_page, user, token)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    # file_data = file_interactions.get_file(user_page, file_path)
    # fixme how to return file contents?
    full_filepath = f"{DATA_DIR}/{user_page}/{file_path}"
    return FileResponse(full_filepath)
    # return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content={'data': file_interactions.encode_html(file_data)})


@app.post("/search/{search_type}/{user}")
async def search(request: Request, search_type: str, user: str, token: str = ''):
    print(search_type, user, token)
    # todo introduce new parameter at fronted form: limit (for every type of search)
    # todo mb extract token validation to function?
    success, msg = database_interactions.check_auth(user, token)  # todo check_auth vs chech_permissions_and_auth??!
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    # todo get user role from db to perform future validations
    searcher_role = database_interactions.get_user_role(user)
    query_params = await request.json()
    print(query_params)
    limit = int(query_params['limit'])
    if search_type == 'projects':
        owner = query_params['owner']
        project = query_params['project']
        tags = query_params['tags']
        class_names = json.loads(query_params['classes'])
        print(owner, project, tags, class_names)
        if user != owner and searcher_role != 'admin':
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content='this search not allowed by not admin')
        succ, result = database_interactions.find_projects(owner, project, tags, class_names, limit)
        if succ:
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=result)
        else:
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="failed search by projects")
    elif search_type == 'users':
        user_to_find = query_params['user']
        role = query_params['role']
        print(user_to_find)
        # fixme check if admin
        if user != user_to_find and searcher_role != 'admin':
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content='this search not allowed by not admin')
        succ, result = database_interactions.find_users(user_to_find, role, limit)
        if succ:
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=result)
        else:
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="failed search by users")
    elif search_type == 'files':
        owner = query_params['owner']
        parent_project = query_params['parent']
        filename = query_params['filename']
        path = query_params['path']
        print(owner, filename)
        if user != owner and searcher_role != 'admin':
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content='this search not allowed by not admin')
        succ, result = database_interactions.find_file(owner, parent_project, filename, path, limit)
        if succ:
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=result)
        else:
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="failed search by file")
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=404, content="Unsupported search type")


@app.get('/class_tree')
async def get_class_tree(user: str = '', token: str = ''):
    success, msg = database_interactions.check_auth(user, token)  # todo check_auth vs chech_permissions_and_auth??!
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    # fixme do sql!
    class_tree = database_interactions.get_class_tree()
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=class_tree)


@app.post('/classification')
async def get_projects_by_classification(request: Request, user: str = '', token: str = ''):
    success, msg = database_interactions.check_auth(user, token)  # todo check_auth vs chech_permissions_and_auth??!
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    role = database_interactions.get_user_role(user)
    # search only user's projects
    class_filter = await request.json()
    if len(class_filter) == 0:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=[])
    print(class_filter)
    search_user = '%' if role == 'admin' else user
    success, projects = database_interactions.find_projects_by_class(search_user, class_filter)
    if success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=projects)
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="failed search by class")


@app.get('/rmclass')
async def rm_class(class_name: str = '', user: str = '', token: str = ''):
    success, msg = database_interactions.check_auth(user, token)  # todo check_auth vs chech_permissions_and_auth??!
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    if class_name == 'root':
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=403, content='Deleting root is not allowed')
    success, msg = database_interactions.remove_class(class_name)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=msg)
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content='Successfuly deleted class ' + class_name)


@app.get('/add_child_class')
async def add_child_class(class_name: str = '', child_name: str = '', user: str = '', token: str = ''):
    success, msg = database_interactions.check_auth(user, token)  # todo check_auth vs chech_permissions_and_auth??!
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    success, msg = database_interactions.add_child_class(class_name, child_name)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=403, content=msg)
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200,
                        content='Successfuly added child class ' + child_name + ' to ' + class_name)


@app.get('/test')
async def test_path():
    try:
        err, res = database_interactions.simple_query("SELECT 1+2;")
    except:
        return 'bad(('
    if err:
        return 'bad'
    return "good!"


@app.get('/download/{user_page}/{project_path:path}')
async def download_project(user_page: str, project_path: str, user: str = '', token: str = '', ext: str = ''):
    success, msg = database_interactions.check_auth(user, token)  # todo check_auth vs chech_permissions_and_auth??!
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    print(ext)
    if ext not in ["zip", "tar", "gztar", "bztar", "xztar"]:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="Unsupported download archive extension")
    path = f'{DATA_DIR}/{user_page}/{project_path}'
    ext_to_file_suffix = {
        "zip": "zip",
        "tar": "tar",
        "gztar": "tar.gz",
        "bztar": "tar.bz2",
        "xztar": "tar.xz"
    }
    try:
        make_archive(f'{path}_{ext}', ext, path)
        return FileResponse(f'{path}_{ext}.{ext_to_file_suffix[ext]}')
    except Exception as e:
        print(e)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="failed to create zip archive")


# ????????????????st_path??
# ?????????? DATA ?????????? ?????????? ???????? ????????????????????
# ???????????????? ???????? ???????????????????????? ?????????? ???? ???????????????????????? ???????????? ?????????????????? ???????????????????????? ??????????????
# ?????????? ?????????? ?????? ???????????????????? ??????????????

if __name__ == '__main__':

    try:
        err, res = database_interactions.simple_query("SELECT 1+2;")
    except:
        print('bad((')
    if err:
        print('bad')
    print("good!")
    # uvicorn.run(app, port=8000, host='127.0.0.1')
