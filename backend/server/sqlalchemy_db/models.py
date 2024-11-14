from sqlalchemy import \
    Column, \
    String, \
    ForeignKey, \
    Integer, \
    Boolean, \
    TIMESTAMP, \
    UUID, \
    UniqueConstraint, \
    ForeignKeyConstraint, \
    PrimaryKeyConstraint

from .database import Base


class Users(Base):
    __tablename__ = 'users'

    name = Column(String, primary_key=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default='default')

    def __repr__(self):
        return f"User(name='{self.name}', password='{self.password}', role='{self.role}')"


class Classification(Base):
    __tablename__ = 'classification'

    name = Column(String, primary_key=True, nullable=False)
    parent_name = Column(String, ForeignKey('classification.name', ondelete='CASCADE'), nullable=True)

    def __repr__(self):
        return f"Classification(name='{self.name}', parent_name='{self.parent_name}')"


class Projects(Base):
    __tablename__ = 'projects'
    __table_args__ = (
        UniqueConstraint('owner', 'path_to', name='projects_unique_owner_path_to'),
    )
    owner = Column(String, ForeignKey('users.name', ondelete='CASCADE'), primary_key=True, nullable=False)
    parent_project = Column(String)
    name = Column(String, nullable=False)
    tags = Column(String, nullable=False)
    path_to = Column(String, primary_key=True, nullable=False)

    def __repr__(self):
        return f"Projects(owner='{self.owner}', " \
               f"parent_project='{self.parent_project}', " \
               f"name='{self.name}', " \
               f"tags='{self.tags}', " \
               f"path_to='{self.path_to}')"


class ProjectClasses(Base):
    __tablename__ = 'project_classes'

    __table_args__ = (
        PrimaryKeyConstraint('owner', 'path_to'),
        UniqueConstraint('owner', 'path_to', name='projects_classes_unique_owner_path_to'),
        ForeignKeyConstraint(
            ["owner", "path_to"],
            ["projects.owner", "projects.path_to"],
            ondelete='CASCADE'
        ),
    )

    owner = Column(String, nullable=False)
    path_to = Column(String, nullable=False)
    class_name = Column(String, ForeignKey('classification.name', ondelete='CASCADE'), nullable=False)

    def __repr__(self):
        return f"ProjectClasses(owner='{self.owner}', " \
               f"path_to='{self.path_to}', " \
               f"class_name='{self.class_name}')"


class Files(Base):
    __tablename__ = 'files'

    __table_args__ = (
        PrimaryKeyConstraint('id'),
        UniqueConstraint('owner', 'path_to', 'name', name='files_unique_owner_path_to_name'),
        ForeignKeyConstraint(
            ["owner", "path_to"], ["projects.owner", "projects.path_to"], ondelete='CASCADE'
        ),
    )
    id = Column(Integer, nullable=False)
    owner = Column(String, nullable=False)
    parent_project = Column(String, nullable=False)
    name = Column(String, nullable=False)
    path_to = Column(String, nullable=False)

    def __repr__(self):
        return f"Files(id='{self.id}', " \
               f"owner='{self.owner}', " \
               f"parent_project='{self.parent_project}', " \
               f"name='{self.name}', " \
               f"path_to='{self.path_to}')"


class Configuration(Base):
    __tablename__ = 'configuration'

    first_user_registered = Column(Boolean)
    
class Tokens(Base):
    __tablename__ = 'tokens'

    token = Column(UUID, primary_key=True, nullable=False)
    owner = Column(String, ForeignKey('users.name', ondelete='CASCADE'), nullable=False)
    expire = Column(TIMESTAMP, nullable=False)

    def __repr__(self):
        return f"Tokens(token='{self.token}', " \
               f"owner='{self.owner}', " \
               f"expire='{self.expire}')"
