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

SELECT owner, name, tags, path_to
FROM projects
WHERE owner ILIKE 'andrey123'
  AND name ILIKE '%e%'
  AND tags ILIKE '%'
LIMIT 10;

SELECT name, role
FROM users
WHERE name ILIKE '%dr%'
  AND role = 'default'
LIMIT 10;

SELECT owner, parent_project, name, path
FROM files
WHERE owner ILIKE 'asdasd'
  AND parent_project ILIKE 'asdasd'
  AND name ILIKE 'asdasd'
  AND path ILIKE 'asdasd';

SELECT role FROM users WHERE name='andrey123';

UPDATE users SET role = 'admin'::user_role WHERE name='pukinzandr';
