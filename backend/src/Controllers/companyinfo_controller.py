from datetime import datetime
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


# Adding a new function to get drive data 

# Adding a new function to get drive data 
def get_company_drive_stats():
    try:
        companies = list(db.companies.find())
        drives = list(db.drives.find())

        result = []

        for company in companies:
            company_id = str(company["_id"])

            company_drives = [
                d for d in drives
                if str(d.get("company_id")) == company_id
            ]

            active_drives = 0
            completed_drives = 0

            for drive in company_drives:
                total_rounds = len(drive.get("rounds", []))
                current_round = drive.get("current_round", 0)

                # No rounds defined → active by default
                if total_rounds == 0:
                    active_drives += 1
                    continue

                # Main logic
                if current_round >= total_rounds:
                    completed_drives += 1
                else:
                    active_drives += 1

            result.append({
                "company": company.get("name"),
                "activeDrives": active_drives,
                "completedDrives": completed_drives
            })

        return jsonify({"data": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_calendar_drive_stats():
    try:
        companies = list(db.companies.find())
        drives = list(db.drives.find())

        company_map = {
            str(company["_id"]): company.get("name")
            for company in companies
        }

        # Month buckets
        months = {
            "Jan": {"month": "Jan", "activeDrives": 0, "completedDrives": 0},
            "Feb": {"month": "Feb", "activeDrives": 0, "completedDrives": 0},
            "Mar": {"month": "Mar", "activeDrives": 0, "completedDrives": 0},
            "Apr": {"month": "Apr", "activeDrives": 0, "completedDrives": 0},
            "May": {"month": "May", "activeDrives": 0, "completedDrives": 0},
            "Jun": {"month": "Jun", "activeDrives": 0, "completedDrives": 0},
            "Jul": {"month": "Jul", "activeDrives": 0, "completedDrives": 0},
            "Aug": {"month": "Aug", "activeDrives": 0, "completedDrives": 0},
            "Sep": {"month": "Sep", "activeDrives": 0, "completedDrives": 0},
            "Oct": {"month": "Oct", "activeDrives": 0, "completedDrives": 0},
            "Nov": {"month": "Nov", "activeDrives": 0, "completedDrives": 0},
            "Dec": {"month": "Dec", "activeDrives": 0, "completedDrives": 0},
        }

        events = []

        for drive in drives:

            total_rounds = len(drive.get("rounds", []))
            current_round = drive.get("current_round", 0)

            if total_rounds == 0:
                status = "active"
            elif current_round >= total_rounds:
                status = "completed"
            else:
                status = "active"

            drive_date = drive.get("start_date")

            if drive_date:
                dt = datetime.strptime(drive_date, "%Y-%m-%d")
                month_name = dt.strftime("%b")

                if status == "active":
                    months[month_name]["activeDrives"] += 1
                else:
                    months[month_name]["completedDrives"] += 1

            events.append({
                "company": company_map.get(
                    str(drive.get("company_id")),
                    "Unknown Company"
                ),
                "date": drive_date,
                "status": status
            })

        return jsonify({
            "monthlyStats": list(months.values()),
            "events": events
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500