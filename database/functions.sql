CREATE OR REPLACE FUNCTION user_token_expired("user" user_data_text)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF EXISTS(SELECT expire
              FROM tokens
              WHERE expire > CURRENT_TIMESTAMP + INTERVAL '3 HOURS')
    THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$

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

SELECT user_token_expired('andrey123');
SELECT user_valid_token('andrey', '37745dac-53da-4103-b019-fc91c1796f8a');

SELECT name, tags
FROM projects
WHERE owner = 'andrey123'
  AND parent_project IS NULL;

SELECT parent_project, name, tags
FROM projects
WHERE path_to = '/prog/cpp/meshloader'
  AND owner = 'andrey123';

SELECT id, name, split_part(name, '.', 2) AS extension
FROM files
WHERE owner = 'andrey123'
  AND path = '/prog/cpp/meshloader';

SELECT p1.name, p1.tags
FROM projects p1
         JOIN projects p2 ON p2.name = p1.parent_project
WHERE p2.path_to = '/prog/cpp'
  AND p2.owner = 'andrey123';

DELETE FROM projects WHERE owner = 'andrey123' AND name = 'cpp' AND path_to = 'prog/cpp';