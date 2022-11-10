drop type if exists user_role cascade;
drop type if exists project_tag cascade;
drop domain if exists user_data_text cascade;
drop domain if exists project_name_text cascade;
drop domain if exists file_name_text cascade;

CREATE TYPE user_role AS ENUM ('default', 'admin');
CREATE TYPE project_tag AS ENUM ('code', 'math', 'cpp', 'py');
CREATE DOMAIN user_data_text VARCHAR(30) NOT NULL;
CREATE DOMAIN project_name_text VARCHAR(100);
CREATE DOMAIN file_name_text VARCHAR(255);

drop table if exists projects cascade;
drop table if exists users cascade;
drop table if exists files cascade;

CREATE TABLE IF NOT EXISTS users
(
    name     user_data_text PRIMARY KEY,
    password user_data_text NOT NULL,
    role     user_role      NOT NULL
);

CREATE TABLE IF NOT EXISTS projects
(
    owner          user_data_text NOT NULL REFERENCES users (name) ON DELETE CASCADE,
    parent_project project_name_text,
    name           project_name_text,
    tags           project_tag[],
    UNIQUE (owner, name),
    FOREIGN KEY (owner, parent_project) REFERENCES projects (owner, name) ON DELETE CASCADE
);
-- TODO проверить всякие случаи когда у чего либо одинаковые имена в
--  разных ситуациях и если что изменить условия в UNIQUE
--  см UNIQUE NULLS NOT DISTINCT

INSERT INTO users(name, password, role)
VALUES ('andrey', '123456789', 'admin'::user_role),
       ('senya', '123456789', 'default'::user_role);

INSERT INTO projects(owner, name, tags)
VALUES ('andrey', 'prog', '{"code"}');

INSERT INTO projects(owner, parent_project, name, tags)
VALUES ('andrey', 'prog', 'cpp', '{"code", "cpp"}'),
       ('andrey', 'prog', 'python', '{"code", "py"}');

INSERT INTO projects(owner, parent_project, name, tags)
VALUES ('andrey', 'cpp', 'meshloader', '{"code", "cpp"}'),
       ('andrey', 'cpp', 'stl', '{"code", "cpp"}'),
       ('andrey', 'python', 'flask-app', '{"code", "py"}'),
       ('andrey', 'python', 'tg-bot', '{"code", "py"}');

CREATE TABLE IF NOT EXISTS files
(
    id             SERIAL PRIMARY KEY,
    owner          user_data_text,
    parent_project project_name_text NOT NULL,
    name           file_name_text    NOT NULL,
    UNIQUE (parent_project, name),
    FOREIGN KEY (owner, parent_project) REFERENCES projects (owner, name) ON DELETE CASCADE
);

INSERT INTO files(owner, parent_project, name)
VALUES ('andrey', 'meshloader', '/src/AneuMeshLoader.cpp'),
       ('andrey', 'meshloader', '/src/FiniteElement.cpp'),
       ('andrey', 'meshloader', '/src/Main.cpp'),
       ('andrey', 'meshloader', '/src/MeshLoader.h'),
       ('andrey', 'meshloader', '/src/AneuMeshLoader.h'),
       ('andrey', 'meshloader', '/src/FiniteElement.h'),
       ('andrey', 'meshloader', '/src/MeshLoader.cpp'),
       ('andrey', 'meshloader', '/src/Node.h');