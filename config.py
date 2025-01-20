class Config(object):
    DEBUG= False
    TESTING=False
    
    

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
