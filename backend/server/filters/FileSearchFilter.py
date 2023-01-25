class FileSearchFilter:
    def __init__(self, owner: str, parent_project: str, filename: str, path: str, limit: int):
        self.owner = owner
        self.parent_project = parent_project
        self.filename = filename
        self.path = path
        self.limit = limit

    def owner_filter(self):
        if '%' in self.owner:
            return f"owner ILIKE %s ESCAPE ''"
        else:
            return f"levenshtein_compare(owner, %s)"

    def parent_project_filter(self):
        if '%' in self.parent_project:
            return f"parent_project ILIKE %s ESCAPE ''"
        else:
            return f"levenshtein_compare(parent_project, %s)"

    def filename_filter(self):
        if '%' in self.filename:
            return f"name ILIKE %s ESCAPE ''"
        else:
            return f"levenshtein_compare(name, %s)"

    def path_filter(self):
        if '%' in self.path:
            return f"path ILIKE %s ESCAPE ''"
        else:
            return f"levenshtein_compare(path, %s)"

    def limit_filter(self):
        return f"LIMIT %s"

    def args(self):
        return self.owner, self.parent_project, self.filename, self.path, self.limit

    def __str__(self):
        return f"{self.owner_filter()} " \
               f"AND {self.parent_project_filter()} " \
               f"AND {self.filename_filter()} " \
               f"AND {self.path_filter()} " \
               f"{self.limit_filter()}"
