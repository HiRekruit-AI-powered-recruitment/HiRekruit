from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from src.Utils.Database import db
from src.Utils.auth_utils import AuthUtils
from src.Utils.EmailService import EmailService
from src.Utils.BrevoEmailService import BrevoEmailService
from src.Agents.EmailingAgent import EmailingAgent
from src.Model.Company import create_company
from src.Model.User import create_user
from src.Config.auth_config import AuthConfig

# email_service = get_email_service()
from dotenv import load_dotenv

load_dotenv()
import os
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# working
def register_user():
    """
    Register a new user with email verification
    Expects: name, email, password, company_name, role
    """
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email", "").lower().strip()
        password = data.get("password")
        company_name = data.get("company_name")
        role = data.get("role", "hr")

        # Validation
        if not all([name, email, password, company_name]):
            return jsonify({"message": "All fields are required"}), 400

        # Validate email format
        if not AuthUtils.validate_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        # Validate password
        is_valid, message = AuthUtils.validate_password(password)
        if not is_valid:
            return jsonify({"message": message}), 400

        # Check if user already exists
        existing_user = db.users.find_one({"email": email})
        if existing_user:
            return jsonify({"message": "Email already registered"}), 400

        # Hash password
        password_hash = AuthUtils.hash_password(password)

        # Handle company
        company = db.companies.find_one({"name": company_name})
        if not company:
            company = create_company(company_name)
            result = db.companies.insert_one(company)
            company["_id"] = result.inserted_id

        company_id = company["_id"]

        # Generate OTP
        otp = AuthUtils.generate_otp()
        otp_expiry = AuthUtils.get_otp_expiry()

        # Create user
        user = create_user(
            name=name,
            email=email,
            company_id=company_id,
            password_hash=password_hash,
            role=role
        )
        user["verification_otp"] = otp
        user["verification_otp_expiry"] = otp_expiry

        # Insert user
        result = db.users.insert_one(user)
        user_id = result.inserted_id

        # Send OTP email
        # email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)

        # for BrevoEmailService
        email_service = BrevoEmailService()
        #............................

        emailing_agent = EmailingAgent(email_service)

        success = emailing_agent.send_otp_email(email, otp, purpose="verification")

        # if not success:
        #     # Rollback user creation if email fails
        #     db.users.delete_one({"_id": user_id})
        #     return jsonify({
        #         "message": "Failed to send verification email. Please try again."
        #     }), 500

        return jsonify({
            "message": "Registration successful. Please check your email for verification code.",
            "email": email,
            "success" : success
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"message": "Registration failed. Please try again."}), 500

#working
def verify_email():
    """
    Verify email with OTP
    Expects: email, code
    """
    try:
        data = request.get_json()
        email = data.get("email", "").lower().strip()
        code = data.get("code", "").strip()

        if not email or not code:
            return jsonify({"message": "Email and code are required"}), 400

        # Find user
        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check if already verified
        if user.get("is_verified"):
            return jsonify({"message": "Email already verified"}), 400

        # Check attempts
        if user.get("verification_attempts", 0) >= AuthConfig.MAX_OTP_ATTEMPTS:
            return jsonify({
                "message": "Too many failed attempts. Please request a new code."
            }), 429

        # Check OTP expiry
        if AuthUtils.is_otp_expired(user.get("verification_otp_expiry")):
            return jsonify({"message": "Verification code has expired"}), 400

        # Verify OTP
        if user.get("verification_otp") != code:
            # Increment attempts
            db.users.update_one(
                {"_id": user["_id"]},
                {"$inc": {"verification_attempts": 1}}
            )
            remaining = AuthConfig.MAX_OTP_ATTEMPTS - (user.get("verification_attempts", 0) + 1)
            return jsonify({
                "message": f"Invalid code. {remaining} attempts remaining."
            }), 400

        # Mark as verified
        db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "is_verified": True,
                    "verification_otp": None,
                    "verification_otp_expiry": None,
                    "verification_attempts": 0,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        # Create session
        AuthUtils.create_session(user["_id"], remember_me=False)
        print("after session creation")

        #......................................................
        # Send welcome email
        # email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
        # email_service.send_welcome_email(email, user["name"])

         # for BrevoEmailService
        email_service = BrevoEmailService()
        #............................

        emailing_agent = EmailingAgent(email_service)

        success = emailing_agent.send_welcome_email(email, user["name"])

        # Return user data
        user_data = {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "company_id": str(user["company_id"])
        }

        return jsonify({
            "message": "Email verified successfully",
            "user": user_data
        }), 200

    except Exception as e:
        print(f"Verification error: {str(e)}")
        return jsonify({"message": "Verification failed. Please try again."}), 500

