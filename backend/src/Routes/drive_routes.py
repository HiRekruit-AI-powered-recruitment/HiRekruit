from flask import Blueprint, jsonify, request
from src.Controllers.drive_controller import (
    create_drive_controller, 
    get_drives_by_company, 
    update_drive_status,
    get_drive_by_id,
    get_all_drives,
    get_hr_info,
    get_drive_candidates,
    get_drive_candidates_by_job,
    remove_application_by_job,
    get_drive_id_by_job,
    get_shortlisted_candidates_by_job,
    get_selected_candidates_by_job
)

drive_bp = Blueprint("drive_bp", __name__, url_prefix="/api/drive")

# Create a new drive
drive_bp.route("/create", methods=["POST"])(create_drive_controller)

# get shortlisted candidates for a drive
@drive_bp.route("/job/shortlisted", methods=["GET"])
def job_shortlisted_candidates():
    return get_shortlisted_candidates_by_job()

# Get all drives for a company
drive_bp.route("/company/<company_id>", methods=["GET"])(get_drives_by_company)

# Get candidates for a specific drive
drive_bp.route("/<drive_id>/candidates", methods=["GET"])(get_drive_candidates)

# Get candidates for a job id (find drive by job_id and return its candidates)
@drive_bp.route("/job/<job_id>/candidates", methods=["GET"])
def get_candidates_by_job(job_id):
    return get_drive_candidates_by_job(job_id)


# Remove a candidate's application for a job (delete drive_candidate)
@drive_bp.route("/job/<job_id>/candidate/<candidate_id>", methods=["DELETE"])
def remove_candidate_from_job(job_id, candidate_id):
    return remove_application_by_job(job_id, candidate_id)


# Get selected candidates for a job
@drive_bp.route("/job/selected", methods=["GET"])
def job_selected_candidates():
    return get_selected_candidates_by_job()

# Get all drives (optional - for admin/debugging)
drive_bp.route("/all", methods=["GET"])(get_all_drives)

# Get a single drive by ID
@drive_bp.route("/<drive_id>", methods=["GET"])
def get_drive(drive_id):
    return get_drive_by_id(drive_id)

# Update drive status
@drive_bp.route("/<drive_id>/status", methods=["PUT"])
def update_status(drive_id):
    return update_drive_status(drive_id)

# Get drive status only
@drive_bp.route("/<driveId>/status", methods=["GET"])
def get_drive_status(driveId):
    print("Get Drive Status route called.")
    response, status_code = get_drive_by_id(driveId)
    
    if status_code == 200:
        drive_data = response.get_json()
        return jsonify({
            "message": "Drive status retrieved successfully",
            "status": drive_data["drive"]["status"],
            "drive_id": driveId
        }), 200
    else:
        return response, status_code

# Get HR info by email
@drive_bp.route("/hr-info", methods=["GET"])
def hr_info_route():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    hr_info = get_hr_info(email)
    if not hr_info:
        return jsonify({"error": "HR not found"}), 404
    
    print("Email received:", email)
    print("HR Info from DB:", hr_info)
    
    return jsonify(hr_info), 200

drive_bp.route("/job", methods=["GET"])(get_drive_id_by_job)

