import os
from bson import ObjectId
from src.Utils.EmailService import EmailService
from src.Utils.Database import db

class EmailingAgent:    
    def __init__(self, email_service: EmailService):
        self.email_service = email_service

    def create_email_templates(self):
        """Create professionally formatted email templates including HR and company names."""
        return {
            "shortlisted": {
                "subject": "Congratulations — You Have Been Shortlisted!",
                "body": (
                    "Dear {name},\n\n"
                    "We are pleased to inform you that your profile has been shortlisted for the next stage "
                    "of the recruitment process at {company_name}.\n\n"
                    "Our team will soon contact you with further details regarding the upcoming round(s). "
                    "Please ensure you check your email regularly for updates.\n\n"
                    "If you have any questions in the meantime, feel free to reach out.\n\n"
                    "Warm regards,\n"
                    "{hr_name}\n"
                    "{hr_email}\n"
                    "Human Resources\n"
                    "{company_name}"
                )
            },

            "not_shortlisted": {
                "subject": "Application Update — {company_name}",
                "body": (
                    "Dear {name},\n\n"
                    "Thank you for taking the time to apply for an opportunity with {company_name}. "
                    "After a thorough evaluation of your application, we regret to inform you that "
                    "you have not been shortlisted for the next stage of the selection process.\n\n"
                    "We truly appreciate your interest in our organization and the effort you invested "
                    "in your application. We encourage you to apply again for future openings that match your profile.\n\n"
                    "Wishing you success in your career endeavors.\n\n"
                    "Warm regards,\n"
                    "{hr_name}\n"
                    "{hr_email}\n"
                    "Human Resources\n"
                    "{company_name}"
                )
            }
        }


    def send_mail_to_all_candidates(self, drive_id):
        """Send emails to all candidates based on their shortlist status."""
        print(f"\n=== Starting email process for drive: {drive_id} ===")

        templates = self.create_email_templates()
        company_name = "HiRekruit"
        hr_name = "HR Team"
        hr_email = "hirekruit@gmail.com"

        # -------------------------
        # 1. Resolve drive + company
        # -------------------------
        try:
            drive = db.drives.find_one({"_id": ObjectId(drive_id)}, {"company_id": 1})
            company_id = drive.get("company_id") if drive else None

            if company_id:
                # Try ObjectId first, fall back to direct match
                try:
                    company_doc = db.companies.find_one({"_id": ObjectId(company_id)})
                except Exception:
                    company_doc = db.companies.find_one({"_id": company_id}) or \
                                db.companies.find_one({"company_id": company_id})

                if company_doc and company_doc.get("name"):
                    company_name = company_doc["name"]

        except Exception:
            pass  # Keep defaults

        # -------------------------
        # 2. Resolve HR name and email
        # -------------------------
        try:
            if company_id:
                # Try to find a user for this company and extract name + email
                hr_user = db.users.find_one({"company_id": str(company_id)}, {"name": 1, "email": 1})
                if hr_user:
                    if hr_user.get("name"):
                        hr_name = hr_user.get("name")
                    if hr_user.get("email"):
                        hr_email = hr_user.get("email")

                # Fallback: check if company document contains HR/contact name or email
                if (not hr_user or (not hr_user.get("name") and not hr_user.get("email"))) and company_doc:
                    hr_name = company_doc.get("hr_name") or company_doc.get("contact_name") or hr_name
                    hr_email = company_doc.get("hr_email") or company_doc.get("email") or hr_email

        except Exception as e:
            print("Error finding HR name/email:", e)


        # -------------------------
        # 3. Fetch all candidates in drive
        # -------------------------
        candidates = list(db.drive_candidates.find({"drive_id": drive_id}))
        print(f"Found {len(candidates)} candidates for this drive")

        if not candidates:
            print("No candidates found!")
            return

        # Candidate IDs in batch
        candidate_ids = [ObjectId(c["candidate_id"]) for c in candidates]

        # Fetch all candidate details
        candidate_info_map = {
            str(c["_id"]): c
            for c in db.candidates.find({"_id": {"$in": candidate_ids}})
        }

        success_count, error_count = 0, 0

        # -------------------------
        # 4. Process each candidate
        # -------------------------
        for person in candidates:
            cid = str(person["candidate_id"])
            candidate_info = candidate_info_map.get(cid)

            if not candidate_info:
                print(f"✗ Missing candidate info for ID {cid}")
                error_count += 1
                continue

            status = person.get("resume_shortlisted")
            name = candidate_info["name"]

            # Select template
            if status == "yes":
                template_key = "shortlisted"
                print("Template for shortlisted :", template_key)
            elif status == "no":
                template_key = "not_shortlisted"
            else:
                print(f"✗ Skipping {name} - No shortlist status")
                continue

            template = templates[template_key]

            # Prepare email (include hr_email)
            subject = template["subject"].format(company_name=company_name)
            body = template["body"].format(
                name=name,
                company_name=company_name,
                hr_name=hr_name,
                hr_email=hr_email
            )

            try:
                print(f"Sending email to: {candidate_info['email']}")

                # Send mail
                self.email_service.send_email(
                    candidate_info["email"],
                    subject,
                    body
                )

                # Update status
                db.drive_candidates.update_one(
                    {"_id": person["_id"]},
                    {"$set": {"email_sent": "yes"}}
                )

                success_count += 1
                print("✓ Email sent")

            except Exception as e:
                print(f"✗ Error sending email to {candidate_info.get('email')}: {e}")
                error_count += 1

        # -------------------------
        # Summary
        # -------------------------
        print("\n=== Email Process Complete ===")
        print(f"Success: {success_count}, Errors: {error_count}")


    def send_final_selection_emails(self, drive_id):
        """Send final selection/rejection emails after evaluation results"""
        print(f"\n=== Starting final selection email process for drive: {drive_id} ===")
        
        # Resolve company name and HR contact from drive -> company document
        company_name = "HiRekruit"
        hr_name = "HR Team"
        hr_email = "hirekruit@gmail.com"
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
                    # Try to extract HR info from company_doc or users
                    try:
                        hr_user = db.users.find_one({"company_id": str(comp_id)}, {"name": 1, "email": 1})
                        if hr_user:
                            if hr_user.get("name"):
                                hr_name = hr_user.get("name")
                            if hr_user.get("email"):
                                hr_email = hr_user.get("email")
                        else:
                            hr_name = company_doc.get("hr_name") or company_doc.get("contact_name") or hr_name
                            hr_email = company_doc.get("hr_email") or company_doc.get("email") or hr_email
                    except Exception:
                        # ignore and keep defaults
                        pass
        except Exception:
            pass
        
        # Fetch job role
        drive = drive or db.drives.find_one({"_id": ObjectId(drive_id)}, {"role": 1})
        if not drive:
            print(f"✗ Drive not found: {drive_id}")
            return
            
        job_role = drive.get("role", "the position")
        
        # Fetch all candidates who have an evaluation result stored
        candidates = list(db.drive_candidates.find({
            "drive_id": drive_id,
            "evaluation_result": {"$exists": True}
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
                decision = person.get("selected", "no")
                feedback = person.get("feedback", "No feedback provided.")
                
                # print(f"\nProcessing: {candidate_info['name']} → Score: {final_score}, Decision: {decision}")
                
                # Auto-mark selected or rejected
                is_selected = decision
                
                # Prepare email
                if decision == "PASS":
                    subject = f"Congratulations! Selection for the {job_role} Position at {company_name}"
                    body = (
                        f"Dear {candidate_info['name']},\n\n"
                        f"Congratulations! We are pleased to inform you that you have successfully cleared the final interview "
                        f"for the position of {job_role} at {company_name}.\n\n"
                        "Your performance throughout the interview process was highly appreciated by our panel. "
                        "We are excited to move forward with the next steps.\n\n"
                        "Our HR team will get back to you shortly with your formal offer letter and details regarding compensation, onboarding, "
                        "and further instructions.\n\n"
                        "If you have any questions in the meantime, please feel free to reach out.\n\n"
                        "Warm regards,\n"
                        f"{hr_name}\n"
                        f"{hr_email}\n"
                        f"{company_name} Recruitment Team"
                    )
                else:
                    subject = f"Interview Update for the {job_role} Position at {company_name}"
                    body = (
                        f"Dear {candidate_info['name']},\n\n"
                        f"Thank you for taking the time to interview for the position of {job_role} at {company_name}. "
                        "We truly appreciate your interest and the effort you invested in the selection process.\n\n"
                        "After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\n"
                        "Feedback from the interview panel:\n"
                        f"{feedback}\n\n"
                        "We genuinely value your interest in joining our organization and encourage you to apply for future opportunities that match your profile.\n\n"
                        "Wishing you continued success in your career.\n\n"
                        "Warm regards,\n"
                        f"{hr_name}\n"
                        f"{hr_email}\n"
                        f"{company_name} Recruitment Team"
                    )

                
                # Send Email
                print(f"Sending email to: {candidate_info['email']}")
                self.email_service.send_email(candidate_info["email"], subject, body)
                
                # print all the details we extracted
                print(f"Details - Name: {candidate_info['name']}, Email: {candidate_info['email']}, Score: {final_score}, Decision: {decision}")

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
