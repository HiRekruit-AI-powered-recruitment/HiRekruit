from datetime import datetime, timedelta
from src.Utils.Database import db
from bson import ObjectId

class InterviewSchedulingAgent:
    def __init__(self, email_service):
        """
        email_service: instance of your EmailingAgent or email utility class
        """
        self.email_service = email_service

    def schedule_interviews(self, drive_id, round_type="hr"):
        """
        Send interview scheduling emails to shortlisted candidates.
        ❗ No updates to drive_candidate or rounds_status.
        """
        print("InterviewSchedulingAgent: schedule_interviews called with drive_id:", drive_id, "and round_type:", round_type)

        # Interview time → Tomorrow 10 AM
        interview_datetime = datetime.now() + timedelta(days=1)
        interview_datetime = interview_datetime.replace(hour=10, minute=0, second=0, microsecond=0)

        meeting_link = "http://localhost:5173/start-interview"

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

            subject = f"Interview Invitation - {round_type.capitalize()} Round - HiRekruit"
            body = f"""
            Dear {candidate_info['name']},

            Congratulations! You have been shortlisted for the next stage of our recruitment process.

            Round: {round_type.capitalize()}

            We would like to invite you to an interview scheduled as follows:

            📅 Date: {interview_datetime.strftime('%A, %d %B %Y')}
            ⏰ Time: {interview_datetime.strftime('%I:%M %p')}
            🔗 Interview Link: {interview_url}

            Please be available at the scheduled time.

            Best regards,
            HR Team
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
        Schedule coding assessments for shortlisted candidates.
        Updates rounds_status array for 'coding' round type.
        """
        deadline = datetime.now() + timedelta(days=2)
        assessment_link = "http://localhost:5173/assessment"

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

            subject = "Coding Assessment Invitation - HiRekruit"
            body = f"""Dear {candidate_info['name']},

            Congratulations on being shortlisted for the coding assessment round!

            Please complete your coding assessment using the link below:

            🔗 Assessment Link: {candidate_assessment_url}
            🕒 Deadline: {deadline.strftime('%A, %d %B %Y, %I:%M %p')}

            Instructions:
            • Click the link above to start your assessment
            • You will have {(deadline - datetime.now()).days * 24} hours to complete the test
            • Make sure you have a stable internet connection
            • Your progress will be auto-saved

            Make sure to complete your test before the deadline. 
            Good luck and happy coding!

            Best regards,
            HR Team"""

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
