from datetime import datetime

def create_company(name, industry=None, location=None,about=None):
    return {
        "name": name,
        "industry": industry,
        "location": location,
        "about": about,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
