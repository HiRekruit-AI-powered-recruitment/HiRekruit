from flask import request, jsonify, redirect
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
                # Read bytes once
                file_bytes = file.read()
                print(f"DEBUG: File '{filename}' byte length: {len(file_bytes)}")
                
                # Extract text from bytes
                raw_text = extract_text_from_pdf_bytes(file_bytes)
                if not raw_text:
                    print(f"WARNING: No text extracted from {filename}. File might be corrupted or scanned image.")
                
                # CRITICAL FIX: Upload as 'image' with 'authenticated' type to match delivery
                print(f"Uploading {filename} to Cloudinary as image/authenticated...")
                result = cloudinary.uploader.upload(
                    file_bytes,
                    resource_type="image",
                    type="authenticated",
                    folder="resumes",
                    use_filename=True,
                    unique_filename=True
                )
                
                print(f"DEBUG: Cloudinary response bytes: {result.get('bytes')}")
                if result.get('bytes') != len(file_bytes):
                    print(f"ERROR: Byte mismatch! Local: {len(file_bytes)}, Cloudinary: {result.get('bytes')}")
                
                print("FULL CLOUDINARY RESPONSE:", result)
                resume_url = result["secure_url"]
                public_id = result["public_id"]
                version = result.get("version")
                format_type = result.get("format")
                
                # Store authoritative metadata directly
                resumes_data.append({
                    "url": resume_url,
                    "public_id": public_id,
                    "version": version,
                    "format": format_type,
                    "resource_type": "image",
                    "delivery_type": "authenticated",
                    "text": raw_text
                })
                
                uploaded_urls.append(resume_url)
                print(f"Successfully uploaded {filename} to {resume_url} with public_id {public_id}")
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")
                return jsonify({"error": f"Processing failed for {filename}: {str(e)}"}), 500

        # Pass rich data objects instead of just URL strings
        print("Starting HiringOrchestrator.create_driveCandidate...")
        result = create_driveCandidate(resumes_data, skills, job_role, drive_id)
        print("HiringOrchestrator.create_driveCandidate completed.")

        # Update drive status
        try:
            drive_object_id = ObjectId(drive_id)
            db.drives.update_one(
                {"_id": drive_object_id},
                {"$set": {"status": DriveStatus.RESUME_UPLOADED, "updated_at": datetime.utcnow()}}
            )
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

# Helper removed: Canonical data stored in DB. No parsing allowed.

def view_resume_inline(candidate_id):
    """
    View Resume → Stream PDF via backend to force inline display.
    """
    try:
        import cloudinary.utils
        
        candidate = db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate:
            candidate = db.drive_candidates.find_one({"_id": ObjectId(candidate_id)})

        # Get individual metadata fields
        public_id = candidate.get("public_id")
        resource_type = candidate.get("resource_type", "image")
        version = candidate.get("version")
        format_type = candidate.get("format")

        print(f"DEBUG: Signing for Candidate {candidate_id}:")
        print(f"  - public_id: {public_id}")
        print(f"  - resource_type: {resource_type}")
        print(f"  - version: {version}")
        print(f"  - format: {format_type}")

        # Generate authoritative signed URL with 'authenticated' type
        signed_url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=resource_type,
            type="authenticated",
            version=version,
            format=format_type,
            secure=True,
            sign_url=True
        )
        print(f"DEBUG: Internal Fetching from Cloudinary: {signed_url}")
        
        # Fetch from Cloudinary
        import requests
        from flask import Response
        headers = {'User-Agent': 'Mozilla/5.0'}
        print("DEBUG: Sending request to Cloudinary...")
        response = requests.get(signed_url, stream=True, timeout=15, headers=headers)
        print(f"DEBUG: Cloudinary Response Status: {response.status_code}")
        print(f"DEBUG: Cloudinary Response Headers: {dict(response.headers)}")
        
        if response.status_code != 200:
            print(f"❌ Cloudinary Error: {response.status_code}")
            print(f"❌ X-Cld-Error: {response.headers.get('X-Cld-Error')}")
            return jsonify({
                "error": "Cloudinary Error",
                "status": response.status_code,
                "msg": response.headers.get('X-Cld-Error', 'Access Denied')
            }), response.status_code

        def generate():
            for chunk in response.iter_content(chunk_size=8192):
                yield chunk

        return Response(
            generate(),
            content_type='application/pdf',
            headers={
                "Content-Disposition": "inline",
                "Cache-Control": "no-cache"
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def download_resume(candidate_id):
    """
    Download Resume → Stream PDF via backend to force download.
    """
    try:
        import cloudinary.utils
        
        candidate = db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate:
            candidate = db.drive_candidates.find_one({"_id": ObjectId(candidate_id)})

        if not candidate or not candidate.get("public_id"):
            return jsonify({"error": "Resume reference not found (please re-upload)"}), 404

        # Generate signed URL with attachment flag and 'authenticated' type
        signed_url, _ = cloudinary.utils.cloudinary_url(
            candidate["public_id"],
            resource_type="image",
            type="authenticated",
            version=candidate.get("version"),
            format=candidate.get("format"),
            secure=True,
            sign_url=True,
            flags="attachment"
        )
        
        print(f"DEBUG: Internal Fetching from Cloudinary for Download: {signed_url}")

        # Fetch from Cloudinary
        import requests
        from flask import Response
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(signed_url, stream=True, timeout=15, headers=headers)
        
        if response.status_code != 200:
            return jsonify({
                "error": "Cloudinary Error",
                "status": response.status_code,
                "msg": response.headers.get('X-Cld-Error', 'Access Denied')
            }), response.status_code

        def generate():
            for chunk in response.iter_content(chunk_size=8192):
                yield chunk

        filename = f"resume_{candidate_id}.pdf"
        return Response(
            generate(),
            content_type='application/pdf',
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Cache-Control": "no-cache"
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

