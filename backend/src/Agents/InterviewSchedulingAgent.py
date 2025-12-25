from datetime import datetime, timedelta
from src.Utils.Database import db
from bson import ObjectId
from datetime import datetime, timedelta
from src.MailTemplate.EmailTemplate import EmailTemplate
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
        Send interview scheduling emails using EmailTemplate
        ❗ No updates to drive_candidate or rounds_status.
        """

        print(
            "InterviewSchedulingAgent: schedule_interviews called with drive_id:",
            drive_id,
            "round_type:",
            round_type
        )

        # -----------------------------
        # Interview Timing
        # -----------------------------
        interview_datetime = datetime.now() + timedelta(days=1)
        interview_datetime = interview_datetime.replace(
            hour=10, minute=0, second=0, microsecond=0
        )

        interview_date = interview_datetime.strftime('%A, %d %B %Y')
        interview_time = interview_datetime.strftime('%I:%M %p')

        # for candidate
        candidate_meeting_base_url = f"{forntend_base_url}/start-interview"
        # for panel (HR)
        panel_meeting_base_url = f"{forntend_base_url}/panel"

        normalized_round_type = str(round_type).strip().capitalize()

        # -----------------------------
        # Defaults
        # -----------------------------
        company_name = "HiRekruit"
        hr_name = "HR Team"
        hr_email = "hirekruit@gmail.com"
        company_id = None
        company_doc = None

        # -----------------------------
        # Resolve Company & HR
        # -----------------------------
        try:
            drive = db.drives.find_one(
                {"_id": ObjectId(drive_id)},
                {"company_id": 1}
            )

            if drive:
                company_id = drive.get("company_id")

                if company_id:
                    try:
                        company_doc = db.companies.find_one({"_id": ObjectId(company_id)})
                    except Exception:
                        company_doc = (
                            db.companies.find_one({"_id": company_id}) or
                            db.companies.find_one({"company_id": company_id})
                        )

                    if company_doc:
                        company_name = company_doc.get("name", company_name)

                    hr_user = db.users.find_one(
                        {"company_id": str(company_id)},
                        {"name": 1, "email": 1}
                    )

                    if hr_user:
                        hr_name = hr_user.get("name", hr_name)
                        hr_email = hr_user.get("email", hr_email)
                    elif company_doc:
                        hr_name = (
                            company_doc.get("hr_name")
                            or company_doc.get("contact_name")
                            or hr_name
                        )
                        hr_email = (
                            company_doc.get("hr_email")
                            or company_doc.get("email")
                            or hr_email
                        )

        except Exception as e:
            print(f"⚠️ Warning: Could not resolve company/HR details: {e}")

        # -----------------------------
        # Fetch Shortlisted Candidates
        # -----------------------------
        shortlisted_candidates = list(
            db.drive_candidates.find({
                "drive_id": drive_id,
                "resume_shortlisted": "yes"
            })
        )

        if not shortlisted_candidates:
            print(f"⚠️ No shortlisted candidates found for drive {drive_id}")
            return 0

        print(f"📊 Found {len(shortlisted_candidates)} shortlisted candidates")

        email_template = EmailTemplate.get("interview")
        panel_email_template = EmailTemplate.get("panel")
        email_count = 0

        # -----------------------------
        # Send Emails
        # -----------------------------
        for candidate in shortlisted_candidates:
            candidate_id = candidate["candidate_id"]
            candidate_info = db.candidates.find_one(
                {"_id": ObjectId(candidate_id)}
            )

            if not candidate_info:
                print(f"⚠️ Candidate info not found for ID {candidate_id}")
                continue

            interview_url = f"{candidate_meeting_base_url}/{candidate['_id']}/{round_type.lower()}"
            panel_interview_url = f"{panel_meeting_base_url}/{candidate['_id']}/{round_type.lower()}"

            # -----------------------------
            # Candidate Email
            # -----------------------------
            subject = email_template["subject"].format(
                round_type=normalized_round_type,
                company_name=company_name
            )

            body = email_template["body"].format(
                name=candidate_info["name"],
                round_type=normalized_round_type,
                interview_date=interview_date,
                interview_time=interview_time,
                interview_url=interview_url,
                hr_name=hr_name,
                hr_email=hr_email,
                company_name=company_name
            )

            # -----------------------------
            # Panel (HR) Email
            # -----------------------------
            panel_subject = panel_email_template["subject"].format(
                round_type=normalized_round_type,
                company_name=company_name
            )

            panel_body = panel_email_template["body"].format(
                hr_name=hr_name,
                candidate_name=candidate_info["name"],
                round_type=normalized_round_type,
                interview_date=interview_date,
                interview_time=interview_time,
                panel_url=panel_interview_url,
                company_name=company_name
            )

            try:
                print(f"📧 Sending interview email to {candidate_info['email']}")

                # for EmailSerive
                # self.email_service.send_email(
                #     candidate_info["email"],
                #     subject,
                #     body
                # )

                # for AsyncEmailSerive
                print("Sending mail to Candidate.")
                self.email_service.send_email_background(
                    candidate_info["email"],
                    subject,
                    body
                )

                # Send panel access mail to HR
                print("Sending mail to Panel.")
                self.email_service.send_email_background(
                    hr_email,
                    panel_subject,
                    panel_body
                )

                print("   ✅ Emails sent successfully")
                email_count += 1

            except Exception as e:
                print(f"   ❌ Failed to send email: {e}")

        print(f"\n✅ Emails sent: {email_count}/{len(shortlisted_candidates)}")
        return email_count


    def schedule_coding_assessments(self, drive_id):
        """
        Schedule coding assessments for shortlisted candidates.
        Uses EmailTemplate and updates ONLY rounds_status.
        """

        print(f"🧪 Scheduling coding assessments for drive: {drive_id}")

        deadline = datetime.now() + timedelta(days=2)
        duration_hours = (deadline - datetime.now()).days * 24
        assessment_base_url = f"{forntend_base_url}/assessment"

        # -------------------------
        # Defaults
        # -------------------------
        company_name = "HiRekruit"
        hr_name = "HR Team"
        hr_email = "hirekruit@gmail.com"
        company_id = None
        company_doc = None

        # -------------------------
        # Resolve Company & HR
        # -------------------------
        try:
            drive = db.drives.find_one(
                {"_id": ObjectId(drive_id)},
                {"company_id": 1}
            )

            if drive:
                company_id = drive.get("company_id")

                if company_id:
                    try:
                        company_doc = db.companies.find_one({"_id": ObjectId(company_id)})
                    except Exception:
                        company_doc = (
                            db.companies.find_one({"_id": company_id}) or
                            db.companies.find_one({"company_id": company_id})
                        )

                    if company_doc:
                        company_name = company_doc.get("name", company_name)

                    hr_user = db.users.find_one(
                        {"company_id": str(company_id)},
                        {"name": 1, "email": 1}
                    )

                    if hr_user:
                        hr_name = hr_user.get("name", hr_name)
                        hr_email = hr_user.get("email", hr_email)
                    elif company_doc:
                        hr_name = (
                            company_doc.get("hr_name")
                            or company_doc.get("contact_name")
                            or hr_name
                        )
                        hr_email = (
                            company_doc.get("hr_email")
                            or company_doc.get("email")
                            or hr_email
                        )

        except Exception as e:
            print(f"⚠️ Warning: Could not resolve company/HR details: {e}")

        # -------------------------
        # Fetch shortlisted candidates
        # -------------------------
        shortlisted_candidates = list(
            db.drive_candidates.find({
                "drive_id": drive_id,
                "resume_shortlisted": "yes"
            })
        )

        if not shortlisted_candidates:
            print(f"⚠️ No shortlisted candidates found for drive {drive_id}")
            return 0

        print(f"📊 Found {len(shortlisted_candidates)} shortlisted candidates")

        template = EmailTemplate.get("coding_assessment")
        success_count = 0

        # -------------------------
        # Process candidates
        # -------------------------
        for candidate in shortlisted_candidates:
            candidate_id = candidate["candidate_id"]
            candidate_info = db.candidates.find_one(
                {"_id": ObjectId(candidate_id)}
            )

            if not candidate_info:
                print(f"⚠️ Candidate info not found for ID {candidate_id}")
                continue

            candidate_assessment_url = f"{assessment_base_url}/{drive_id}/{candidate_id}"

            subject = template["subject"].format(
                company_name=company_name
            )

            body = template["body"].format(
                name=candidate_info["name"],
                company_name=company_name,
                assessment_url=candidate_assessment_url,
                deadline=deadline.strftime('%A, %d %B %Y, %I:%M %p'),
                duration=duration_hours,
                hr_name=hr_name,
                hr_email=hr_email
            )

            try:
                print(f"📧 Sending coding assessment email to {candidate_info['email']}")

                # for EmailSerive
                # self.email_service.send_email(
                #     candidate_info["email"],
                #     subject,
                #     body
                # )

                # for AsyncEmailSerive
                self.email_service.send_email_background(
                    candidate_info["email"],
                    subject,
                    body
                )

                # -------------------------
                # Update rounds_status ONLY
                # -------------------------
                rounds_status = candidate.get("rounds_status", [])
                round_updated = False

                for round_info in rounds_status:
                    rt = round_info.get("round_type", "").lower().strip()
                    if rt in ["coding", "assessment", "coding assessment"]:
                        round_info["scheduled"] = "yes"
                        round_info["scheduled_date"] = deadline
                        round_info["interview_link"] = candidate_assessment_url
                        round_updated = True
                        break

                if not round_updated:
                    print("⚠️ Coding round not found in rounds_status")

                db.drive_candidates.update_one(
                    {"_id": candidate["_id"]},
                    {
                        "$set": {
                            "rounds_status": rounds_status,
                            "updated_at": datetime.utcnow()
                        },
                        "$unset": {
                            "coding_assessment_sent": "",
                            "assessment_deadline": "",
                            "assessment_link": ""
                        }
                    }
                )

                success_count += 1
                print("   ✅ Email sent and rounds_status updated")

            except Exception as e:
                print(f"   ❌ Failed for {candidate_info['email']}: {e}")

        print(f"\n✅ Coding assessment process completed: {success_count}/{len(shortlisted_candidates)}")
        return success_count
