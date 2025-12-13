class EmailTemplate:
    """
    Centralized email template manager.
    """

    @staticmethod
    def get_templates():
        return {
            # ---------------------------------
            # Resume Shortlisted
            # ---------------------------------
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

            # ---------------------------------
            # Resume Not Shortlisted
            # ---------------------------------
            "not_shortlisted": {
                "subject": "Application Update — {company_name}",
                "body": (
                    "Dear {name},\n\n"
                    "Thank you for taking the time to apply for an opportunity with {company_name}. "
                    "After careful review, we regret to inform you that your profile has not been shortlisted "
                    "for the next stage of the selection process.\n\n"
                    "We truly appreciate your interest in our organization and encourage you to apply for future "
                    "roles that align with your skills and experience.\n\n"
                    "Wishing you success in your career journey.\n\n"
                    "Warm regards,\n"
                    "{hr_name}\n"
                    "{hr_email}\n"
                    "Human Resources\n"
                    "{company_name}"
                )
            },

            # ---------------------------------
            # FINAL ROUND - PASS
            # ---------------------------------
            "pass": {
                "subject": "Congratulations! Selection for the {job_role} Position at {company_name}",
                "body": (
                    "Dear {name},\n\n"
                    "Congratulations! We are delighted to inform you that you have successfully cleared the final "
                    "interview for the position of {job_role} at {company_name}.\n\n"
                    "Your performance throughout the interview process was highly appreciated by our interview panel. "
                    "We are excited to move forward with the next steps.\n\n"
                    "Our HR team will reach out to you shortly with your formal offer letter, compensation details, "
                    "and onboarding information.\n\n"
                    "If you have any questions in the meantime, please feel free to reach out.\n\n"
                    "Warm regards,\n"
                    "{hr_name}\n"
                    "{hr_email}\n"
                    "Human Resources\n"
                    "{company_name}"
                )
            },

            # ---------------------------------
            # FINAL ROUND - FAIL
            # ---------------------------------
            "fail": {
                "subject": "Interview Update for the {job_role} Position at {company_name}",
                "body": (
                    "Dear {name},\n\n"
                    "Thank you for taking the time to interview for the position of {job_role} at {company_name}. "
                    "We appreciate the effort and interest you showed throughout the selection process.\n\n"
                    "After careful consideration, we regret to inform you that we will not be proceeding further "
                    "with your application at this time.\n\n"
                    "Feedback from the interview panel:\n"
                    "{feedback}\n\n"
                    "We encourage you to apply for future opportunities with us that align with your profile and skills.\n\n"
                    "Wishing you continued success in your professional journey.\n\n"
                    "Warm regards,\n"
                    "{hr_name}\n"
                    "{hr_email}\n"
                    "Human Resources\n"
                    "{company_name}"
                )
            },

            # ---------------------------------
            # Interview Round Invitation
            # ---------------------------------
            "interview": {
                "subject": "Interview Invitation — {round_type} Round | {company_name}",
                "body": (
                    "Dear {name},\n\n"
                    "Congratulations! You have been shortlisted for the {round_type} Round interview at "
                    "{company_name}.\n\n"
                    "Please find the interview details below:\n\n"
                    "Interview Details:\n"
                    "• Round: {round_type} Round\n"
                    "• Date: {interview_date}\n"
                    "• Time: {interview_time}\n"
                    "• Interview Link: {interview_url}\n\n"
                    "Kindly ensure the following:\n"
                    "• Join the meeting 5–10 minutes before the scheduled time\n"
                    "• Check your internet connection, camera, and microphone in advance\n"
                    "• Sit in a quiet place with proper lighting\n"
                    "• Keep your updated resume accessible for reference\n\n"
                    "If you have any questions or need to reschedule, please contact us at the earliest.\n\n"
                    "We look forward to speaking with you.\n\n"
                    "Warm regards,\n"
                    "{hr_name}\n"
                    "{hr_email}\n"
                    "Human Resources\n"
                    "{company_name}"
                )
            },

            # ---------------------------------
            # Coding Assessment Invitation
            # ---------------------------------
            "coding_assessment": {
                "subject": "Coding Assessment Invitation — {company_name}",
                "body": (
                    "Dear {name},\n\n"
                    "Congratulations on being shortlisted for the Coding Assessment round at "
                    "{company_name}!\n\n"
                    "We are excited to evaluate your problem-solving and coding skills. Please complete "
                    "the assessment using the link provided below.\n\n"
                    "Assessment Details:\n"
                    "• Assessment Link: {assessment_url}\n"
                    "• Deadline: {deadline}\n"
                    "• Duration: Approximately {duration} hours\n\n"
                    "Instructions:\n"
                    "• Click the assessment link above to begin\n"
                    "• Complete all coding problems before the deadline\n"
                    "• Ensure you have a stable internet connection\n"
                    "• Your progress will be saved automatically\n"
                    "• You may exit and return anytime before the deadline\n\n"
                    "Tips for Success:\n"
                    "• Read problem statements carefully\n"
                    "• Test your code with sample and edge cases\n"
                    "• Write clean, readable, and well-structured code\n\n"
                    "If you face any technical issues, please contact our support team immediately:\n\n"
                    "Support Contact:\n"
                    "• Email: hirekruit@gmail.com\n"
                    "• Mobile: +91 6202908328\n\n"
                    "We wish you the very best and look forward to reviewing your submission.\n\n"
                    "Warm regards,\n"
                    "{hr_name}\n"
                    "{hr_email}\n"
                    "Human Resources\n"
                    "{company_name}"
                )
            }
        }

    @staticmethod
    def get(template_key: str):
        templates = EmailTemplate.get_templates()
        if template_key not in templates:
            raise ValueError(f"Email template '{template_key}' not found")
        return templates[template_key]
