from src.Agents.CompanyInfoAgent import CompanyInfoAgent
from flask import request, jsonify
from src.Utils.Database import db

# Create a single instance of CompanyInfoAgent
company_info_agent = CompanyInfoAgent()

def handle_comapnyinfo_query(company_name: str) -> str:
    """
    Controller function that delegates company name to CompanyInfoAgent.
    """
    print("companyinfo controller called.")
    try:
        reply = company_info_agent.get_reply(company_name)
        return reply
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")

def get_all_companies():
    """
    Fetch all companies
    """
    try:
        companies_cursor = db.companies.find()

        companies = []

        for company in companies_cursor:
            companies.append({
                "_id": str(company["_id"]),
                "name": company.get("name"),
                "industry": company.get("industry"),
                "location": company.get("location"),
                "about": company.get("about"),
                "created_at": company.get("created_at"),
                "updated_at": company.get("updated_at")
            })

        return jsonify({
            "message": "Companies fetched successfully",
            "count": len(companies),
            "companies": companies
        }), 200

    except Exception as e:
        print(f"Get all companies error: {str(e)}")
        return jsonify({
            "message": "Failed to fetch companies"
        }), 500