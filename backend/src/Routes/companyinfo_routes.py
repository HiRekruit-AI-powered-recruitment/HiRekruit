from flask import Blueprint, request, jsonify
from src.Controllers.companyinfo_controller import handle_comapnyinfo_query

companyinfo_bp = Blueprint("companyinfo", __name__)

@companyinfo_bp.route("/query", methods=["POST"])
def companyinfo_query():
    print("companyinfo router called.")
    try:
        data = request.get_json()
        company_name = data.get("company_name")

        if not company_name:
            return jsonify({"error": "Company name is required"}), 400

        response = handle_comapnyinfo_query(company_name)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
