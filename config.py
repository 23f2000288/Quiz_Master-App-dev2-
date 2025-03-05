class Config(object):
    DEBUG= False
    TESTING=False
    CACHE_TYPE="RedisCache"
    CACHE_DEFAULT_TIMEOUT = 300
    
    

class DevelopmentConfig(Config):
    DEBUG=True
    SQLALCHEMY_DATABASE_URI='sqlite:///quiz.db'
    SECRET_KEY='@faizkhan'
    SECURITY_PASSWORD_HASH="bcrypt"
    SECURITY_PASSWORD_SALT='@khanfaiz'
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    WTF_CSRF_ENABLED=False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    SECURITY_TOKEN_MAX_AGE = 3600  # optional, sets the token expiration time
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 3

    
