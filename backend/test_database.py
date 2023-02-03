# 1 functions to test
#   2 user_token_expired
#   3 user_valid_token
#   4 is_user_exist
#   5 user_have_token
#   6 check_auth
#   7 check_permissions_and_auth
#   8 is_password_correct
#   9 register_new_user
#   10 generate_token
#   11 get_token
# 12 get_project_classes
# 13 get_user_page
# 14 get_project_page
# 15 register_new_file
# 16 remove_file
# 17 remove_project
#   18 create_project
# 19 update_tags
# 20 find_projects
# 21 find_users
# 22 find_file
#   23 get_user_role
#   24 edit_user_role
# 25 update_class_tree
# 26 get_class_tree
# 27 link_project
# 28 find_projects_by_class
# 29 remove_class
# 30 add_child_class
#   31 init_db

import pytest

# from backend.server.database_interactions import Database
from backend.server.sqlalchemy_db import backend

test_class = backend

test_class.init_db(['database/tables.sql', 'database/functions.sql'])


def may_raise(func):
    from sqlalchemy.exc import IntegrityError
    try:
        retval = func()
    except IntegrityError as e:
        print('Got exception that was expected: ', type(e))
    else:
        if retval is not None:
            return retval


may_raise(lambda: test_class.register_new_user('first_user', 'first_user'))


def test_register_new_user():
    """
    9 register_new_user
    4 is_user_exist
    """
    registered = test_class.register_new_user('test', 'test')
    assert registered
    assert not test_class.register_new_user('test', 'test')
    assert test_class.is_user_exist('test')
    assert not test_class.is_user_exist('im_not_exist')


def test_first_user_admin():
    assert test_class.get_user_role('first_user') == 'admin'


def test_get_user_role():
    assert test_class.get_user_role('first_user') == 'admin'
    assert test_class.get_user_role('test') == 'default'
    with pytest.raises(Exception):
        assert test_class.get_user_role('im_not_exist') == 'user'


def test_edit_user_role():
    """
    24 edit_user_role
    """
    assert test_class.edit_user_role('test', 'default')
    assert test_class.get_user_role('test') == 'default'
    assert test_class.edit_user_role('test', 'admin')
    assert test_class.get_user_role('test') == 'admin'
    # assert not test_class.edit_user_role('im_not_exist', 'default') # fixme should not pass


def test_is_password_correct():
    """
    8 is_password_correct
    """
    assert test_class.is_password_correct('test', 'test')
    assert not test_class.is_password_correct('test', 'im_not_exist')
    assert not test_class.is_password_correct('im_not_exist', 'test')
    assert not test_class.is_password_correct('im_not_exist', 'im_not_exist')


def test_generate_get_token():
    """
    10 generate_token
    11 get_token
    """
    gen_success, gen_token_dict = test_class.generate_token('test')
    assert gen_success
    get_success, get_token_dict = test_class.get_token('test')
    assert get_success
    assert gen_token_dict['token'] == get_token_dict['token']
    assert gen_token_dict['expire'] == get_token_dict['expire']


def test_user_token_expired():
    """
    2 user_token_expired
    """
    assert not test_class.user_token_expired('test')
    test_class.backend.query('UPDATE tokens SET expire = NOW() - INTERVAL \'2 days\' WHERE username = \'test\';')
    assert test_class.user_token_expired('test')
    test_class.backend.query('UPDATE tokens SET expire = NOW() + INTERVAL \'2 days\' WHERE username = \'test\';')
    assert not test_class.user_token_expired('test')


def test_user_have_token():
    """
    5 user_have_token
    """
    assert test_class.user_have_token('test')
    assert not test_class.user_have_token('im_not_exist')
    test_class.register_new_user('test2', 'test2')
    assert not test_class.user_have_token('test2')


def test_user_valid_token():
    """
    3 user_valid_token
    """
    valid_token_for_test_user = test_class.get_token('test')[1]['token']
    assert test_class.user_valid_token('test', valid_token_for_test_user)
    assert not test_class.user_valid_token('test', 'totally_not_valid_token')
    assert not test_class.user_valid_token('im_not_exist', 'totally_not_valid_token')
    assert not test_class.user_valid_token('im_not_exist', valid_token_for_test_user)


