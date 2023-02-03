DROP FUNCTION IF EXISTS user_token_expired;
CREATE OR REPLACE FUNCTION user_token_expired("user" user_data_text)
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



