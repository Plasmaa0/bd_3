from pydantic import BaseModel


# database schemas

class User(BaseModel):
    name: str
    password: str
    role: str


class Classification(BaseModel):
    name: str
    parent_name: str


class Project(BaseModel):
    owner: str
    parent_project: str
    name: str
    tags: str
    path_to: str


class ProjectClass(BaseModel):
    owner: str
    path_to: str
    class_name: str


class Files(BaseModel):
    id: int
    owner: str
    parent_project: str
    name: str
    path_to: str


class Token(BaseModel):
    token: str
    owner: str
    expire: str


# additional schemas

class UserPageProject(BaseModel):
    name: str
    tags: str
    key: int
    classes: list[str]

class ProjectItems(BaseModel):
    files: list
    children: list

class ProjectPageProject:
    parent: []
    name: []
    tags: []
    items: ProjectItems
