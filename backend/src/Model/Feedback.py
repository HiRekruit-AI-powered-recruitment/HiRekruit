from datetime import datetime
from bson.objectid import ObjectId

def hr_feedback_schema(title, description, hr_id):
    """
    Schema for storing HR Feedback in MongoDB
    """
    return {
        "title": str(title).strip(),
        "description": str(description).strip(),
        "hr_id": ObjectId(hr_id),  # Reference to the HR user
        "created_at": datetime.utcnow(),
        "status": "unread"         # Default status
    }
def create_hr_feedback(
    title,
    description,
    hr_id,            # Reference to the HR user who submitted it
    company_id        # Reference to the company
):
    """
    Schema for HR Feedback as requested in Task 4.
    Fields: title, description
    """
    return {
        "title": title,
        "description": description,
        "hr_id": hr_id,               # ObjectId of the HR user
        "company_id": company_id,     # ObjectId of the company
        "created_at": datetime.utcnow(),
        "status": "pending"           # Optional: to track if feedback was reviewed
    }