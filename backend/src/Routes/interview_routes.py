from flask import Blueprint, request
from src.Controllers import interview_controller

interview_bp = Blueprint("interview", __name__)

@interview_bp.route("/upload-resume", methods=["POST"])
def upload_resume():
    print("Uploading resume router...")
    if "resume" not in request.files:
        return {"error": "No resume uploaded"}, 400
    file = request.files["resume"]
    return interview_controller.upload_resume_controller(file)

@interview_bp.route("/evaluate", methods=["POST"])
def evaluate_interview():
    print("Route call for evaluation......")
    data = request.get_json()
    if not data or "resumeText" not in data or "transcript" not in data:
        return {"error": "Missing resumeText or transcript"}, 400
    return interview_controller.evaluate_interview_controller(
        data["resumeText"], data["transcript"], data.get("driveCandidateId"), data.get("interviewType", "general")
    )
#   
@interview_bp.route("/candidate/<string:drive_candidate_id>", methods=["GET"])
def get_candidate(drive_candidate_id):
    return interview_controller.get_candidate_info(drive_candidate_id)

