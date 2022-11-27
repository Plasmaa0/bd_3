import json
import pprint
import time
import uuid
from datetime import datetime, timedelta
from typing import Tuple

import psycopg2

POSTGRES_CONNECTION_SETTINGS = {}

TOKEN_EXPIRE_DELTA_SECONDS = 3600


def load_settings(path: str):
    global POSTGRES_CONNECTION_SETTINGS
    try:
        print('successful read of', path)
        with open(path, 'r') as f:
            POSTGRES_CONNECTION_SETTINGS = json.load(f)
    except Exception as e:
        print(path, 'read error', e)


def get_connection():
    if not POSTGRES_CONNECTION_SETTINGS:
        load_settings('db_settings.json')
    if POSTGRES_CONNECTION_SETTINGS:
        try:
            conn = psycopg2.connect(host=POSTGRES_CONNECTION_SETTINGS['ip'],
                                    database=POSTGRES_CONNECTION_SETTINGS['db_name'],
                                    user=POSTGRES_CONNECTION_SETTINGS['username'],
                                    password=POSTGRES_CONNECTION_SETTINGS['password'],
                                    port=POSTGRES_CONNECTION_SETTINGS['port'], connect_timeout=3)
        except Exception as e:
            print('psycopg2 connect error', e)
            return None
        else:
            return conn
    # no connection
    return None


def simple_query(text):
    if len(text) == 0:
        return None, None
    error_ = None
    result_ = None
    try:
        connection = get_connection()
        connection.autocommit = True
        cursor = connection.cursor()
    except Exception as e:
        error_ = e
        result_ = None
    else:
        try:
            cursor.execute(text)
            if 'SELECT' in text.upper():
                column_names = list(
                    map(lambda x: x[0], cursor.description))
                result_ = [column_names, [list(i)
                                          for i in cursor.fetchall()]]
            error_ = False
        except Exception as e:
            error_ = e
            result_ = None
        else:
            error_ = False
            result = True
        cursor.close()
    return error_, result_


def user_token_expired(user: str) -> bool:
    err, res = simple_query(f"SELECT user_token_expired('{user}');")
    if err:
        # fixme
        pass
    else:
        return res[1][0][0]


def user_valid_token(user: str, token: str) -> bool:
    err, res = simple_query(f"SELECT user_valid_token('{user}', '{token}');")
    if err:
        # fixme
        return False
    else:
        return res[1][0][0]


def check_auth(user: str, token: str = '') -> Tuple[bool, str]:
    if len(user) == 0:
        print("no user given")
        return False, "no user given"
    if not is_user_exist(user):
        print("no such user")
        return False, "no such user"
    if len(token) == 0:
        print("no token given")
        return False, "no token given"
    elif user_token_expired(user):
        print("token expired")  # fixme error here
        return False, "token expired"
    elif not user_valid_token(user, token):
        print("invalid token")
        return False, "invalid token"
    return True, ""


def check_permissions_and_auth(user_page: str, user: str, token: str):
    success, msg = check_auth(user, token)
    if not success:
        return False, msg
    if len(user_page) == 0:
        print("no user given")
        return False, "no user given"
    if not is_user_exist(user_page):
        print("no such user")
        return False, "no such user"
    if user_page != user and get_user_role(user) != 'admin':
        return False, 'not allowed'
    return True, ""


def is_user_exist(user: str):
    err, res = simple_query(f"SELECT COUNT(*)=1 AS RESULT FROM users WHERE name = '{user}';")
    if err:
        # fixme
        pass
    else:
        return res[1][0][0]


def user_have_token(user: str) -> bool:
    err, res = simple_query(f"SELECT COUNT(*)=1 AS RESULT FROM tokens WHERE username = '{user}';")
    if err:
        # fixme
        pass
    else:
        return res[1][0][0]


def is_password_correct(user: str, password: str) -> bool:
    err, res = simple_query(f"SELECT COUNT(*)=1 AS is_valid FROM users WHERE name='{user}' AND password='{password}';")
    if err:
        # fixme
        pass
    else:
        return res[1][0][0]


def register_new_user(user: str, password: str) -> bool:
    err, res = simple_query(f"INSERT INTO users (name, password, role) VALUES ('{user}', '{password}', DEFAULT);")
    print(err, res)
    if err:
        # fixme
        return False
    else:
        return True


def generate_token(user: str) -> Tuple[bool, dict]:
    token = uuid.uuid4()
    print(token)
    expire = datetime.now() + timedelta(seconds=TOKEN_EXPIRE_DELTA_SECONDS)
    err, res = simple_query(
        f"INSERT INTO public.tokens(username, token, expire) VALUES('{user}', '{token}', '{expire}');")
    if err:
        # fixme
        return False, {}
    else:
        return get_token(user)


def get_token(user: str) -> Tuple[bool, dict]:
    err, res = simple_query(f"SELECT token, expire FROM tokens WHERE username = '{user}';")
    if err:
        # fixme
        return False, {}
    else:
        token_str, expire_datetime = res[1][0]
        token = uuid.UUID(token_str)
        expire = time.mktime(expire_datetime.timetuple())
        # print(token, expire_datetime)
        return True, {"token": str(token), "expire": expire}


