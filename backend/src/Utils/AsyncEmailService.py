from email.message import EmailMessage
from aiosmtplib import SMTP
import asyncio
import threading


class AsyncEmailService:
    def __init__(self, smtp_server, smtp_port, username, password):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password

    async def send_email(self, to_email: str, subject: str, body: str):
        try:
            print("\n=== Sending Email (async) ===")
            print(f"To: {to_email} | Subject: {subject}")

            msg = EmailMessage()
            msg["From"] = self.username
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.set_content(body)

            smtp = SMTP(
                hostname=self.smtp_server,
                port=self.smtp_port,
                start_tls=True,
                timeout=10,
            )

            await smtp.connect()
            await smtp.login(self.username, self.password)
            await smtp.send_message(msg)
            await smtp.quit()

            print(f"✓ Email sent to {to_email}")

        except Exception as e:
            print(f"✗ Email failed: {e}")
            raise

    # ✅ THIS IS THE KEY FIX
    def send_email_background(self, to_email, subject, body):
        """
        Safe for Flask / sync apps
        """

        def runner():
            asyncio.run(
                self.send_email(to_email, subject, body)
            )

        threading.Thread(
            target=runner,
            daemon=True
        ).start()
