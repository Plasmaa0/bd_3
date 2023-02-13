from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from settings import make_url

# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost/postgres"
SQLALCHEMY_DATABASE_URL = make_url()


engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
