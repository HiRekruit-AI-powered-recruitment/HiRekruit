import os
from bson import ObjectId
from src.Utils.EmailService import EmailService
from src.Utils.Database import db

class EmailingAgent:    
    def __init__(self, email_service: EmailService):
        self.email_service = email_service

    def create_email_templates(self):
        """Create email templates without subject lines in body"""
        return {
            "shortlisted": {
                "subject": "Congratulations on Your Resume Shortlisting!",
                "body": (
                    "Dear {name},\n\n"
                    "We are pleased to inform you that you have been shortlisted for the next stage "
                    "of the selection process at {company_name}.\n\n"
                    "Our recruitment team will be reaching out shortly with details about the next steps. "
                    "Please keep an eye on your email for updates.\n\n"
                    "Best regards,\n"
                    "{company_name} Recruitment Team"
                )
            },
            
            "not_shortlisted": {
                "subject": "Application Update - {company_name}",
                "body": (
                    "Dear {name},\n\n"
                    "Thank you for your interest in joining {company_name}. "
                    "After careful consideration, we regret to inform you that you have not been shortlisted "
                    "for the next round at this time.\n\n"
                    "We truly appreciate the effort you put into your application and encourage you to apply "
                    "for future openings with us.\n\n"
                    "Wishing you the best in your career journey.\n\n"
                    "Best regards,\n"
                    "{company_name} Recruitment Team"
                )
            }
        }

    def send_mail_to_all_candidates(self, drive_id):
        """Send emails to all candidates based on their shortlist status"""
        print(f"\n=== Starting email process for drive: {drive_id} ===")
        
        templates = self.create_email_templates()
        # Resolve company name from drive -> company document
        company_name = "HiRekruit"
        try:
            drive = db.drives.find_one({"_id": ObjectId(drive_id)}, {"company_id": 1})
            if drive:
                comp_id = drive.get("company_id")
                if comp_id:
                    # try ObjectId lookup first, fall back to raw value
                    try:
                        company_doc = db.companies.find_one({"_id": ObjectId(comp_id)})
                    except Exception:
                        company_doc = db.companies.find_one({"_id": comp_id}) or db.companies.find_one({"company_id": comp_id})

                    if company_doc and company_doc.get("name"):
                        company_name = company_doc.get("name")
        except Exception:
            # on any lookup failure, keep default company_name
            pass

        # Get all candidates for this drive
        candidates = list(db.drive_candidates.find({"drive_id": drive_id}))
        print(f"Found {len(candidates)} candidates for this drive")

        if not candidates:
            print("No candidates found!")
            return

        # Extract all candidate IDs
        candidate_ids = [ObjectId(person["candidate_id"]) for person in candidates]

        # Fetch all candidate info in one query
        candidate_info_map = {
            str(c["_id"]): c
            for c in db.candidates.find({"_id": {"$in": candidate_ids}})
        }

        success_count = 0
        error_count = 0

        for person in candidates:
            candidate_id = person["candidate_id"]
            candidate_info = candidate_info_map.get(candidate_id)

            if not candidate_info:
                print(f"✗ Candidate info not found for ID: {candidate_id}")
                error_count += 1
                continue

            try:
                # Determine template based on shortlist status
                if person.get("resume_shortlisted") == "yes":
                    template = templates["shortlisted"]
                    print(f"\nProcessing SHORTLISTED candidate: {candidate_info['name']}")
                elif person.get("resume_shortlisted") == "no":
                    template = templates["not_shortlisted"]
                    print(f"\nProcessing NOT SHORTLISTED candidate: {candidate_info['name']}")
                else:
                    print(f"✗ Skipping candidate {candidate_info['name']} - no shortlist status")
                    continue

                # Format email content
                subject = template["subject"].format(company_name=company_name)
                body = template["body"].format(
                    name=candidate_info["name"], 
                    company_name=company_name
                )

                # Send email
                print(f"Sending email to: {candidate_info['email']}")
                self.email_service.send_email(
                    candidate_info["email"], 
                    subject, 
                    body
                )

                # Update email_sent status
                db.drive_candidates.update_one(
                    {"_id": person["_id"]},
                    {"$set": {"email_sent": "yes"}}
                )
                
                success_count += 1
                print(f"✓ Email sent successfully")

            except Exception as e:
                print(f"✗ Error sending email to {candidate_info.get('email', 'unknown')}: {e}")
                import traceback
                traceback.print_exc()
                error_count += 1

        print(f"\n=== Email Process Complete ===")
        print(f"Success: {success_count}, Errors: {error_count}")

    def send_final_selection_emails(self, drive_id):
        """Send final selection/rejection emails after evaluation results"""
        print(f"\n=== Starting final selection email process for drive: {drive_id} ===")
        
        # Resolve company name from drive -> company document
        company_name = "HiRekruit"
        try:
            drive = db.drives.find_one({"_id": ObjectId(drive_id)}, {"role": 1, "company_id": 1})
            if drive:
                comp_id = drive.get("company_id")
                if comp_id:
                    try:
                        company_doc = db.companies.find_one({"_id": ObjectId(comp_id)})
                    except Exception:
                        company_doc = db.companies.find_one({"_id": comp_id}) or db.companies.find_one({"company_id": comp_id})

                    if company_doc and company_doc.get("name"):
                        company_name = company_doc.get("name")
        except Exception:
            pass
        
        # Fetch job role
        drive = drive or db.drives.find_one({"_id": ObjectId(drive_id)}, {"role": 1})
        if not drive:
            print(f"✗ Drive not found: {drive_id}")
            return
            
        job_role = drive.get("role", "the position")
        
        # Fetch all candidates who finished interviews (evaluated)
        candidates = list(db.drive_candidates.find({
            "drive_id": drive_id,
            "interview_completed": "yes",
            "evaluation_result": {"$exists": True}  # <-- NEW: must have evaluation JSON
        }))
        
        print(f"Found {len(candidates)} candidates with completed interviews & evaluation")
        
        if not candidates:
            print("No evaluated candidates found!")
            return
        
        # Get all candidate IDs
        candidate_ids = [ObjectId(c["candidate_id"]) for c in candidates]
        
        # Fetch candidate info in one query
        candidate_info_map = {
            str(c["_id"]): c
            for c in db.candidates.find({"_id": {"$in": candidate_ids}})
        }
        
        success_count = 0
        error_count = 0
        
        for person in candidates:
            candidate_info = candidate_info_map.get(person["candidate_id"])
            
            if not candidate_info:
                print(f"✗ Candidate info missing: {person['candidate_id']}")
                error_count += 1
                continue
            
            try:
                evaluation = person.get("evaluation_result", {})
                
                # Extract scores safely
                final_score = evaluation.get("final_round_score", 0)
                decision = evaluation.get("decision", "FAIL").upper()
                feedback = evaluation.get("feedback", "No feedback provided.")
                
                print(f"\nProcessing: {candidate_info['name']} → Score: {final_score}, Decision: {decision}")
                
                # Auto-mark selected or rejected
                is_selected = "yes" if decision == "PASS" else "no"
                
                # Prepare email
                if decision == "PASS":
                    subject = f"Congratulations! Job Offer from {company_name}"
                    body = (
                        f"Dear {candidate_info['name']},\n\n"
                        f"Congratulations! You have cleared the final interview for the {job_role} position at {company_name}.\n\n"
                        f"Your final evaluation score: {final_score}\n\n"
                        "Please check the attached offer letter for further details.\n\n"
                        "Best regards,\n"
                        f"{company_name} Recruitment Team"
                    )
                else:
                    subject = f"Interview Outcome from {company_name}"
                    body = (
                        f"Dear {candidate_info['name']},\n\n"
                        f"Thank you for interviewing for the {job_role} position at {company_name}.\n"
                        "Unfortunately, you were not selected at this time.\n\n"
                        f"Your Evaluation Score: {final_score}\n"
                        f"Feedback:\n{feedback}\n\n"
                        "We encourage you to apply again in the future.\n\n"
                        f"Best regards,\n{company_name} Recruitment Team"
                    )
                
                # Send Email
                print(f"Sending email to: {candidate_info['email']}")
                self.email_service.send_email(candidate_info["email"], subject, body)
                
                # Update DB
                db.drive_candidates.update_one(
                    {"_id": person["_id"]},
                    {"$set": {
                        "selected": is_selected,
                        "total_score": final_score,
                        "final_selection_email_sent": "yes",
                        "final_email_sent": "yes"
                    }}
                )
                
                success_count += 1
                print(f"✓ Email sent successfully")
            
            except Exception as e:
                print(f"✗ Error sending email to {candidate_info.get('email', 'unknown')}: {e}")
                import traceback
                traceback.print_exc()
                error_count += 1
        
        print("\n=== Final Selection Email Process Complete ===")
        print(f"Success: {success_count}, Errors: {error_count}")
