DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE IF NOT EXISTS users
(
    username VARCHAR(50) NOT NULL PRIMARY KEY,
    password VARCHAR(50) NOT NULL,
    role     VARCHAR(50) NOT NULL DEFAULT 'default'
);

CREATE TABLE IF NOT EXISTS projects
(
    owner          VARCHAR(50)  NOT NULL REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
    parent_project_path VARCHAR(255),
    name           VARCHAR(255) NOT NULL,
    tags           text,
    path_to        text, -- relative to owner
    PRIMARY KEY (owner, path_to),
    FOREIGN KEY (owner, parent_project_path) REFERENCES projects (owner, path_to) ON DELETE CASCADE ON UPDATE CASCADE
);

-- create trigger on insert or update to projects to auto-fill name column
CREATE OR REPLACE FUNCTION fill_name_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.name = split_part(NEW.path_to, '/', -1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fill_name_column ON projects;

CREATE TRIGGER fill_name_column
    BEFORE INSERT OR UPDATE
    ON projects
    FOR EACH ROW
EXECUTE PROCEDURE fill_name_column();

-- create trigger on insert or update to projects to auto-fill parent_project column
CREATE OR REPLACE FUNCTION fill_parent_project_column()
    RETURNS TRIGGER AS
$$
BEGIN
    -- if path_to contains a slash, then the parent project is the part before the last slash
    IF NEW.path_to LIKE '%/%' THEN
        -- get index of last slash in path_to and get substring before it
        NEW.parent_project_path = substring(NEW.path_to, 1, length(NEW.path_to) - position('/' in reverse(NEW.path_to)));
    ELSE
        -- if path_to does not contain a slash, then the parent project is null
        NEW.parent_project_path = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fill_parent_project_column ON projects;

CREATE TRIGGER fill_parent_project_column
    BEFORE INSERT OR UPDATE
    ON projects
    FOR EACH ROW
EXECUTE PROCEDURE fill_parent_project_column();

-- add user
INSERT INTO users (username, password, role)
VALUES ('admin', 'admin', 'admin');

-- add project
INSERT INTO projects (owner, tags, path_to)
VALUES ('admin', '["tag1", "tag2"]', 'project');
-- add subproject
INSERT INTO projects (owner, tags, path_to)
VALUES ('admin', '["tag1", "tag2"]', 'project/subproject');
INSERT INTO projects (owner, tags, path_to)
VALUES ('admin', '["tag1", "tag2"]', 'project/subproject2');
INSERT INTO projects (owner, tags, path_to)
VALUES ('admin', '["tag1", "tag2"]', 'project/project');

-- add user
INSERT INTO users (username, password, role)
VALUES ('user', 'user', 'default');

-- add project
INSERT INTO projects (owner, tags, path_to)
VALUES ('user', '["tag1", "tag2"]', 'project');
-- add subproject
INSERT INTO projects (owner, tags, path_to)
VALUES ('user', '["tag1", "tag2"]', 'project/subproject');
INSERT INTO projects (owner, tags, path_to)
VALUES ('user', '["tag1", "tag2"]', 'project/subproject2');
INSERT INTO projects (owner, tags, path_to)
VALUES ('user', '["tag1", "tag2"]', 'project/project');

-- add nested project
INSERT INTO projects (owner, tags, path_to)
VALUES ('admin', '["tag1", "tag2"]', 'project/subproject/nestedproject');