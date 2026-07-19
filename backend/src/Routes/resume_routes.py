from flask import Blueprint
from src.Controllers.resume_controllers import upload_resumes, view_resume_inline, download_resume
from src.Controllers.allresumes_controller import get_all_drives_candidates_controller , get_drive_candidates_controller

resume_bp = Blueprint('resume', __name__)

# Route to upload resumes
@resume_bp.route('/upload-resumes', methods=['POST'])
def handle_upload_resumes():
    print("Upload resumes endpoint hit")
    return upload_resumes()


# In your routes file
@resume_bp.route('/<drive_id>/candidates', methods=['GET'])
def get_drive_candidates(drive_id):
    print("get drive candidate route called")
    return get_drive_candidates_controller(drive_id)

# Team Note: Added missing resume preview route for View Resume button
@resume_bp.route("/view/<candidate_id>", methods=["GET"])
def view_resume(candidate_id):
    return view_resume_inline(candidate_id)

@resume_bp.route("/download/<candidate_id>", methods=["GET"])
def download(candidate_id):
    return download_resume(candidate_id)

# Optional: Get all drives with candidate counts
@resume_bp.route('/api/drives/candidates-summary', methods=['GET'])
def get_drives_candidates_summary():
    return get_all_drives_candidates_controller()

# Temporary route 
@resume_bp.route('/debug-drive-candidates', methods=['GET'])
def debug_drive_candidates():
    from src.Utils.Database import db

    data = list(db["drive_candidates"].find().limit(5))

    for item in data:
        item["_id"] = str(item["_id"])

    return {"data": data}

# Temporary checking @resume_bp.route('/debug-drives', methods=['GET'])
@resume_bp.route('/debug-drives', methods=['GET'])
def debug_drives():
    from src.Utils.Database import db

    drives = list(db["drives"].find().limit(5))

    for drive in drives:
        drive["_id"] = str(drive["_id"])

    return {"data": drives}