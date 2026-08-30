from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    notification_type: str
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationListResponse(BaseModel):
    unread_count: int
    total: int
    items: List[NotificationResponse]
