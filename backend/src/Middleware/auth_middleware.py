from functools import wraps
from flask import jsonify, session
from src.Utils.auth_utils import AuthUtils
from src.Utils.Database import db
from bson import ObjectId

def login_required(f):
    """Decorator to require login for protected routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not AuthUtils.is_logged_in():
            return jsonify({
                "error": "Authentication required",
                "message": "Please log in to access this resource"
            }), 401
        
        # Verify user still exists
        user_id = AuthUtils.get_current_user_id()
        try:
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                AuthUtils.destroy_session()
                return jsonify({
                    "error": "User not found",
                    "message": "Your account no longer exists"
                }), 401
        except Exception as e:
            return jsonify({
                "error": "Invalid session",
                "message": "Please log in again"
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function


def role_required(*allowed_roles):
    """Decorator to require specific roles for protected routes"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not AuthUtils.is_logged_in():
                return jsonify({
                    "error": "Authentication required",
                    "message": "Please log in to access this resource"
                }), 401
            
            user_id = AuthUtils.get_current_user_id()
            try:
                user = db.users.find_one({"_id": ObjectId(user_id)})
                if not user:
                    AuthUtils.destroy_session()
                    return jsonify({
                        "error": "User not found"
                    }), 401
                
                if user.get("role") not in allowed_roles:
                    return jsonify({
                        "error": "Forbidden",
                        "message": f"This resource requires one of the following roles: {', '.join(allowed_roles)}"
                    }), 403
                    
            except Exception as e:
                return jsonify({
                    "error": "Authorization failed",
                    "message": str(e)
                }), 401
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def get_current_user():
    """Helper function to get current logged-in user"""
    if not AuthUtils.is_logged_in():
        return None
    
    user_id = AuthUtils.get_current_user_id()
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            user["company_id"] = str(user["company_id"])
            # Remove sensitive data
            user.pop("password", None)
        return user
    except Exception:
        return None