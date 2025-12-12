import asyncio
import io, json, os
from flask import jsonify, request
from src.Utils.VapiService import upload_resume
import pdfplumber
from bson import ObjectId
from dotenv import load_dotenv
from src.Utils.Database import db
from datetime import datetime

load_dotenv()
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# interview mock agent for evaluating the result of mock interview

from src.Agents.MockInterviewAgent import MockInterviewAgent
mock_interview_agent = MockInterviewAgent()
#email service instance for sending emails
from src.Utils.EmailService import EmailService
email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
# emailing agent instance for sending emails
from src.Agents.EmailingAgent import EmailingAgent
emailing_agent = EmailingAgent(email_service)

def extract_resume_text(file):
    """Extract text from uploaded resume (PDF)."""
    print("Extracting resume text...")
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise RuntimeError(f"Error extracting resume text: {str(e)}")
    print("resume extraction done")
    return text.strip()


def upload_resume_controller(file):
    print("Uploading resume...")
    try:
        resume_text = extract_resume_text(file)

        # Generate sessionId if not provided
        import uuid
        session_id = request.form.get("sessionId") or uuid.uuid4().hex
        print("sessionid : ", session_id)
        result = asyncio.run(upload_resume(session_id, resume_text))
        print("Resume uploaded successfully.")
        return jsonify({
            "sessionId": session_id,
            "resumeText": resume_text,
            "status": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def evaluate_interview_controller(resume_text, transcript, driveCandidateId, interviewType="general"):
    # print(f"Evaluating interview Controller with type: {interviewType}...")
    # print("with driveCandidateId:", driveCandidateId)
    # print("Transcript length:", len(transcript))
    # print("Interview type:", interviewType)

    try:
        # Clean and structure conversation data
        conversation_only = []
        for msg in transcript:
            if 'role' in msg and 'content' in msg:
                conversation_only.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
            else:
                print(f"Warning: Skipping malformed message: {msg}")

        # Call the Mock Interview Agent
        result = mock_interview_agent.evaluate_interview(resume_text, conversation_only, interviewType)

        decision = result.get("decision", "FAIL")
        feedback = result.get("feedback", "No feedback provided")
        final_round_score = result.get("final_round_score", 0)

        # Update drive candidate and update the round status based on interviewType
        if driveCandidateId:
            drive_candidate = db.drive_candidates.find_one({"_id": ObjectId(driveCandidateId)})
            if drive_candidate:
                rounds_status = drive_candidate.get("rounds_status", [])

                # Find and update the round that matches the interviewType
                # Normalize interviewType for comparison (e.g., "hr" matches "hr", "technical" matches "technical")
                normalized_type = interviewType.lower().strip()
                updated_round = False

                for round_info in rounds_status:
                    round_type = round_info.get("round_type", "").lower().strip()
                    if round_type == normalized_type:
                        round_info["completed"] = "yes"
                        round_info["completed_date"] = datetime.utcnow()
                        round_info["result"] = "passed" if decision == "PASS" else "failed"
                        round_info["feedback"] = feedback
                        round_info["score"] = final_round_score
                        updated_round = True
                        print(f"Updated round with type '{interviewType}' for candidate {driveCandidateId}")
                        break

                if not updated_round:
                    print(f"Warning: No round found with type '{interviewType}' for candidate {driveCandidateId}")

                db.drive_candidates.update_one(
                    {"_id": drive_candidate["_id"]},
                    {
                        "$set": {
                            "rounds_status": rounds_status,
                            "selected": "yes" if decision == "PASS" else "no",
                            "feedback": feedback,
                            "evaluation_result": result,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                print(f"Drive candidate {driveCandidateId} updated with round completion status")
            else:
                print(f"No drive candidate found for driveCandidateId: {driveCandidateId}")
        else:
            print("No driveCandidateId provided; skipping database update and email notification.")

       
        return jsonify(result)

    except Exception as e:

        return jsonify({"error": str(e)}), 500



def get_candidate_info(drive_candidate_id):
    try:
        # here we fetch drive_candidate using drive_candidate_id
        drive_candidate = db.drive_candidates.find_one({"_id": ObjectId(drive_candidate_id)}, {"_id": 0})
        # we need the candidte details as well
        candidate_info = db.candidates.find_one({"_id": ObjectId(drive_candidate['candidate_id'])}, {"_id": 0, "password": 0})
        drive_candidate['candidate_info'] = candidate_info
        if not drive_candidate:
            return jsonify({"error": "Drive Candidate not found"}), 404
        return jsonify(drive_candidate), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

