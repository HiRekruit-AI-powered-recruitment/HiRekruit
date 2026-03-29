from flask import Blueprint
import os
import cloudinary
import cloudinary.uploader
from bson.objectid import ObjectId 
from src.Model.Feedback import hr_feedback_schema
from flask import request, jsonify, Blueprint, make_response
# from src.Controllers.user_controller import login_user, register_user, get_candidate_by_id
from flask import Blueprint
from src.Utils.Database import db

from src.Controllers.auth_controller import (
    register_user,
    verify_email,
    resend_verification,
    login_user,
    logout_user,
    forgot_password,
    reset_password,
    get_current_user_info,
    get_candidate_by_id
)
from src.Middleware.auth_middleware import login_required

auth_bp = Blueprint("auth", __name__)

# Public routes
@auth_bp.route("/register", methods=["POST"])
def handle_register():
    """Register a new user"""
    print("User registration route called")
    return register_user()


@auth_bp.route("/verify-email", methods=["POST"])
def handle_verify_email():
    """Verify email with OTP"""
    print("Email verification route called")
    return verify_email()


@auth_bp.route("/resend-verification", methods=["POST"])
def handle_resend_verification():
    """Resend verification OTP"""
    print("Resend verification route called")
    return resend_verification()


@auth_bp.route("/login", methods=["POST"])
def handle_login():
    """User login"""
    print("User login route called")
    return login_user()


@auth_bp.route("/forgot-password", methods=["POST"])
def handle_forgot_password():
    """Request password reset"""
    print("Forgot password route called")
    return forgot_password()


@auth_bp.route("/reset-password", methods=["POST"])
def handle_reset_password():
    """Reset password with OTP"""
    print("Reset password route called")
    return reset_password()


# Protected routes
@auth_bp.route("/logout", methods=["POST"])
@login_required
def handle_logout():
    """User logout"""
    print("User logout route called")
    return logout_user()


@auth_bp.route("/me", methods=["GET"])
@login_required
def handle_get_current_user():
    """Get current user information"""
    print("Get current user route called")
    return get_current_user_info()


@auth_bp.route("/candidate", methods=["GET"])
def handle_candidate():
    print("Get candidate route called")
    return get_candidate_by_id()



cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


@auth_bp.route("/update-photo", methods=["POST"])
def update_profile_photo():
    print("1. Update profile photo route called!")
    
    try:
        # Check if file exists
        if 'profile_photo' not in request.files:
            print("2. ERROR: No profile_photo in request")
            return jsonify({"success": False, "message": "No image file provided"}), 400
            
        file = request.files['profile_photo']
        
        # Check if filename is empty
        if file.filename == '':
            print("2. ERROR: Filename is empty")
            return jsonify({"success": False, "message": "No selected file"}), 400

        print(f"2. Found file: {file.filename}, uploading to Cloudinary...")

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            folder="hirekruit_profiles",
            transformation=[
                {'width': 400, 'height': 400, 'crop': 'fill', 'gravity': 'face'}
            ]
        )
        
        # Get URL
        photo_url = upload_result.get('secure_url')
        print(f"3. SUCCESS! Cloudinary URL: {photo_url}")

        # This return statement is REQUIRED
        return jsonify({
            "success": True,
            "message": "Photo updated successfully",
            "url": photo_url
        }), 200

    except Exception as e:
        print(f"3. ERROR occurred during upload: {str(e)}")
        # This return statement is REQUIRED
        return jsonify({"success": False, "message": f"Upload failed: {str(e)}"}), 500
@auth_bp.route("/hr/feedback", methods=["POST", "OPTIONS"])
def handle_hr_feedback():
    # 1. Handle CORS Preflight request explicitly
    if request.method == "OPTIONS":
        response = make_response(jsonify({"message": "OK"}))
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response, 200

    # 2. Handle the actual POST request
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')

        if not title or not description:
            response = jsonify({"success": False, "message": "Title and Description are required"})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400

        # Since we removed @login_required, we don't have the current user's ID.
        # We will generate a random ObjectId so your schema doesn't crash.
        dummy_hr_id = ObjectId()

        # Create document using schema
        feedback_doc = hr_feedback_schema(
            title=title, 
            description=description, 
            hr_id=dummy_hr_id
        )

        # Insert into MongoDB collection 'hr_feedbacks'
        db.hr_feedbacks.insert_one(feedback_doc)

        response = jsonify({
            "success": True, 
            "message": "Feedback submitted successfully"
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 201

    except Exception as e:
        response = jsonify({"success": False, "message": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500
@auth_bp.route("/update-language", methods=["POST"])
def handle_update_language():
    try:
        data = request.get_json()
        language = data.get("language")

        if not language:
            return jsonify({"success": False, "message": "Language is required"}), 400

        # Update the language field for the logged-in user
        # We use g.user if your login_required middleware attaches the user there
        user_id = g.user.get('_id') 
        
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"language": language}}
        )

        return jsonify({
            "success": True, 
            "message": f"Language preference saved: {language}"
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

