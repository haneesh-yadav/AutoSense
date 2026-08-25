from app.config import settings
from app.models.fault import FaultEvent


async def send_notification(fault: FaultEvent) -> None:
    if settings.twilio_account_sid and settings.twilio_auth_token:
        _send_sms(fault)
    if settings.firebase_credentials_path:
        _send_push(fault)


def _send_sms(fault: FaultEvent) -> None:
    try:
        from twilio.rest import Client

        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        client.messages.create(
            body=f"[AutoSense] {fault.severity.upper()}: {fault.message} ({fault.code})",
            from_=settings.twilio_phone_number,
            to="",  # would pull from user preferences
        )
    except Exception:
        pass


def _send_push(fault: FaultEvent) -> None:
    try:
        import firebase_admin
        from firebase_admin import credentials, messaging

        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.firebase_credentials_path)
            firebase_admin.initialize_app(cred)

        messaging.send(
            messaging.Message(
                notification=messaging.Notification(
                    title=f"AutoSense {fault.severity.title()} Alert",
                    body=f"{fault.message} ({fault.code})",
                ),
                topic="alerts",
            )
        )
    except Exception:
        pass
