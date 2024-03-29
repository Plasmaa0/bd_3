from typing import List


class ProjectSearchFilter:
    def __init__(self, owner: str, project: str, tags: str, class_names: List[str], limit: int, only_top_level: bool):
        self.owner = owner
        self.project = project
        self.tags = tags
        self.class_names = class_names
        self.limit = limit
        self.only_top_level = only_top_level

    def owner_filter(self):
        if '%' in self.owner:
            return f"p.owner ILIKE %s ESCAPE ''"
        else:
            return f"levenshtein_compare(p.owner, %s)"

    def project_filter(self):
        if '%' in self.project:
            return f"p.name ILIKE %s ESCAPE ''"
        else:
            return f"levenshtein_compare(p.name, %s)"

    def tags_filter(self):
        if '%' in self.tags:
            return f"p.tags ILIKE %s ESCAPE ''"
        else:
            return f"levenshtein_compare(p.tags, %s)"

    def class_names_filter(self):
        return ' OR '.join([f"class = %s" for class_name in self.class_names])

    def null_filter(self):
        if self.only_top_level:
            return "AND parent_project IS NULL"
        return ""

    def limit_filter(self):
        return f"LIMIT %s"

    def args(self):
        print(self.owner, self.project, self.tags, *self.class_names, self.limit)
        return self.owner, self.project, self.tags, *self.class_names, self.limit

    def __str__(self):
        return f"{self.owner_filter()} " \
               f"AND {self.project_filter()} " \
               f"AND {self.tags_filter()} " \
               f"AND ({self.class_names_filter()}) " \
               f"{self.null_filter()} " \
               f"{self.limit_filter()}"
