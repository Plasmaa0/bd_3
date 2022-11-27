import time
import uuid
import uvicorn
from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse, JSONResponse
from os import listdir
from datetime import datetime, timedelta

from starlette.responses import JSONResponse

app = FastAPI()

DATA_DIR = "../data"

GLOBAL_HEADERS = {"Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"}

import database_interactions
import file_interactions

from fastapi.middleware.cors import CORSMiddleware

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/edit_tags/{user}/{project_path:path}")
async def edit_tags(user: str, project_path: str, tags: str = '', token: str = ''):
    print(user, project_path, tags, token)
    # todo mb extract token validation to function?
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    if database_interactions.update_tags(user, project_path, tags):
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content='updated tags successfully')
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="failed to update tags")


@app.post("/uploadfiles/{user}/{project_path:path}")
async def create_upload_file(user: str, project_path: str, file: UploadFile, token: str = '',
                             overwrite: bool = False):
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if not database_interactions.is_user_exist(user):  # FIXME user directory must be created when user registers
        print("no such user " + user)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=("no such user " + user))
    try:
        user_project_path = DATA_DIR + '/' + user + '/' + project_path
        filepath = user_project_path + '/' + file.filename
        if file.filename in listdir(user_project_path) and (not overwrite):
            # todo what to do here? (file already exists)
            return JSONResponse(headers=GLOBAL_HEADERS, status_code=200,
                                content="file '" + file.filename + "' already exists and overwrite=False")
        with open(filepath, "wb") as f:
            f.write(await file.read())
    except Exception as e:
        print(e)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="caught exception")
    else:
        database_interactions.register_new_file(user, project_path, file.filename, filepath)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="written " + file.filename)


@app.get("/rm/{user}/{project_path:path}")
async def remove_file(user: str, project_path: str, token: str = ''):
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if not database_interactions.is_user_exist(user):  # FIXME user directory must be created when user registers
        print("no such user " + user)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=("no such user " + user))
    if file_interactions.remove_file(user, project_path) and database_interactions.remove_file(user, project_path):
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="removed " + project_path)
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="error removing " + project_path)


@app.get("/rmdir/{user}/{project_path:path}")
async def remove_directory(user: str, project_path: str, token: str = ''):
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if not database_interactions.is_user_exist(user):  # FIXME user directory must be created when user registers
        print("no such user " + user)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=("no such user " + user))
    if file_interactions.remove_directory(user, project_path) and database_interactions.remove_project(user,
                                                                                                       project_path):
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content="removed " + project_path)
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content="error removing " + project_path)


@app.get("/mkdir/{user}/{project_path:path}")
async def create_directory(user: str, project_path: str, token: str = '', tags: str = ''):
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)

    if not database_interactions.is_user_exist(user):  # FIXME user directory must be created when user registers
        print("no such user " + user)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=500, content=("no such user " + user))
    if file_interactions.create_directory(user, project_path) and database_interactions.create_project(user,
                                                                                                       project_path,
                                                                                                       tags):
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
                return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=json_token)
            else:
                return JSONResponse(headers=GLOBAL_HEADERS, status_code=500,
                                    content="Internal error. failed to generate token")
        else:
            success, json_token = database_interactions.get_token(user)
            # return existing token
            if success:
                print("token success not expired", json_token)
                return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=json_token)
            else:
                return JSONResponse(headers=GLOBAL_HEADERS, status_code=500,
                                    content="Internal error. failed to retrieve token from database")
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content="wrong password!")


@app.get("/dir/{user}")
async def user_page(user: str, token: str = ''):
    print('user page', user)
    # todo mb extract token validation to function?
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    files = database_interactions.get_user_page(user)
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=files)


@app.get("/dir/{user}/{project_path:path}")
async def project_page(user: str, project_path: str, token: str = ''):
    # todo mb extract token validation to function?
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    files = database_interactions.get_project_page(user, project_path)
    print(time.time())
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200, content=files)


@app.get("/file/{user}/{file_path:path}")
async def file_page(user: str, file_path: str, token: str = ''):
    # todo mb extract token validation to function?
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    file_data = file_interactions.get_file(user, file_path)
    # fixme how to return file contents?
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=200,
                        content={'data': file_interactions.encode_html(file_data)})


@app.get("/search/{search_type}/{user}")
async def search(search_type: str, user: str, request: Request, token: str = ''):
    print(search_type, user, token)
    # todo introduce new parameter at fronted form: limit (for every type of search)
    # todo mb extract token validation to function?
    success, msg = database_interactions.validate_user_and_token(user, token)
    if not success:
        print(msg)
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=401, content=msg)
    # todo get user role from db to perform future validations
    if search_type == 'projects':
        owner = request.query_params['owner']
        project = request.query_params['project']
        tags = request.query_params['tags']
        print(owner, project, tags)
        if user != owner:
            # fixme check if admin
            pass
        database_interactions.find_projects(owner, project, tags)
    elif search_type == 'users':
        user_to_find = request.query_params['user']
        print(user_to_find)
        # fixme check if admin
        database_interactions.find_user(user_to_find)
    elif search_type == 'files':
        owner = request.query_params['owner']
        filename = request.query_params['filename']
        print(owner, filename)
        if user != owner:
            # fixme check if admin
            pass
        database_interactions.find_file(owner, filename)
    else:
        return JSONResponse(headers=GLOBAL_HEADERS, status_code=201, content="Unsupported search type")
    return JSONResponse(headers=GLOBAL_HEADERS, status_code=201, content="April fools!")  # fixme remove this


if __name__ == '__main__':
    uvicorn.run(app, port=8000, host='127.0.0.1')