def test_check_auth():
    """
    6 check_auth
    """
    token = test_class.get_token('test')[1]['token']
    assert test_class.check_auth('test', token)[0]
    assert not test_class.check_auth('test', 'totally_not_valid_token')[0]
    assert not test_class.check_auth('im_not_exist', 'totally_not_valid_token')[0]
    assert not test_class.check_auth('im_not_exist', token)[0]
    assert not test_class.check_auth('test2', token)[0]


may_raise(lambda: test_class.register_new_user('admin_user', 'admin'))
may_raise(lambda: test_class.edit_user_role('admin_user', 'admin'))
may_raise(lambda: test_class.register_new_user('other_admin_user', 'admin'))
may_raise(lambda: test_class.edit_user_role('other_admin_user', 'admin'))
may_raise(lambda: test_class.register_new_user('default_user', 'default'))
may_raise(lambda: test_class.register_new_user('other_default_user', 'default'))

admin_token = test_class.generate_token('admin_user')[1]['token']
default_token = test_class.generate_token('default_user')[1]['token']
other_admin_token = test_class.generate_token('other_admin_user')[1]['token']
other_default_token = test_class.generate_token('other_default_user')[1]['token']


class TestPermissionsAndAuth:
    def test_access_admin_to_self(self):
        assert test_class.check_permissions_and_auth('admin_user', 'admin_user', admin_token)[0]

    def test_access_default_to_self(self):
        assert test_class.check_permissions_and_auth('default_user', 'default_user', default_token)[0]

    def test_access_admin_to_other(self):
        assert test_class.check_permissions_and_auth('default_user', 'admin_user', admin_token)[0]
        assert test_class.check_permissions_and_auth('other_admin_user', 'admin_user', admin_token)[0]

    def test_access_default_to_other(self):
        assert not test_class.check_permissions_and_auth('admin_user', 'default_user', default_token)[0]
        assert not test_class.check_permissions_and_auth('other_admin_user', 'default_user', default_token)[0]
        assert not test_class.check_permissions_and_auth('other_default_user', 'default_user', default_token)[0]
        assert test_class.check_permissions_and_auth('default_user', 'default_user', default_token)[0]


tags = 'tag1,tag2,tag3'


class TestCreateProject:
    def test_create_top_level_project(self):
        assert test_class.create_project('admin_user', 'test_project', tags)
        assert test_class.create_project('default_user', 'test_project', tags)

    def test_create_sub_level_project(self):
        assert test_class.create_project('admin_user', 'test_project/test_project2', tags)
        assert test_class.create_project('default_user', 'test_project/test_project2', tags)

    def test_create_duplicate_project(self):
        assert not test_class.create_project('admin_user', 'test_project', tags)
        assert not test_class.create_project('default_user', 'test_project', tags)
        assert not test_class.create_project('admin_user', 'test_project/test_project2', tags)
        assert not test_class.create_project('default_user', 'test_project/test_project2', tags)


class TestRemoveProject:
    # create projects for remove tests before removing them in every test

    def create_projects_for_tests(self):
        test_class.create_project('admin_user', 'test_project/test_project2', tags)
        test_class.create_project('default_user', 'test_project/test_project2', tags)
        test_class.create_project('admin_user', 'test_project/test_project2/test_project3', tags)
        test_class.create_project('default_user', 'test_project/test_project2/test_project3', tags)
        test_class.create_project('admin_user', 'test_project/test_project2/test_project3/test_project4', tags)
        test_class.create_project('default_user', 'test_project/test_project2/test_project3/test_project4', tags)

    def test_remove_top_level_project(self):
        self.create_projects_for_tests()
        assert test_class.remove_project('admin_user', 'test_project')
        assert test_class.remove_project('default_user', 'test_project')
        # todo: check if nested projects were removed
        #  (test_project2, test_project2/test_project3, test_project2/test_project3/test_project4)

    def test_remove_sub_level_project(self):
        self.create_projects_for_tests()
        assert test_class.remove_project('admin_user', 'test_project/test_project2')
        assert test_class.remove_project('default_user', 'test_project/test_project2')
        # todo: check if nested projects were removed
        #  (test_project2/test_project3, test_project2/test_project3/test_project4)
        #  and if top level project was not removed (test_project)
