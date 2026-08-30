from sqlalchemy.orm import Session
from app.models.report import Notification

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "SYSTEM",
    link: str = None
) -> Notification:
    """Utility to generate in-app user notifications."""
    notif = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
