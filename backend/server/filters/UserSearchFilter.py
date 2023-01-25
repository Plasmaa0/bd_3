class UserSearchFilter:
    def __init__(self, user_to_find: str, role: str, limit: int):
        self.user_to_find = user_to_find
        self.role = role
        self.limit = limit

    def username_filter(self):
        if '%' in self.user_to_find:
            return f"name ILIKE %s ESCAPE ''"
        else:
            return f"levenshtein_compare(name, %s)"

    def role_filter(self):
        return f"role=%s"

    def limit_filter(self):
        return f"LIMIT %s"

    def args(self):
        return self.user_to_find, self.role, self.limit

    def __str__(self):
        return f"{self.username_filter()}" \
               f"AND {self.role_filter()} " \
               f"{self.limit_filter()};"
