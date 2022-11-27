drop type if exists user_role cascade;
drop type if exists project_tag cascade;
drop domain if exists user_data_text cascade;
drop domain if exists project_name_text cascade;
drop domain if exists file_name_text cascade;

CREATE TYPE user_role AS ENUM ('default', 'admin');
CREATE DOMAIN user_data_text VARCHAR(30) NOT NULL;
CREATE DOMAIN project_name_text VARCHAR(100);
CREATE DOMAIN file_name_text VARCHAR(255);

drop table if exists projects cascade;
drop table if exists users cascade;
drop table if exists files cascade;
drop table if exists tokens cascade;

CREATE TABLE IF NOT EXISTS users
(
    name     user_data_text PRIMARY KEY,
    password user_data_text NOT NULL,
    role     user_role      NOT NULL DEFAULT 'default'
);

CREATE TABLE IF NOT EXISTS projects
(
    owner          user_data_text NOT NULL REFERENCES users (name) ON DELETE CASCADE,
    parent_project project_name_text,
    name           project_name_text,
    tags           text,
    path_to        text,
    UNIQUE (owner, path_to)
);
-- TODO проверить всякие случаи когда у чего либо одинаковые имена в
--  разных ситуациях и если что изменить условия в UNIQUE
--  см UNIQUE NULLS NOT DISTINCT

-- INSERT INTO users(name, password, role)
-- VALUES ('andrey123', '123456789', 'admin'::user_role);
--
-- INSERT INTO projects(owner, name, tags, path_to)
-- VALUES ('andrey123', 'prog', '{"code"}', 'prog'),
--        ('andrey123', 'kikir', '{"math", "cpp"}', 'kikir');
--
-- INSERT INTO projects(owner, parent_project, name, tags, path_to)
-- VALUES ('andrey123', 'prog', 'cpp', '{"code", "cpp"}', 'prog/cpp'),
--        ('andrey123', 'prog', 'python', '{"code", "py"}', 'prog/python');
--
-- INSERT INTO projects(owner, parent_project, name, tags, path_to)
-- VALUES ('andrey123', 'cpp', 'meshloader', '{"code", "cpp"}', 'prog/cpp/meshloader'),
--        ('andrey123', 'cpp', 'stl', '{"code", "cpp"}', 'prog/cpp/stl'),
--        ('andrey123', 'python', 'flask-app', '{"code", "py"}', 'prog/python/flask-app'),
--        ('andrey123', 'python', 'tg-bot', '{"code", "py"}', 'prog/python/tg-bot');

CREATE TABLE IF NOT EXISTS files
(
    id             SERIAL PRIMARY KEY,
    owner          user_data_text,
    parent_project project_name_text NOT NULL,
    name           file_name_text    NOT NULL,
    path           text,
    FOREIGN KEY (owner, path) REFERENCES projects (owner, path_to) ON DELETE CASCADE
);

-- INSERT INTO files(owner, parent_project, name, path)
-- VALUES ('andrey123', 'meshloader', 'AneuMeshLoader.cpp', 'prog/cpp/meshloader'),
--        ('andrey123', 'meshloader', 'FiniteElement.cpp', 'prog/cpp/meshloader'),
--        ('andrey123', 'meshloader', 'Main.cpp', 'prog/cpp/meshloader'),
--        ('andrey123', 'meshloader', 'MeshLoader.h', 'prog/cpp/meshloader'),
--        ('andrey123', 'meshloader', 'AneuMeshLoader.h', 'prog/cpp/meshloader'),
--        ('andrey123', 'meshloader', 'FiniteElement.h', 'prog/cpp/meshloader'),
--        ('andrey123', 'meshloader', 'MeshLoader.cpp', 'prog/cpp/meshloader'),
--        ('andrey123', 'meshloader', 'Node.h', 'prog/cpp/meshloader'),
--        ('andrey123', 'cpp', 'clang-format.txt', 'prog/cpp'),
--        ('andrey123', 'prog', 'README.md', 'prog');

CREATE TABLE IF NOT EXISTS tokens
(
    username user_data_text REFERENCES users (name) ON DELETE CASCADE,
    token    uuid,
    expire   timestamp
);