import os
from dotenv import load_dotenv
load_dotenv()

from datetime import timedelta

class AuthConfig:
    """Authentication configuration settings"""
    
    # Session settings
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not set in environment variables")
    SESSION_TYPE = 'filesystem'  # or 'mongodb' for production
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)  # for "remember me"
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_NAME = 'hirekruit_session'
    
    # Email settings
    MAIL_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('SMTP_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False') == 'True'
    MAIL_USERNAME = os.getenv('EMAIL_USER')
    MAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', os.getenv('EMAIL_USER'))
    
    # OTP settings
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_OTP_ATTEMPTS = 5
    
    # Password settings
    MIN_PASSWORD_LENGTH = 8
    BCRYPT_LOG_ROUNDS = 12