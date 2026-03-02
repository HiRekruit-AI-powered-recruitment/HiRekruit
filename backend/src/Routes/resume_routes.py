from flask import Blueprint
from src.Controllers.resume_controllers import upload_resumes
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
    from src.Utils.Database import db
    from bson import ObjectId
    from flask import send_file, jsonify, Response
    import requests

    try:
        candidate = db.candidates.find_one({"_id": ObjectId(candidate_id)})

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Support both resume_path (local) and resume_url (Cloudinary)
        resume_path = candidate.get("resume_path")
        resume_url = candidate.get("resume_url")

        if not resume_path and not resume_url:
            return jsonify({"error": "Resume not found"}), 404

        # If it's a local file path, use send_file
        if resume_path:
            return send_file(
                resume_path,
                mimetype="application/pdf",
                as_attachment=False  # Important: Opens in browser instead of downloading
            )
        
        # If it's a Cloudinary URL, we proxy it with inline headers
        # We forcefully set mimetype to application/pdf to ensure browser preview
        response = requests.get(resume_url, stream=True)
        
        def generate():
            for chunk in response.iter_content(chunk_size=8192):
                yield chunk
        
        # Explicitly force application/pdf and inline disposition
        return Response(
            generate(),
            mimetype="application/pdf",
            headers={
                "Content-Disposition": "inline",
                "Content-Type": "application/pdf",
                "Cache-Control": "no-cache"
            }
        )

    except Exception as e:
        print(f"Error in view_resume: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Optional: Get all drives with candidate counts
@resume_bp.route('/api/drives/candidates-summary', methods=['GET'])
def get_drives_candidates_summary():
    return get_all_drives_candidates_controller()
