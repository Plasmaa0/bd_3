import dataclasses
import json
from os import environ

# 3 hours in seconds
TOKEN_EXPIRE_DELTA_SECONDS = 3 * 60 * 60

DATA_DIR = 'data'


@dataclasses.dataclass
class PostgresConfig:
    host: str
    port: int
    user: str
    password: str
    database: str


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
        'ip': environ.get('POSTGRES_IP', 'localhost'),
        'db_name': environ.get('POSTGRES_DB_NAME', 'postgres'),
        'username': environ.get('POSTGRES_USERNAME', 'postgres'),
        'password': environ.get('POSTGRES_PASSWORD', 'postgres'),
        'port': environ.get('POSTGRES_PORT', 5432)
    }
    print(settings)
    return PostgresConfig(
        host=settings['ip'],
        port=settings['port'],
        user=settings['username'],
        password=settings['password'],
        database=settings['db_name']
    )


def load_settings() -> PostgresConfig:
    config = load_settings_from_env()
    if not config:
        config = load_settings_from_file('db_settings.json')
    return config
