from flask import request, jsonify
from werkzeug.utils import secure_filename
from bson import ObjectId
from datetime import datetime
import cloudinary.uploader
from src.Orchestrator.HiringOrchestrator import create_driveCandidate
from src.Config.cloudinary_config import cloudinary
from src.Utils.Database import db
from src.Model.Drive import DriveStatus

def upload_resumes():
    print("Received request to upload resumes")
    if 'resumes' not in request.files:
        return jsonify({"error": "No files part in the request"}), 400
    
    files = request.files.getlist('resumes')
    skills = request.form.get('skills')
    job_role = request.form.get('job_role')
    drive_id = request.form.get('drive_id')
    print(f"Drive ID: {drive_id}, Job Role: {job_role}, Skills: {skills}")

    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    uploaded_urls = []

    for file in files:
        filename = secure_filename(file.filename)
        print(f"Uploading {filename} to Cloudinary...")

        # Upload PDF/DOC as raw file to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            resource_type="raw",
            folder="resumes"
        )

        resume_url = result["secure_url"]
        uploaded_urls.append(resume_url)

    # Pass URLs instead of file paths
    result = create_driveCandidate(uploaded_urls, skills, job_role, drive_id)

    # Update drive status to resumeUploaded after successful resume upload
    try:
        drive_object_id = ObjectId(drive_id)
        db.drives.update_one(
            {"_id": drive_object_id},
            {"$set": {"status": DriveStatus.RESUME_UPLOADED, "updated_at": datetime.utcnow()}}
        )
        print(f"Drive status updated to {DriveStatus.RESUME_UPLOADED} for drive_id: {drive_id}")
    except Exception as e:
        print(f"Error updating drive status: {str(e)}")
        return jsonify({"error": f"Failed to update drive status: {str(e)}"}), 500

    return jsonify({
        "status": "success",
        "uploaded_urls": uploaded_urls,
        "response": result
    })
