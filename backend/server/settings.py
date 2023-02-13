import dataclasses
import json
from os import environ

# 3 hours in seconds
TOKEN_EXPIRE_DELTA_SECONDS = 3 * 60 * 60

DATA_DIR = 'data'


@dataclasses.dataclass
class PostgresConfig:
    host: str = 'localhost'
    port: int = 5432
    user: str = 'postgres'
    password: str = 'postgres'
    database: str = 'postgres'


def load_settings_from_file(path: str) -> PostgresConfig:
    print('loading settings from', path)
    try:
        print('successful read of', path)
        with open(path, 'r') as f:
            settings = json.load(f)
        print(settings)
        return PostgresConfig(**settings)
    except Exception as e:
        print(path, 'read error', e)
        return {}


def load_settings_from_env() -> PostgresConfig:
    print('loading settings from env')
    settings = {
        'host': environ.get('POSTGRES_IP', 'localhost'),
        'database': environ.get('POSTGRES_DB', 'postgres'),
        'user': environ.get('POSTGRES_USER', 'postgres'),
        'password': environ.get('POSTGRES_PASSWORD', 'postgres'),
        'port': environ.get('POSTGRES_PORT', 5432)
    }
    return PostgresConfig(
        host=settings['host'],
        database=settings['database'],
        user=settings['user'],
        port=settings['port'],
        password=settings['password'],
    )


def load_settings() -> PostgresConfig:
    config = load_settings_from_env()
    if not config:
        config = load_settings_from_file('db_settings.json')
    return config

def make_url() -> str:
    config = load_settings()
    print(config)
    port = f':{config.port}' if config.port else ''
    url = f"postgresql://{config.user}:{config.password}@{config.host}{port}/{config.database}"
    return url

