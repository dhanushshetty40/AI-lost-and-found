from sqlalchemy.orm import Session
from app.models.user import AuditLog
from typing import Optional

def log_action(
    db: Session,
    action: str,
    details: str,
    user_id: Optional[int] = None,
    ip_address: Optional[str] = "127.0.0.1"
) -> AuditLog:
    """Record an audit log entry for system or administrative actions."""
    entry = AuditLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
