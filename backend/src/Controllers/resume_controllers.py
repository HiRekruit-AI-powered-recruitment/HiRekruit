from flask import request, jsonify
from werkzeug.utils import secure_filename
from bson import ObjectId
from datetime import datetime
import cloudinary.uploader
from src.Orchestrator.HiringOrchestrator import create_driveCandidate
from src.Config.cloudinary_config import cloudinary
from src.Utils.Database import db
from src.Model.Drive import DriveStatus

def extract_text_from_pdf_bytes(pdf_bytes):
    """Helper: Extract PDF text safely from uploaded bytes"""
    import fitz  # PyMuPDF
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    extracted_text = ""
    for page in doc:
        extracted_text += page.get_text()
    return extracted_text.strip()

def upload_resumes():
    try:
        print("Received request to upload resumes")
        if 'resumes' not in request.files:
            return jsonify({"error": "No files part in the request"}), 400
        
        files = request.files.getlist('resumes')
        # Frontend now sends these fields specifically
        skills = request.form.get('skills')
        job_role = request.form.get('job_role')
        drive_id = request.form.get('drive_id')
        
        print(f"Upload Resumes Request - Drive ID: {drive_id}, Job Role: {job_role}, Skills: {skills}")
        print(f"Number of files to process: {len(files)}")

        if not files or all(f.filename == '' for f in files):
            return jsonify({"error": "No files uploaded"}), 400
        
        if not drive_id:
            return jsonify({"error": "Missing drive_id"}), 400

        uploaded_urls = []

        resumes_data = []

        for file in files:
            if not file.filename:
                continue
            filename = secure_filename(file.filename)
            
            # ================================
            # FIX: Use resume file directly instead of re-downloading from Cloudinary
            # Reason: Cloudinary raw URLs may fail in some environments
            # ================================
            try:
                # Read bytes for text extraction
                file_bytes = file.read()
                # Extract text directly from bytes
                raw_text = extract_text_from_pdf_bytes(file_bytes)
                
                # Reset file pointer for Cloudinary upload
                file.seek(0)
                
                print(f"Uploading {filename} to Cloudinary...")
                # Upload PDF/DOC as auto (document/image) to Cloudinary
                result = cloudinary.uploader.upload(
                    file,
                    resource_type="auto",
                    folder="resumes"
                )
                resume_url = result["secure_url"]
                
                # Store both URL and extracted text
                resumes_data.append({
                    "url": resume_url,
                    "text": raw_text
                })
                
                uploaded_urls.append(resume_url)
                print(f"Successfully uploaded {filename} to {resume_url} and extracted text locally")
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")
                return jsonify({"error": f"Processing failed for {filename}: {str(e)}"}), 500

        # Pass rich data objects instead of just URL strings
        print("Starting HiringOrchestrator.create_driveCandidate...")
        result = create_driveCandidate(resumes_data, skills, job_role, drive_id)
        print("HiringOrchestrator.create_driveCandidate completed.")

        # Update drive status to resumeUploaded after successful resume upload
        try:
            drive_object_id = ObjectId(drive_id)
            db.drives.update_one(
                {"_id": drive_object_id},
                {"$set": {"status": DriveStatus.RESUME_UPLOADED, "updated_at": datetime.utcnow()}}
            )
            print(f"Drive status updated to {DriveStatus.RESUME_UPLOADED} for drive_id: {drive_id}")
        except Exception as e:
            print(f"Error updating drive status in DB: {str(e)}")

        return jsonify({
            "status": "success",
            "uploaded_urls": uploaded_urls,
            "response": result
        })
    except Exception as e:
        import traceback
        print("CRITICAL ERROR in upload_resumes:")
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

def view_resume_inline(candidate_id):
    """
    Fetches the resume URL and streams it to the browser with inline disposition.
    This bypasses Cloudinary's forced download for 'raw' resources.
    """
    try:
        from flask import Response
        import requests

        # Get candidate
        candidate = db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate or not candidate.get("resume_url"):
            return jsonify({"error": "Resume not found"}), 404

        resume_url = candidate["resume_url"]
        
        # Fetch the resume from Cloudinary (or wherever it's stored)
        response = requests.get(resume_url, stream=True)
        
        # Prepare the stream response with forced inline header
        def generate():
            for chunk in response.iter_content(chunk_size=4096):
                yield chunk

        # Determine content type (fallback to application/pdf)
        content_type = response.headers.get('Content-Type', 'application/pdf')
        
        return Response(
            generate(),
            mimetype=content_type,
            headers={
                "Content-Disposition": "inline",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        print(f"Error in view_resume_inline: {str(e)}")
        return jsonify({"error": str(e)}), 500