# working
def resend_verification():
    """
    Resend verification OTP
    Expects: email
    """
    try:
        data = request.get_json()
        email = data.get("email", "").lower().strip()

        if not email:
            return jsonify({"message": "Email is required"}), 400

        # Find user
        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check if already verified
        if user.get("is_verified"):
            return jsonify({"message": "Email already verified"}), 400

        # Generate new OTP
        otp = AuthUtils.generate_otp()
        otp_expiry = AuthUtils.get_otp_expiry()

        # Update user
        db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "verification_otp": otp,
                    "verification_otp_expiry": otp_expiry,
                    "verification_attempts": 0,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # Send OTP email
        # email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
        # success = email_service.send_otp_email(email, otp, purpose="verification")

        # for BrevoEmailService
        email_service = BrevoEmailService()
        #............................

        emailing_agent = EmailingAgent(email_service)

        success = emailing_agent.send_otp_email(email, otp, purpose="verification")
        
        # if not success:
        #     return jsonify({"message": "Failed to send email. Please try again."}), 500

        return jsonify({"message": "Verification code sent successfully"}), 200

    except Exception as e:
        print(f"Resend verification error: {str(e)}")
        return jsonify({"message": "Failed to resend code. Please try again."}), 500

#working
def login_user():
    """
    Login user
    Expects: email, password, remember_me (optional)
    """
    try:
        data = request.get_json()
        email = data.get("email", "").lower().strip()
        password = data.get("password")
        remember_me = data.get("remember_me", False)

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        # Find user
        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"message": "Invalid email or password"}), 401

        # Verify password
        if not AuthUtils.verify_password(password, user.get("password")):
            return jsonify({"message": "Invalid email or password"}), 401

        # Check if verified
        if not user.get("is_verified"):
            return jsonify({
                "message": "Please verify your email before logging in",
                "requires_verification": True
            }), 403

        # Update last login
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Create session
        AuthUtils.create_session(user["_id"], remember_me=remember_me)

        # Fetch company
        company = db.companies.find_one({"_id": user["company_id"]})

        # Prepare response
        user_data = {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "company_id": str(user["company_id"])
        }

        company_data = None
        if company:
            company_data = {
                "_id": str(company["_id"]),
                "name": company["name"],
                "industry": company.get("industry"),
                "location": company.get("location")
            }

        return jsonify({
            "message": "Login successful",
            "user": user_data,
            "company": company_data
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Login failed. Please try again."}), 500

#working
def logout_user():
    """Logout user by destroying session"""
    try:
        AuthUtils.destroy_session()
        return jsonify({"message": "Logout successful"}), 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"message": "Logout failed"}), 500

#working
def forgot_password():
    """
    Request password reset
    Expects: email
    """
    try:
        data = request.get_json()
        email = data.get("email", "").lower().strip()

        if not email:
            return jsonify({"message": "Email is required"}), 400

        # Find user
        user = db.users.find_one({"email": email})
        if not user:
            # Don't reveal if email exists
            return jsonify({"message": "If the email exists, a reset code will be sent"}), 200

        # Generate OTP
        otp = AuthUtils.generate_otp()
        otp_expiry = AuthUtils.get_otp_expiry()

        # Update user
        db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "reset_otp": otp,
                    "reset_otp_expiry": otp_expiry,
                    "reset_attempts": 0,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        #...........................................................
        # Send OTP email
        # email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
        # email_service.send_otp_email(email, otp, purpose="password_reset")

        # for BrevoEmailService
        email_service = BrevoEmailService()
        #..........................................................

        emailing_agent = EmailingAgent(email_service)

        success = emailing_agent.send_otp_email(email, otp, purpose="password_reset")

        return jsonify({"message": "Password reset code sent to your email"}), 200

    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        return jsonify({"message": "Failed to send reset code. Please try again."}), 500

