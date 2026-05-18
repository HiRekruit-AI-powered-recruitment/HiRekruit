from datetime import datetime

def create_feedback(user_id, name, email, company_name, message, status="pending"):
    return {
        "user_id": user_id,
        "name": name,
        "email": email,
        "company_name": company_name,
        "message": message,
        "status": status, # "pending" or "resolved"
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
