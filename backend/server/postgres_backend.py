from .settings import PostgresConfig
import psycopg2


class PostgresBackend:
    def __init__(self, config: PostgresConfig):
        self.config = config
        self.connection = None

    def disconnect(self):
        self.connection.close()

    def connect(self) -> bool:
        print('establishing connection')
        if not self.connection:
            try:
                self.connection = psycopg2.connect(
                    host=self.config.host,
                    port=self.config.port,
                    user=self.config.user,
                    password=self.config.password,
                    database=self.config.database,
                    connect_timeout=3
                )
            except Exception as e:
                print('psycopg2 connect error', e)
                return False
            else:
                self.connection.autocommit = True
                print('successful connection')
                return True
        return True

    @property
    def cursor(self):
        if not self.connection:
            success = self.connect()
            # TODO what to do if connection failed?
            if not success:
                raise Exception('failed to connect to database')
        return self.connection.cursor()

    def query(self, text, *args):
        if len(text) == 0:
            print('empty query, not executing, returning None')
            return None, None
        error_ = None
        result_ = None
        cursor = self.cursor
        try:
            cursor.execute(text, tuple(args))  # FIXME VERY DANGEROUS. VULNERABLE TO SQL INJECTION!!!!!!!!!!!!
            try:
                if 'SELECT' in text.upper():
                    column_names = list(
                        map(lambda x: x[0], cursor.description))
                    result_ = [column_names, [list(i)
                                              for i in cursor.fetchall()]]
                error_ = False
            except Exception as e:
                print('caught exception during query result fetching', e)
                error_ = e
                result_ = None
        except Exception as e:
            print('caught exception during query execution', e)
            error_ = e
            result_ = None
        else:
            error_ = False
            result = True
        self.cursor.close()
        return error_, result_
