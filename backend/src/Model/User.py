from datetime import datetime

def create_user(
    name,
    email,
    password_hash,          # bcrypt hashed password
    company_id,
    role="hr"
):
    return {
        "name": name,
        "email": email,
        "password": password_hash,                 # hashed password
        "role": role,                         # "hr", "manager", "employee"
        "company_id": company_id,             # ObjectId reference
        "is_verified": False,

        # OTP for email verification
        "verification_otp": None,
        "verification_otp_expiry": None,

        # OTP for password reset
        "reset_otp": None,
        "reset_otp_expiry": None,

        # Timestamps
        "created_at": datetime.utcnow(),
        "last_login": None
    }
