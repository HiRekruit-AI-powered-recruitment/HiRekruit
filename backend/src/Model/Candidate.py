from datetime import datetime

def create_candidate(name, email, resume_content, resume_url, public_id=None, version=None, format=None, resource_type=None):
    return {
        "name": name,
        "email": email,
        "resume_content": resume_content,
        "resume_url": resume_url,
        "public_id": public_id,
        "version": version,
        "format": format,
        "resource_type": resource_type,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
