"""config.py."""
from configparser import ConfigParser
import psycopg2
from psycopg2 import pool

config = ConfigParser()
config.read("config.ini")

# frontend
info_log = config["ui"]["info_log"]
error_log = config["ui"]["error_log"]

# Dev DB
def put_test(conn, key=None):
    # print("Close Connection")
    getattr(get_test, 'test_pool').putconn(conn, key=key)

def get_test(key=None):
    # print("Get Connection")
    return getattr(get_test, 'test_pool').getconn(key)

try:
    # Dev DB
    setattr(get_test, 'test_pool', pool.ThreadedConnectionPool(
            1, 1000,
            user=config["postgresDB"]["user"],
            password=config["postgresDB"]["password"],
            host=config["postgresDB"]["host"],
            port=config["postgresDB"]["port"],
            database=config["postgresDB"]["database"]
            ))
except psycopg2.OperationalError as e:
    print(e)


class BaseConfig:
    CORS_METHODS = ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"]
    CORS_ORIGINS = "*"
    CORS_RESOURCES = r"/*"
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_ALWAYS_SEND = True
    CORS_ALLOW_HEADERS = "*"
    CORS_MAX_AGE = None
    CORS_AUTOMATIC_OPTIONS = True

class ProdConfig(BaseConfig):
    FLASK_ENV = 'Production'
    DEBUG = False
    TESTING = False

class DevConfig(BaseConfig):
    FLASK_ENV = 'Development'
    DEBUG = True
    TESTING = True

# class CorsConfig(BaseConfig):
#     CORS_METHODS = ["GET","PUT", "POST","DELETE", "HEAD", "OPTIONS"]
#     CORS_ORIGINS = "*"
#     CORS_RESOURCES = [r"/shipapi", r"/user"]
#     CORS_SUPPORTS_CREDENTIALS = True
#     CORS_ALWAYS_SEND = True
#     CORS_ALLOW_HEADERS = "*"
#     CORS_MAX_AGE = None
#     CORS_AUTOMATIC_OPTIONS = True
