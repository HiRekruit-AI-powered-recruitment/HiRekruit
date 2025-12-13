import os
from bson import ObjectId
from src.Utils.EmailService import EmailService
from src.Utils.Database import db
from src.MailTemplate.EmailTemplate import EmailTemplate
from src.Utils.AsyncEmailService import AsyncEmailService
from src.Utils.BrevoEmailService import BrevoEmailService


class EmailingAgent:  
    #  for EmailService
    # def __init__(self, email_service: EmailService):
    #     self.email_service = email_service
    # for AsyncEmailService
    # def __init__(self, email_service: AsyncEmailService):
        # self.email_service = email_service
    # for AsyncEmailService
    def __init__(self, email_service: BrevoEmailService):
        self.email_service = email_service

    def send_mail_to_all_candidates(self, drive_id):
        """Send resume shortlist / rejection emails using EmailTemplate"""

        print(f"\n=== Starting email process for drive: {drive_id} ===")

        # -----------------------------
        # Defaults
        # -----------------------------
        company_name = "HiRekruit"
        hr_name = "HR Team"
        hr_email = "hirekruit@gmail.com"
        company_id = None
        company_doc = None

        # -----------------------------
        # 1. Resolve Drive + Company
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

        except Exception:
            pass

        # -----------------------------
        # 2. Resolve HR Name & Email
        # -----------------------------
        try:
            if company_id:
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
            print("Error resolving HR info:", e)

        # -----------------------------
        # 3. Fetch Drive Candidates
        # -----------------------------
        candidates = list(db.drive_candidates.find({"drive_id": drive_id}))
        print(f"Found {len(candidates)} candidates for this drive")

        if not candidates:
            print("No candidates found!")
            return

        candidate_ids = [ObjectId(c["candidate_id"]) for c in candidates]

        candidate_info_map = {
            str(c["_id"]): c
            for c in db.candidates.find({"_id": {"$in": candidate_ids}})
        }

        success_count = 0
        error_count = 0

        # -----------------------------
        # 4. Process Each Candidate
        # -----------------------------
        for person in candidates:
            cid = person["candidate_id"]
            candidate_info = candidate_info_map.get(cid)

            if not candidate_info:
                print(f"✗ Missing candidate info for ID {cid}")
                error_count += 1
                continue

            name = candidate_info["name"]
            status = person.get("resume_shortlisted")

            # -----------------------------
            # Select Template
            # -----------------------------
            if status == "yes":
                template = EmailTemplate.get("shortlisted")
            elif status == "no":
                template = EmailTemplate.get("not_shortlisted")
            else:
                print(f"✗ Skipping {name} — no shortlist status")
                continue

            # -----------------------------
            # Render Email
            # -----------------------------
            subject = template["subject"].format(
                company_name=company_name
            )

            body = template["body"].format(
                name=name,
                company_name=company_name,
                hr_name=hr_name,
                hr_email=hr_email
            )

            # -----------------------------
            # Send Email
            # -----------------------------
            try:
                print(f"Sending email to: {candidate_info['email']}")

                # for EmailService
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


                db.drive_candidates.update_one(
                    {"_id": person["_id"]},
                    {"$set": {"email_sent": "yes"}}
                )

                success_count += 1
                print(f"✓ Email sent to {name}")

            except Exception as e:
                print(f"✗ Error sending email to {candidate_info.get('email')}: {e}")
                error_count += 1

        # -----------------------------
        # Summary
        # -----------------------------
        print("\n=== Email Process Complete ===")
        print(f"Success: {success_count}, Errors: {error_count}")

    def send_final_selection_emails(self, drive_id):
        """Send final selection / rejection emails using EmailTemplate class"""

        print(f"\n=== Starting final selection email process for drive: {drive_id} ===")

        # -----------------------------
        # Defaults
        # -----------------------------
        company_name = "HiRekruit"
        hr_name = "HR Team"
        hr_email = "hirekruit@gmail.com"

        drive = None

        # -----------------------------
        # Resolve Drive + Company + HR
        # -----------------------------
        try:
            drive = db.drives.find_one(
                {"_id": ObjectId(drive_id)},
                {"role": 1, "company_id": 1}
            )

            if drive:
                comp_id = drive.get("company_id")

                if comp_id:
                    try:
                        company_doc = db.companies.find_one({"_id": ObjectId(comp_id)})
                    except Exception:
                        company_doc = (
                            db.companies.find_one({"_id": comp_id}) or
                            db.companies.find_one({"company_id": comp_id})
                        )

                    if company_doc:
                        company_name = company_doc.get("name", company_name)
                        hr_name = company_doc.get("hr_name") or company_doc.get("contact_name") or hr_name
                        hr_email = company_doc.get("hr_email") or company_doc.get("email") or hr_email

                    # Try HR user
                    hr_user = db.users.find_one(
                        {"company_id": str(comp_id)},
                        {"name": 1, "email": 1}
                    )
                    if hr_user:
                        hr_name = hr_user.get("name", hr_name)
                        hr_email = hr_user.get("email", hr_email)

        except Exception:
            pass

        # -----------------------------
        # Validate Drive
        # -----------------------------
        if not drive:
            print(f"✗ Drive not found: {drive_id}")
            return

        job_role = drive.get("role", "the position")

        # -----------------------------
        # Fetch evaluated candidates
        # -----------------------------
        candidates = list(db.drive_candidates.find({
            "drive_id": drive_id,
            "evaluation_result": {"$exists": True}
        }))

        print(f"Found {len(candidates)} candidates with evaluation results")

        if not candidates:
            return

        candidate_ids = [ObjectId(c["candidate_id"]) for c in candidates]

        candidate_info_map = {
            str(c["_id"]): c
            for c in db.candidates.find({"_id": {"$in": candidate_ids}})
        }

        success_count = 0
        error_count = 0

        # -----------------------------
        # Process Each Candidate
        # -----------------------------
        for person in candidates:
            candidate_info = candidate_info_map.get(person["candidate_id"])

            if not candidate_info:
                print(f"✗ Candidate info missing: {person['candidate_id']}")
                error_count += 1
                continue

            try:
                evaluation = person.get("evaluation_result", {})
                final_score = evaluation.get("final_round_score", 0)
                decision = person.get("selected", "FAIL")
                feedback = person.get("feedback", "No feedback provided.")

                # -----------------------------
                # Select Template
                # -----------------------------
                if decision == "yes":
                    template = EmailTemplate.get("pass")
                else:
                    template = EmailTemplate.get("fail")

                # -----------------------------
                # Render Email
                # -----------------------------
                subject = template["subject"].format(
                    job_role=job_role,
                    company_name=company_name
                )

                body = template["body"].format(
                    name=candidate_info["name"],
                    job_role=job_role,
                    company_name=company_name,
                    hr_name=hr_name,
                    hr_email=hr_email,
                    feedback=feedback
                )

                # -----------------------------
                # Send Email
                # -----------------------------
                print(f"Sending email to: {candidate_info['email']}")
                # for EmailService
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

                # -----------------------------
                # Update DB
                # -----------------------------
                db.drive_candidates.update_one(
                    {"_id": person["_id"]},
                    {"$set": {
                        "selected": decision,
                        "total_score": final_score,
                        "final_selection_email_sent": "yes",
                        "final_email_sent": "yes"
                    }}
                )

                success_count += 1
                print(f"✓ Email sent successfully to {candidate_info['name']}")

            except Exception as e:
                print(f"✗ Error sending email to {candidate_info.get('email')}: {e}")
                import traceback
                traceback.print_exc()
                error_count += 1

        # -----------------------------
        # Summary
        # -----------------------------
        print("\n=== Final Selection Email Process Complete ===")
        print(f"Success: {success_count}, Errors: {error_count}")
