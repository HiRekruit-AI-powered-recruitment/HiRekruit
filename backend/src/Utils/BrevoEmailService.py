import os
import threading
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException


class BrevoEmailService:
    def __init__(self):
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key["api-key"] = os.getenv("BREVO_API_KEY")

        self.api_client = sib_api_v3_sdk.ApiClient(configuration)
        self.sender_email = os.getenv("BREVO_SENDER_EMAIL")
        self.sender_name = os.getenv("BREVO_SENDER_NAME", "HireKruit")

    def _send_email(self, to_email, subject, body):
        try:
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(self.api_client)

            email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": to_email}],
                sender={
                    "email": self.sender_email,
                    "name": self.sender_name,
                },
                subject=subject,
                text_content=body,
            )

            api_instance.send_transac_email(email)
            print(f"✓ Email delivered to {to_email} by Brevo")

        except ApiException as e:
            print(f"✗ Brevo API error for {to_email}: {e}")

        except Exception as e:
            print(f"✗ Unexpected email error for {to_email}: {e}")

    def send_email_background(self, to_email, subject, body):
        threading.Thread(
            target=self._send_email,
            args=(to_email, subject, body),
            daemon=True
        ).start()
