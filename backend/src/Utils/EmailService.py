import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class EmailService:
    def __init__(self, smtp_server, smtp_port, username, password):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password

        # Log only once
        # print(f"EmailService ready: {smtp_server}:{smtp_port}, user={username}")

    def send_email(self, to_email: str, subject: str, body: str):
        """Send email with detailed error handling."""
        try:
            print(f"\n=== Sending Email ===")
            print(f"To: {to_email} | Subject: {subject}")

            # Build message
            msg = MIMEMultipart()
            msg["Subject"] = subject
            msg["From"] = self.username
            msg["To"] = to_email
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
