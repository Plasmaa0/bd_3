DROP FUNCTION IF EXISTS user_token_expired;
CREATE OR REPLACE FUNCTION user_token_expired("user" text)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
AS
$f$
BEGIN
    IF EXISTS(SELECT expire
              FROM tokens t
              WHERE username = "user"
                AND (expire < CURRENT_TIMESTAMP))
    THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$f$;

DROP FUNCTION IF EXISTS user_valid_token;
CREATE OR REPLACE FUNCTION user_valid_token("user" text, token_ uuid)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF EXISTS(SELECT *
              FROM tokens
              WHERE username = "user"
                AND token = token_)
    THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

DROP FUNCTION IF EXISTS class_children;
CREATE OR REPLACE FUNCTION class_children(class_name text)
    RETURNS TABLE
            (
                name_ text
            )
    LANGUAGE sql
AS
$$
SELECT name
FROM classification
WHERE parent_name = class_name
ORDER BY name;
$$;

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- create function that compares two strings.
-- Returns True if levenstein distance is less than 3, False otherwise
DROP FUNCTION IF EXISTS levenshtein_compare;
CREATE OR REPLACE FUNCTION levenshtein_compare(str1 text, str2 text)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF levenshtein(str1, str2) < 3
    THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION remove_children() RETURNS trigger AS
$$
BEGIN
    DELETE
    FROM projects
    WHERE parent_project = OLD.name
      AND owner = OLD.owner
      AND (old.path_to || '/' || name) = path_to;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER cascade_deleting
    AFTER DELETE
    ON projects
    FOR EACH ROW
EXECUTE PROCEDURE remove_children();


