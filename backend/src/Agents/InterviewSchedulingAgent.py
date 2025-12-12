from datetime import datetime, timedelta
from src.Utils.Database import db
from bson import ObjectId
import os
from dotenv import load_dotenv
load_dotenv()
forntend_base_url = os.getenv("FRONTEND_BASE_URL")

class InterviewSchedulingAgent:
    def __init__(self, email_service):
        """
        email_service: instance of your EmailingAgent or email utility class
        """
        self.email_service = email_service

    def schedule_interviews(self, drive_id, round_type="hr"):
        """
        Send interview scheduling emails to shortlisted candidates with company & HR details.
        ❗ No updates to drive_candidate or rounds_status.
        """
        print("InterviewSchedulingAgent: schedule_interviews called with drive_id:", drive_id, "and round_type:", round_type)

        # Interview time → Tomorrow 10 AM
        interview_datetime = datetime.now() + timedelta(days=1)
        interview_datetime = interview_datetime.replace(hour=10, minute=0, second=0, microsecond=0)

        meeting_link = f'{forntend_base_url}/start-interview'

        # -------------------------
        # Resolve company & HR name
        # -------------------------
        company_name = "HiRekruit"
        hr_name = "HR Team"
        hr_email = "hirekruit@gmail.com"
        
        try:
            drive = db.drives.find_one({"_id": ObjectId(drive_id)}, {"company_id": 1})
            company_id = drive.get("company_id") if drive else None

            if company_id:
                # Resolve company name
                try:
                    company_doc = db.companies.find_one({"_id": ObjectId(company_id)})
                except Exception:
                    company_doc = db.companies.find_one({"_id": company_id}) or \
                                db.companies.find_one({"company_id": company_id})

                if company_doc and company_doc.get("name"):
                    company_name = company_doc["name"]

                # Resolve HR name
                hr_user = db.users.find_one(
                    {"company_id": str(company_id)},
                    {"name": 1, "email": 1}
                )

                if hr_user and hr_user.get("name"):
                    hr_name = hr_user["name"]
                    hr_email = hr_user["email"]
                elif company_doc:
                    hr_name = (
                        company_doc.get("hr_name")
                        or company_doc.get("contact_name")
                        or hr_name
                    )
                    hr_email  = (company_doc.get("email"))

        except Exception as e:
            print(f"Warning: Could not resolve company/HR details: {e}")

        # Fetch shortlisted candidates
        shortlisted_candidates = list(db.drive_candidates.find({
            "drive_id": drive_id,
            "resume_shortlisted": "yes"
        }))

        if not shortlisted_candidates:
            print(f"⚠️ No shortlisted candidates found for drive {drive_id}")
            return 0

        print(f"📊 Found {len(shortlisted_candidates)} shortlisted candidates")

        normalized_round_type = str(round_type).lower().strip()

        email_count = 0

        for candidate in shortlisted_candidates:
            candidate_id = candidate["candidate_id"]
            candidate_info = db.candidates.find_one({"_id": ObjectId(candidate_id)})

            if not candidate_info:
                print(f"⚠️ Candidate info with ID {candidate_id} not found.")
                continue

            # Create interview link
            interview_url = f"{meeting_link}/{candidate['_id']}/{normalized_round_type}"

            subject = f"Interview Invitation - {round_type.capitalize()} Round - {company_name}"
            body = f"""
            Dear {candidate_info['name']},

            Congratulations! You have been shortlisted for the {round_type.capitalize()} Round interview at {company_name}.

            Please find the interview details below:

            Interview Details:
            • Round: {round_type.capitalize()} Round
            • Date: {interview_datetime.strftime('%A, %d %B %Y')}
            • Time: {interview_datetime.strftime('%I:%M %p')}
            • Interview Link: {interview_url}

            Kindly ensure the following:
            • Join the meeting 5-10 minutes before the scheduled time  
            • Check your internet connection, camera, and microphone in advance  
            • Sit in a quiet place with proper lighting  
            • Keep your updated resume accessible for reference  

            If you have any questions or need to reschedule, please contact our HR team at the earliest.

            We look forward to speaking with you.

            Warm regards,  
            {hr_name}  
            {hr_email}
            Human Resources  
            {company_name}
            """

            # Send email
            print(f"📧 Sending {round_type} interview email to {candidate_info['email']}...")

            try:
                self.email_service.send_email(candidate_info['email'], subject, body)
                print("   ✅ Email sent successfully")
                email_count += 1
            except Exception as e:
                print(f"   ❌ Failed to send email: {e}")
                continue

        print(f"\n✅ Emails sent: {email_count}/{len(shortlisted_candidates)}")
        return email_count

    def schedule_coding_assessments(self, drive_id):
        """
        Schedule coding assessments for shortlisted candidates with company & HR details.
        Updates rounds_status array for 'coding' round type.
        """
        deadline = datetime.now() + timedelta(days=2)
        assessment_link = f'{forntend_base_url}/assessment'

        # -------------------------
        # Resolve company & HR name
        # -------------------------
        company_name = "HiRekruit"
        hr_name = "HR Team"
        hr_email = "hirekruit@gmail.com"
        
        try:
            drive = db.drives.find_one({"_id": ObjectId(drive_id)}, {"company_id": 1})
            company_id = drive.get("company_id") if drive else None

            if company_id:
                # Resolve company name
                try:
                    company_doc = db.companies.find_one({"_id": ObjectId(company_id)})
                except Exception:
                    company_doc = db.companies.find_one({"_id": company_id}) or \
                                db.companies.find_one({"company_id": company_id})

                if company_doc and company_doc.get("name"):
                    company_name = company_doc["name"]

                # Resolve HR name
                hr_user = db.users.find_one(
                    {"company_id": str(company_id)},
                    {"name": 1, "email": 1}
                )

                if hr_user and hr_user.get("name"):
                    hr_name = hr_user["name"]
                    hr_email = hr_user["email"]
                elif company_doc:
                    hr_name = (
                        company_doc.get("hr_name")
                        or company_doc.get("contact_name")
                        or hr_name
                    )
        except Exception as e:
            print(f"Warning: Could not resolve company/HR details: {e}")

        shortlisted_candidates = list(db.drive_candidates.find({
            "drive_id": drive_id,
            "resume_shortlisted": "yes"
        }))

        if not shortlisted_candidates:
            print(f"⚠️ No shortlisted candidates found for drive {drive_id}")
            return

        successful_updates = 0

        for candidate in shortlisted_candidates:
            candidate_id = candidate["candidate_id"]
            candidate_info = db.candidates.find_one({"_id": ObjectId(candidate_id)})

            if not candidate_info:
                print(f"⚠️ Candidate info with ID {candidate_id} not found in database.")
                continue

            # Unique assessment URL
            candidate_assessment_url = f"{assessment_link}/{drive_id}/{candidate_id}"

            subject = f"Coding Assessment Invitation - {company_name}"
            body = f"""
            Dear {candidate_info['name']},

            Congratulations on being shortlisted for the Coding Assessment round at {company_name}!

            We are excited to evaluate your problem-solving and coding abilities. Please complete the assessment using the link provided below.

            Assessment Details:
        
            Assessment Link: {candidate_assessment_url}
            Deadline: {deadline.strftime('%A, %d %B %Y, %I:%M %p')}
            Duration: Approximately {(deadline - datetime.now()).days * 24} hours


            Instructions:
            • Click the assessment link above to begin  
            • Complete all coding problems before the deadline  
            • Ensure you have a stable internet connection  
            • Your progress will be saved automatically  
            • You may exit and return to the assessment anytime before the deadline  

            Tips for Success:
            • Read all problem statements carefully  
            • Test your code with sample and edge case inputs  
            • Write clean, readable, and well-structured code  
            • Prioritize correctness and clarity  

            If you experience any technical issues, please contact our support team immediately.
            
            Contact for Support Team :
                Mail : hirekruit@gmail.com
                Mobile : +91 6202908328

            We wish you the very best and look forward to reviewing your submission.

            Warm regards,  
            {hr_name}  
            {hr_email}
            Human Resources  
            {company_name}
            """


            print(f"📧 Sending coding assessment email to {candidate_info['email']}...")
            
            try:
                self.email_service.send_email(candidate_info['email'], subject, body)
                
                # Update rounds_status for coding round
                rounds_status = candidate.get("rounds_status", [])
                round_updated = False

                for round_info in rounds_status:
                    round_type = round_info.get("round_type", "").lower().strip()
                    if round_type in ["coding", "assessment", "coding assessment"]:
                        round_info["scheduled"] = "yes"
                        round_info["scheduled_date"] = deadline
                        round_info["interview_link"] = candidate_assessment_url
                        round_updated = True
                        print(f"   ✓ Updated coding round in rounds_status array")
                        break

                if not round_updated:
                    print(f"   ⚠️ Warning: No coding round found in rounds_status")

                # Update ONLY rounds_status - NO OTHER FIELDS
                update_result = db.drive_candidates.update_one(
                    {"_id": candidate["_id"]},
                    {
                        "$set": {
                            "rounds_status": rounds_status,
                            "updated_at": datetime.utcnow()
                        },
                        # Remove any legacy assessment fields
                        "$unset": {
                            "coding_assessment_sent": "",
                            "assessment_deadline": "",
                            "assessment_link": ""
                        }
                    }
                )

                if update_result.modified_count > 0:
                    successful_updates += 1
                    print(f"   ✅ Email sent and database updated for {candidate_info['email']}")
                
            except Exception as e:
                print(f"   ❌ Failed to send email to {candidate_info['email']}: {str(e)}")
                continue

        print(f"\n✅ Coding assessment process completed: {successful_updates}/{len(shortlisted_candidates)} candidates updated.")
        return successful_updates
