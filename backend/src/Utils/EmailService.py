import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


class EmailService:
    def __init__(self, smtp_server, smtp_port, username, password):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password

    def send_email(self, to_email: str, subject: str, body: str, html: bool = False):
        """Send email with detailed error handling."""
        try:
            print(f"\n=== Sending Email ===")
            print(f"To: {to_email} | Subject: {subject}")

            # Build message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.username
            msg["To"] = to_email

            # Attach body as HTML or plain text
            if html:
                msg.attach(MIMEText(body, "html"))
            else:
                msg.attach(MIMEText(body, "plain"))

            # SMTP connection
            with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=30) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.sendmail(self.username, to_email, msg.as_string())

            print(f"✓ Email sent to {to_email}")
            return True

        except smtplib.SMTPAuthenticationError as e:
            print(f"✗ SMTP Authentication failed: {e}")
            raise

        except smtplib.SMTPException as e:
            print(f"✗ SMTP Error: {e}")
            raise

        except Exception as e:
            print(f"✗ Unexpected error: {e}")
            raise

    def send_otp_email(self, recipient_email: str, otp: str, purpose: str = "verification"):
        """Send OTP via email with beautiful HTML template"""
        try:
            subject = ""
            body = ""
            
            if purpose == "verification":
                subject = "Verify Your HiRekruit Account"
                body = f"""
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
            
            elif purpose == "password_reset":
                subject = "Reset Your HiRekruit Password"
                body = f"""
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
            
            # Send HTML email
            return self.send_email(recipient_email, subject, body, html=True)
            
        except Exception as e:
            print(f"Error sending OTP email: {str(e)}")
            return False

    def send_welcome_email(self, recipient_email: str, name: str):
        """Send welcome email after successful registration"""
        try:
            subject = "Welcome to HiRekruit!"
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            
            body = f"""
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
            
            return self.send_email(recipient_email, subject, body, html=True)
            
        except Exception as e:
            print(f"Error sending welcome email: {str(e)}")
            return False

    def send_password_changed_notification(self, recipient_email: str, name: str):
        """Send notification when password is successfully changed"""
        try:
            subject = "Your HiRekruit Password Has Been Changed"
            
            body = f"""
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
                                                Hi {name},
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
            
            return self.send_email(recipient_email, subject, body, html=True)
            
        except Exception as e:
            print(f"Error sending password change notification: {str(e)}")
            return False


# Initialize email service (to be used in auth_controller)
# def get_email_service():
#     """Factory function to create EmailService instance"""
#     return EmailService(
#         smtp_server=os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
#         smtp_port=int(os.getenv('SMTP_PORT', 587)),
#         username=os.getenv('EMAIL_USERNAME'),
#         password=os.getenv('EMAIL_PASSWORD')
#     )