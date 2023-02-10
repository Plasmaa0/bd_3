drop type if exists user_role cascade;
drop type if exists project_tag cascade;
drop domain if exists user_data_text cascade;
drop domain if exists project_name_text cascade;
drop domain if exists file_name_text cascade;
drop domain if exists class_name_text cascade;

CREATE TYPE user_role AS ENUM ('default', 'admin');
CREATE DOMAIN user_data_text VARCHAR(30) NOT NULL;
CREATE DOMAIN project_name_text VARCHAR(100);
CREATE DOMAIN class_name_text VARCHAR(100);
CREATE DOMAIN file_name_text VARCHAR(255);

drop table if exists projects cascade;
drop table if exists users cascade;
drop table if exists files cascade;
drop table if exists tokens cascade;
drop table if exists project_classes cascade;
drop table if exists classification cascade;

CREATE TABLE IF NOT EXISTS users
(
    name     user_data_text PRIMARY KEY,
    password user_data_text NOT NULL,
    role     user_role      NOT NULL DEFAULT 'default'
);

CREATE TABLE IF NOT EXISTS classification
(
    name        class_name_text PRIMARY KEY,
    parent_name class_name_text REFERENCES classification (name) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS project_classes
(
    owner   user_data_text,
    path_to text,
    class   class_name_text REFERENCES classification (name) ON DELETE SET NULL,
    UNIQUE (owner, path_to),
    FOREIGN KEY (owner, path_to) REFERENCES projects (owner, path_to) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files
(
    id             SERIAL PRIMARY KEY,
    owner          user_data_text,
    parent_project project_name_text NOT NULL,
    name           file_name_text    NOT NULL,
    path           text,
    UNIQUE (owner, path, name),
    FOREIGN KEY (owner, path) REFERENCES projects (owner, path_to) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tokens
(
    username user_data_text REFERENCES users (name) ON DELETE CASCADE,
    token    uuid,
    expire   timestamp,
    UNIQUE (username)
);

INSERT INTO classification(name)
VALUES ('root');
-- INSERT INTO classification(name, parent_name)
-- VALUES ('class-1', 'root'),
--        ('class-2', 'root'),
--        ('class-3', 'root');
-- INSERT INTO classification(name, parent_name)
-- VALUES ('class-1-1', 'class-1'),
--        ('class-1-2', 'class-1'),
--        ('class-2-1', 'class-2');
-- INSERT INTO classification(name, parent_name)
-- VALUES ('class-2-1-1', 'class-2-1');