def get_user_page(user: str):
    err, res = simple_query(f"SELECT name, tags FROM projects WHERE owner='{user}' AND parent_project IS NULL;")
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
            i += 1
            result.append(entry)
        print(result)
        return result


def get_project_page(user: str, project_path: str):
    # информация о проекте
    err, res = simple_query(
        f"SELECT parent_project, name, tags FROM projects WHERE path_to = '{project_path}' AND owner='{user}';")
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
        'items': {
            'files': [],
            'children': []
        }
    }
    # информация о файлах в проекте
    err, res = simple_query(
        f"SELECT name, split_part(name, '.', 2) AS extension FROM files WHERE owner = '{user}' AND path = '{project_path}';")
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
    err, res = simple_query(
        f"SELECT p1.name, p1.tags FROM projects p1 JOIN projects p2 ON p2.name=p1.parent_project AND p2.owner=p1.owner WHERE p2.path_to='{project_path}' AND p2.owner='{user}';")
    if err:
        # fixme
        return {}
    i = 0
    for child in res[1]:
        result['items']['children'].append({
            'name': child[0],
            'tags': child[1],
            'key': i
        })
        i += 1
    pprint.pprint(result)
    return result


def register_new_file(user: str, project_path: str, filename: str):
    parent = project_path.split('/')[-1]
    err, res = simple_query(
        f"INSERT INTO files(id, owner, parent_project, name, path) VALUES(DEFAULT, '{user}', '{parent}', '{filename}', '{project_path}');")
    print(err, res)


def remove_file(user: str, project_path: str) -> Tuple[bool, str]:
    arr = project_path.split('/')
    name = arr.pop()
    # print(f"DELETE FROM files WHERE owner='{user}' AND name={name} AND path='{'/'.join(arr)}';")
    err, res = simple_query(f"DELETE FROM files WHERE owner='{user}' AND name='{name}' AND path='{'/'.join(arr)}';")
    print(err, res)
    if err:
        return False, err
    else:
        return True, ''


def remove_project(user: str, project_path: str) -> Tuple[bool, str]:
    if '/' in project_path:
        arr = project_path.split('/')
        name = arr[-1]
        query = f"DELETE FROM projects WHERE owner = '{user}' AND name = '{name}' AND path_to = '{project_path}';"
    else:
        query = f"DELETE FROM projects WHERE owner = '{user}' AND name = '{project_path}' AND path_to = '{project_path}';"
    print(query)
    err, res = simple_query(query)
    if err:
        return False, err
    else:
        return True, ''


def create_project(user, project_path, tags):
    print(f'db create project {user} {project_path} {tags}')
    # return True
    if '/' in project_path:
        # nested project
        arr = project_path.split('/')
        parent = arr[-2]
        name = arr[-1]
        err, res = simple_query(
            f"INSERT INTO projects (owner, parent_project, name, tags, path_to) VALUES ('{user}', '{parent}', '{name}', '{tags}', '{'/'.join(arr)}');")
        # user page
        if err:
            print(err)
            return False
        else:
            return True
        pass
    else:
        err, res = simple_query(
            f"INSERT INTO projects (owner, parent_project, name, tags, path_to) VALUES ('{user}', null, '{project_path}', '{tags}', '{project_path}');")
        # user page
        if err:
            print(err)
            return False
        else:
            return True


def update_tags(user, project_path, tags):
    err, res = simple_query(
        f"UPDATE projects SET tags = '{tags}' WHERE owner = '{user}' AND path_to = '{project_path}';")
    if err:
        print(err, res)
        return False
    else:
        return True


def find_projects(owner: str, project: str, tags: str, limit: int):
    try:
        err, res = simple_query(
            f"SELECT owner, name, tags, path_to FROM projects WHERE owner ILIKE '{owner}' AND name ILIKE '{project}' AND tags ILIKE '{tags}' LIMIT {limit};")
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
                    'path_to': matching_project[3]
                })
                i += 1
            pprint.pprint(result)
            return True, result
    except:
        return False, {}


def find_users(user_to_find: str, role: str, limit: int):
    try:
        err, res = simple_query(
            f"SELECT name, role FROM users WHERE name ILIKE '{user_to_find}' AND role='{role}' LIMIT {limit};")
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
    except:
        return False, {}


def find_file(owner: str, parent_project: str, filename: str, path: str, limit: int):
    try:
        err, res = simple_query(
            f"SELECT owner, parent_project, name, path FROM files WHERE "
            f"owner ILIKE '{owner}' AND "
            f"parent_project ILIKE '{parent_project}' AND "
            f"name ILIKE '{filename}' AND path ILIKE '{path}' LIMIT {limit};")
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
    except:
        return False, {}


def get_user_role(user: str):
    err, res = simple_query(f"SELECT role FROM users WHERE name='{user}';")
    if err:
        print(err, res)
        return 'default'
    else:
        return res[1][0][0]


def edit_user_role(user: str, new_role: str):
    err, res = simple_query(f"UPDATE users SET role='{new_role}'::user_role WHERE name='{user}';")
    if err:
        print(err, res)
        return False
    else:
        return True


# for testing purposes
if __name__ == "__main__":
    print(get_user_role('andrey123'))
