import os
from dotenv import load_dotenv
from datetime import datetime

from src.Utils.Database import db
from src.Utils.auth_utils import AuthUtils
from src.Model.User import create_user

load_dotenv()

def seed_admin():
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        print("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env")
        return

    # check if admin exists
    existing = db.users.find_one({"email": admin_email})

    if existing:
        print("⚡ Admin already exists")
        return

    # hash password
    password_hash = AuthUtils.hash_password(admin_password)

    # create or get admin company (important for your login flow)
    company = db.companies.find_one({"name": "Admin Company"})

    if not company:
        result = db.companies.insert_one({
            "name": "Admin Company",
            "created_at": datetime.utcnow()
        })
        company_id = result.inserted_id
    else:
        company_id = company["_id"]

    # create admin user
    admin_user = create_user(
        name="Admin",
        email=admin_email,
        password_hash=password_hash,
        company_id=company_id,
        role="admin",
        is_approved="approved"
    )

    # bypass verification
    admin_user["is_verified"] = True

    db.users.insert_one(admin_user)

    print("✅ Admin seeded successfully")


if __name__ == "__main__":
    seed_admin()