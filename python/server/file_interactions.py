import os
from typing import Tuple

DATA_DIR = '../data'


def get_file(user, file_path):
    # fixme prevent loading too big files
    full_filepath = f"{DATA_DIR}/{user}/{file_path}"
    try:
        with open(full_filepath, 'r') as f:
            strings = f.readlines()
        print(''.join(strings))
    except OSError as e:
        return 'Error reading file, ' + str(e)
    else:
        return ''.join(strings)


def encode_html(data: str):
    return data.replace('\n', '<br>')


def create_user_directory(user: str):
    if user not in os.listdir(DATA_DIR):
        os.mkdir(f"{DATA_DIR}/{user}")


# todo
def create_project(user: str, path: str):
    pass


# todo
def add_file(user: str, path: str, data: bytes):
    pass


def remove_file(user, project_path) -> Tuple[bool, str]:
    full_filepath = f"{DATA_DIR}/{user}/{project_path}"
    try:
        os.remove(full_filepath)
        return True, ''
    except Exception as e:
        print('failed to remove')
        return False, str(e)


def remove_directory(user: str, project_path: str) -> Tuple[bool, str]:
    full_filepath = f"{DATA_DIR}/{user}/{project_path}"
    try:
        os.rmdir(full_filepath)  # fixme do it recursiveliy
        return True, ''
    except Exception as e:
        print('failed to remove')
        return False, str(e)


def create_directory(user, project_path):
    full_filepath = f"{DATA_DIR}/{user}/{project_path}"
    try:
        os.mkdir(full_filepath)
        return True
    except:
        return False


# for testing purposes
if __name__ == "__main__":
    file = get_file('123', '23')
    print(file)
    file = get_file('andrey123', 'prog/README.md')
    print(file)
