DROP FUNCTION IF EXISTS user_token_expired;
CREATE OR REPLACE FUNCTION user_token_expired("user" user_data_text)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF EXISTS(SELECT expire
              FROM tokens t
              WHERE username = "user"
                AND (expire > CURRENT_TIMESTAMP + INTERVAL '3 HOURS'))
    THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

DROP FUNCTION IF EXISTS user_valid_token;
CREATE OR REPLACE FUNCTION user_valid_token("user" user_data_text, token_ uuid)
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
CREATE OR REPLACE FUNCTION class_children(class_name class_name_text)
    RETURNS TABLE
            (
                name_ class_name_text
            )
    LANGUAGE sql
AS
$$
SELECT name
FROM classification
WHERE parent_name = class_name
ORDER BY name;
$$;

-- SELECT class
-- FROM project_classes
-- WHERE owner = 'andrey123'
--   AND path_to = '123';

-- WITH RECURSIVE children AS (SELECT name, parent_name
--                             FROM classification
--                             WHERE name = 'root'
--                             UNION
--                             SELECT tp.name, tp.parent_name
--                             FROM classification tp
--                                      JOIN children c ON tp.parent_name = c.name)
-- SELECT name
-- FROM children
-- WHERE parent_name IS NOT NULL;

-- SELECT DISTINCT p.owner, name, tags, p.path_to, class
-- FROM projects p
--          JOIN project_classes pc on p.owner = pc.owner and p.path_to = pc.path_to
-- WHERE class = 'class-2'
--    OR class = 'class-3'
-- LIMIT 10;