#working
def reset_password():
    """
    Reset password with OTP
    Expects: email, code, new_password
    """
    try:
        data = request.get_json()
        email = data.get("email", "").lower().strip()
        code = data.get("code", "").strip()
        new_password = data.get("new_password")

        if not all([email, code, new_password]):
            return jsonify({"message": "All fields are required"}), 400

        # Validate password
        is_valid, message = AuthUtils.validate_password(new_password)
        if not is_valid:
            return jsonify({"message": message}), 400

        # Find user
        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"message": "Invalid reset request"}), 400

        # Check attempts
        if user.get("reset_attempts", 0) >= AuthConfig.MAX_OTP_ATTEMPTS:
            return jsonify({
                "message": "Too many failed attempts. Please request a new code."
            }), 429

        # Check OTP expiry
        if not user.get("reset_otp_expiry") or AuthUtils.is_otp_expired(user.get("reset_otp_expiry")):
            return jsonify({"message": "Reset code has expired"}), 400

        # Verify OTP
        if user.get("reset_otp") != code:
            # Increment attempts
            db.users.update_one(
                {"_id": user["_id"]},
                {"$inc": {"reset_attempts": 1}}
            )
            remaining = AuthConfig.MAX_OTP_ATTEMPTS - (user.get("reset_attempts", 0) + 1)
            return jsonify({
                "message": f"Invalid code. {remaining} attempts remaining."
            }), 400

        # Hash new password
        password_hash = AuthUtils.hash_password(new_password)

        # Update password
        db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password": password_hash,
                    "reset_otp": None,
                    "reset_otp_expiry": None,
                    "reset_attempts": 0,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # mail for password changed
        # for BrevoEmailService
        email_service = BrevoEmailService()
        #..........................................................

        emailing_agent = EmailingAgent(email_service)

        success = emailing_agent.send_password_changed_notification(email)

        return jsonify({"message": "Password reset successfully"}), 200

    except Exception as e:
        print(f"Reset password error: {str(e)}")
        return jsonify({"message": "Password reset failed. Please try again."}), 500

#working
def get_current_user_info():
    """Get current logged-in user information"""
    try:
        from src.Middleware.auth_middleware import get_current_user
        
        user = get_current_user()
        if not user:
            return jsonify({"message": "Not authenticated"}), 401

        # Fetch company
        company = db.companies.find_one({"_id": ObjectId(user["company_id"])})
        company_data = None
        if company:
            company_data = {
                "_id": str(company["_id"]),
                "name": company["name"],
                "about": company["about"],
                "industry": company.get("industry"),
                "location": company.get("location")
            }

        return jsonify({
            "user": user,
            "company": company_data
        }), 200

    except Exception as e:
        print(f"Get user info error: {str(e)}")
        return jsonify({"message": "Failed to fetch user info"}), 500
    
# working  (this function should have been in the drive controller) Get Candidate by ID
def get_candidate_by_id():
    """
    Fetch candidate info by candidate ID.
    Expects: candidate_id in query params.
    """
    candidate_id = request.args.get("candidate_id")
    if not candidate_id:
        return jsonify({"error": "candidate_id is required"}), 400

    try:
        obj_id = ObjectId(candidate_id)
    except Exception:
        return jsonify({"error": "Invalid candidate_id"}), 400

    # Fetch candidate from DB
    candidate = db.candidates.find_one({"_id": obj_id})
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    # Convert ObjectId fields to string for JSON serialization
    candidate["_id"] = str(candidate["_id"])
    if "drive_id" in candidate:
        candidate["drive_id"] = str(candidate["drive_id"])
    if "company_id" in candidate:
        candidate["company_id"] = str(candidate["company_id"])

    return jsonify({
        "message": "Candidate fetched successfully",
        "candidate": candidate
    }), 200
