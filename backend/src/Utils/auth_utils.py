import bcrypt
import random
import string
from datetime import datetime, timedelta
from flask import session
from src.Config.auth_config import AuthConfig

class AuthUtils:
    """Utility functions for authentication"""
    
    @staticmethod
    def hash_password(password):
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt(rounds=AuthConfig.BCRYPT_LOG_ROUNDS)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password, hashed_password):
        """Verify a password against its hash"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    @staticmethod
    def generate_otp():
        """Generate a random OTP"""
        return ''.join(random.choices(string.digits, k=AuthConfig.OTP_LENGTH))
    
    @staticmethod
    def get_otp_expiry():
        """Get OTP expiry timestamp"""
        return datetime.utcnow() + timedelta(minutes=AuthConfig.OTP_EXPIRY_MINUTES)
    
    @staticmethod
    def is_otp_expired(expiry_time):
        """Check if OTP has expired"""
        if not expiry_time:
            return True   # treat missing expiry as expired
        return datetime.utcnow() > expiry_time

    
    @staticmethod
    def create_session(user_id, remember_me=False):
        """Create a user session"""
        session.permanent = remember_me
        session['user_id'] = str(user_id)
        session['logged_in'] = True
        session['created_at'] = datetime.utcnow().isoformat()
    
    @staticmethod
    def destroy_session():
        """Destroy user session"""
        session.clear()
    
    @staticmethod
    def get_current_user_id():
        """Get current logged-in user ID from session"""
        return session.get('user_id')
    
    @staticmethod
    def is_logged_in():
        """Check if user is logged in"""
        return session.get('logged_in', False)
    
    @staticmethod
    def validate_password(password):
        """Validate password strength"""
        if len(password) < AuthConfig.MIN_PASSWORD_LENGTH:
            return False, f"Password must be at least {AuthConfig.MIN_PASSWORD_LENGTH} characters long"
        
        # Add more validation rules as needed
        # has_upper = any(c.isupper() for c in password)
        # has_lower = any(c.islower() for c in password)
        # has_digit = any(c.isdigit() for c in password)
        
        return True, "Password is valid"
    
    @staticmethod
    def validate_email(email):
        """Basic email validation"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None