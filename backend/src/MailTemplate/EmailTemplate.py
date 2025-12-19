class EmailTemplate:
    """
    Centralized email template manager with HTML templates.
    """

    @staticmethod
    def get_templates():
        return {
            # ---------------------------------
            # Resume Shortlisted
            # ---------------------------------
            "shortlisted": {
                "subject": "Congratulations — You Have Been Shortlisted!",
                "body": """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">🎉</div>
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Congratulations, {name}!</h2>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    We are pleased to inform you that your profile has been shortlisted for the next stage of the recruitment process at <strong>{company_name}</strong>.
                                                </p>
                                                <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                                    <p style="margin: 0; color: #0c4a6e; font-size: 15px; line-height: 1.6;">
                                                        <strong>Next Steps:</strong><br>
                                                        Our team will soon contact you with further details regarding the upcoming round(s). Please ensure you check your email regularly for updates.
                                                    </p>
                                                </div>
                                                <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                                    If you have any questions in the meantime, feel free to reach out to us at <a href="mailto:{hr_email}" style="color: #0284c7; text-decoration: none;">{hr_email}</a>
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                                    <strong>{hr_name}</strong><br>
                                                    Human Resources<br>
                                                    {company_name}
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            },

            # ---------------------------------
            # Resume Not Shortlisted
            # ---------------------------------
            "not_shortlisted": {
                "subject": "Application Update — {company_name}",
                "body": """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Application Update</h2>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Dear {name},
                                                </p>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Thank you for taking the time to apply for an opportunity with <strong>{company_name}</strong>. After careful review, we regret to inform you that your profile has not been shortlisted for the next stage of the selection process.
                                                </p>
                                                <div style="background-color: #fef3f2; border-left: 4px solid #f87171; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                                    <p style="margin: 0; color: #991b1b; font-size: 15px; line-height: 1.6;">
                                                        We truly appreciate your interest in our organization and encourage you to apply for future roles that align with your skills and experience.
                                                    </p>
                                                </div>
                                                <p style="margin: 30px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Wishing you success in your career journey.
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                                    <strong>{hr_name}</strong><br>
                                                    Human Resources<br>
                                                    {company_name}
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            },

            # ---------------------------------
            # FINAL ROUND - PASS
            # ---------------------------------
            "pass": {
                "subject": "Congratulations! Selection for the {job_role} Position at {company_name}",
                "body": """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎊 Congratulations! 🎊</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <div style="text-align: center; font-size: 64px; margin-bottom: 20px;">🌟</div>
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">You're Selected, {name}!</h2>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    We are delighted to inform you that you have successfully cleared the final interview for the position of <strong>{job_role}</strong> at <strong>{company_name}</strong>.
                                                </p>
                                                <div style="background-color: #f0fdf4; border: 2px solid #22c55e; padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
                                                    <p style="margin: 0 0 15px 0; color: #166534; font-size: 18px; font-weight: 600;">
                                                        ✅ Final Interview Cleared
                                                    </p>
                                                    <p style="margin: 0; color: #15803d; font-size: 15px; line-height: 1.6;">
                                                        Your performance throughout the interview process was highly appreciated by our interview panel. We are excited to move forward with the next steps.
                                                    </p>
                                                </div>
                                                <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                                    <p style="margin: 0; color: #1e40af; font-size: 15px; line-height: 1.6;">
                                                        <strong>What's Next?</strong><br>
                                                        Our HR team will reach out to you shortly with your formal offer letter, compensation details, and onboarding information.
                                                    </p>
                                                </div>
                                                <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                                                    If you have any questions in the meantime, please feel free to reach out at<br>
                                                    <a href="mailto:{hr_email}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">{hr_email}</a>
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-align: center;">
                                                    <strong>{hr_name}</strong><br>
                                                    Human Resources<br>
                                                    {company_name}
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            },

            # ---------------------------------
            # FINAL ROUND - FAIL
            # ---------------------------------
            "fail": {
                "subject": "Interview Update for the {job_role} Position at {company_name}",
                "body": """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Interview Update</h2>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Dear {name},
                                                </p>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Thank you for taking the time to interview for the position of <strong>{job_role}</strong> at <strong>{company_name}</strong>. We appreciate the effort and interest you showed throughout the selection process.
                                                </p>
                                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    After careful consideration, we regret to inform you that we will not be proceeding further with your application at this time.
                                                </p>
                                                <div style="background-color: #fef3f2; border-left: 4px solid #f87171; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                                    <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 15px; font-weight: 600;">
                                                        Feedback from the Interview Panel:
                                                    </p>
                                                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                                                        {feedback}
                                                    </p>
                                                </div>
                                                <p style="margin: 30px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    We encourage you to apply for future opportunities with us that align with your profile and skills.
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Wishing you continued success in your professional journey.
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                                    <strong>{hr_name}</strong><br>
                                                    Human Resources<br>
                                                    {company_name}
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            },

            # ---------------------------------
            # Interview Round Invitation
            # ---------------------------------
            "interview": {
                "subject": "Interview Invitation — {round_type} Round | {company_name}",
                "body": """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">📅</div>
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">Interview Invitation</h2>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Dear {name},
                                                </p>
                                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Congratulations! You have been shortlisted for the <strong>{round_type} Round</strong> interview at <strong>{company_name}</strong>.
                                                </p>
                                                
                                                <!-- Interview Details Box -->
                                                <div style="background-color: #eff6ff; border: 2px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 12px;">
                                                    <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">
                                                        📋 Interview Details
                                                    </p>
                                                    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                                                        <tr>
                                                            <td style="color: #1e40af; font-weight: 600; font-size: 14px; width: 30%;">Round:</td>
                                                            <td style="color: #1e40af; font-size: 14px;">{round_type} Round</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #1e40af; font-weight: 600; font-size: 14px;">Date:</td>
                                                            <td style="color: #1e40af; font-size: 14px;">{interview_date}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #1e40af; font-weight: 600; font-size: 14px;">Time:</td>
                                                            <td style="color: #1e40af; font-size: 14px;">{interview_time}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #1e40af; font-weight: 600; font-size: 14px;">Link:</td>
                                                            <td style="color: #1e40af; font-size: 14px;"><a href="{interview_url}" style="color: #2563eb; text-decoration: underline;">Join Interview</a></td>
                                                        </tr>
                                                    </table>
                                                </div>
                                                
                                                <!-- Instructions -->
                                                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                                    <p style="margin: 0 0 10px 0; color: #92400e; font-size: 15px; font-weight: 600;">
                                                        ⚠️ Important Instructions:
                                                    </p>
                                                    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                                                        <li>Join the meeting 5–10 minutes before the scheduled time</li>
                                                        <li>Check your internet connection, camera, and microphone in advance</li>
                                                        <li>Sit in a quiet place with proper lighting</li>
                                                        <li>Keep your updated resume accessible for reference</li>
                                                    </ul>
                                                </div>
                                                
                                                <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                                    If you have any questions or need to reschedule, please contact us at the earliest.
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    We look forward to speaking with you.
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                                    <strong>{hr_name}</strong><br>
                                                    Human Resources<br>
                                                    {company_name}
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            },

            # ---------------------------------
            # Coding Assessment Invitation
            # ---------------------------------
            "coding_assessment": {
                "subject": "Coding Assessment Invitation — {company_name}",
                "body": """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">💻</div>
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">Coding Assessment Invitation</h2>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Dear {name},
                                                </p>
                                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Congratulations on being shortlisted for the Coding Assessment round at <strong>{company_name}</strong>! We are excited to evaluate your problem-solving and coding skills.
                                                </p>
                                                
                                                <!-- Assessment Details Box -->
                                                <div style="background-color: #f0f9ff; border: 2px solid #0284c7; padding: 25px; margin: 30px 0; border-radius: 12px;">
                                                    <p style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 18px; font-weight: 600;">
                                                        📝 Assessment Details
                                                    </p>
                                                    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                                                        <tr>
                                                            <td style="color: #0c4a6e; font-weight: 600; font-size: 14px; width: 35%;">Assessment Link:</td>
                                                            <td style="color: #0c4a6e; font-size: 14px;"><a href="{assessment_url}" style="color: #0284c7; text-decoration: underline; word-break: break-all;">Start Assessment</a></td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #0c4a6e; font-weight: 600; font-size: 14px;">Deadline:</td>
                                                            <td style="color: #0c4a6e; font-size: 14px;">{deadline}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #0c4a6e; font-weight: 600; font-size: 14px;">Duration:</td>
                                                            <td style="color: #0c4a6e; font-size: 14px;">Approximately {duration} hours</td>
                                                        </tr>
                                                    </table>
                                                </div>
                                                
                                                <!-- Instructions -->
                                                <div style="margin: 30px 0;">
                                                    <p style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                                                        📋 Instructions:
                                                    </p>
                                                    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                                                        <li>Click the assessment link above to begin</li>
                                                        <li>Complete all coding problems before the deadline</li>
                                                        <li>Ensure you have a stable internet connection</li>
                                                        <li>Your progress will be saved automatically</li>
                                                        <li>You may exit and return anytime before the deadline</li>
                                                    </ul>
                                                </div>
                                                
                                                <!-- Tips -->
                                                <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                                    <p style="margin: 0 0 10px 0; color: #166534; font-size: 15px; font-weight: 600;">
                                                        💡 Tips for Success:
                                                    </p>
                                                    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                                                        <li>Read problem statements carefully</li>
                                                        <li>Test your code with sample and edge cases</li>
                                                        <li>Write clean, readable, and well-structured code</li>
                                                    </ul>
                                                </div>
                                                
                                                <!-- Support Contact -->
                                                <div style="background-color: #fef3f2; border-left: 4px solid #f87171; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                                    <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 15px; font-weight: 600;">
                                                        🆘 Need Help?
                                                    </p>
                                                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                                                        If you face any technical issues, please contact our support team immediately:<br>
                                                        <strong>Email:</strong> hirekruit@gmail.com<br>
                                                        <strong>Mobile:</strong> +91 6202908328
                                                    </p>
                                                </div>
                                                
                                                <p style="margin: 30px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                                                    We wish you the very best and look forward to reviewing your submission.
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                                    <strong>{hr_name}</strong><br>
                                                    Human Resources<br>
                                                    {company_name}
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            },
            
            # ---------------------------------
            # OTP Verification 
            # ---------------------------------
            "verification" : {
                "subject" : "Verify Your HiRekruit Account",
                "body" :"""
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome to HiRekruit!</h2>
                                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Thank you for signing up. Please use the verification code below to complete your registration:
                                                </p>
                                                
                                                <!-- OTP Box -->
                                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                    <tr>
                                                        <td align="center" style="padding: 30px 0;">
                                                            <div style="background-color: #f9f9f9; border: 2px solid #e0e0e0; border-radius: 12px; padding: 30px; display: inline-block;">
                                                                <div style="color: #000000; font-size: 40px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                                                                    {otp}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                                    <strong>This code will expire in 10 minutes.</strong>
                                                </p>
                                                <p style="margin: 10px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                                    If you didn't request this code, please ignore this email.
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            },

            # ---------------------------------
            # Reset Password 
            # ---------------------------------
            "password_reset" : {
                "subject" : "Reset Your HiRekruit Password",
                "body" : """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
                                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    We received a request to reset your password. Use the code below to proceed:
                                                </p>
                                                
                                                <!-- OTP Box -->
                                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                    <tr>
                                                        <td align="center" style="padding: 30px 0;">
                                                            <div style="background-color: #fff5f5; border: 2px solid #ffcccc; border-radius: 12px; padding: 30px; display: inline-block;">
                                                                <div style="color: #cc0000; font-size: 40px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                                                                    {otp}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                                    <strong>This code will expire in 10 minutes.</strong>
                                                </p>
                                                <p style="margin: 10px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                                    If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            },
            # ---------------------------------
            # Welcome 
            # ---------------------------------
            "welcome" : {
                "subject" : "Welcome to HiRekruit!",
                "body" : """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px; text-align: center;">
                                                <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 28px; font-weight: 600;">Welcome to HiRekruit, {name}!</h2>
                                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Your account has been successfully verified and you're all set to start using HiRekruit.
                                                </p>
                                                <p style="margin: 0 0 40px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    We're excited to have you on board!
                                                </p>
                                                
                                                <!-- CTA Button -->
                                                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                                                    <tr>
                                                        <td align="center" style="background: linear-gradient(135deg, #000000 0%, #434343 100%); border-radius: 8px; padding: 16px 40px;">
                                                            <a href="{frontend_url}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
                                                                Get Started
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
            """
            },

            # ---------------------------------
            # Password Changed 
            # ---------------------------------
            "password_changed" : {
                "subject" : "Your HiRekruit Password Has Been Changed",
                "body" : """
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #000000 0%, #434343 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">HiRekruit</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">✅</div>
                                                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">Password Changed Successfully</h2>
                                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Hi User,
                                                </p>
                                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                                    Your HiRekruit account password has been successfully changed.
                                                </p>
                                                <div style="background-color: #fff5f5; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0;">
                                                    <p style="margin: 0; color: #cc0000; font-size: 14px; line-height: 1.6;">
                                                        <strong>⚠️ Security Notice:</strong> If you didn't make this change, please contact our support team immediately.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                                    © 2025 HiRekruit. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
                """
            }
        }

    @staticmethod
    def get(template_key: str):
        templates = EmailTemplate.get_templates()
        if template_key not in templates:
            raise ValueError(f"Email template '{template_key}' not found")
        return templates[template_key]