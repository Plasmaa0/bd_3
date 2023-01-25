class FileSearchFilter:
    def __init__(self, owner: str, parent_project: str, filename: str, path: str, limit: int):
        self.owner = owner
        self.parent_project = parent_project
        self.filename = filename
        self.path = path
        self.limit = limit

    def owner_filter(self):
        if '%' in self.owner:
            return f"owner ILIKE '{self.owner}'"
        else:
            return f"levenshtein_compare(owner, '{self.owner}')"

    def parent_project_filter(self):
        if '%' in self.parent_project:
            return f"parent_project ILIKE '{self.parent_project}'"
        else:
            return f"levenshtein_compare(parent_project, '{self.parent_project}')"

    def filename_filter(self):
        if '%' in self.filename:
            return f"name ILIKE '{self.filename}'"
        else:
            return f"levenshtein_compare(name, '{self.filename}')"

    def path_filter(self):
        if '%' in self.path:
            return f"path ILIKE '{self.path}'"
        else:
            return f"levenshtein_compare(path, '{self.path}')"

    def limit_filter(self):
        return f"LIMIT {self.limit}"

    def __str__(self):
        return f"{self.owner_filter()} " \
               f"AND {self.parent_project_filter()} " \
               f"AND {self.filename_filter()} " \
               f"AND {self.path_filter()} " \
               f"{self.limit_filter()}"
