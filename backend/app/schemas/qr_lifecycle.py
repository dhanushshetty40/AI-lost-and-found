from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class QRCodeResponse(BaseModel):
    report_id: int
    item_name: str
    report_type: str
    category: str
    location: str
    qr_data_url: str  # Base64 encoded PNG or SVG data URI
    verification_url: str
    item_tag_code: str
    status: str
    owner_name: Optional[str] = None
    created_at: str

class LifecycleStep(BaseModel):
    step_key: str  # "REPORTED", "MATCH_DETECTED", "CLAIM_SUBMITTED", "VERIFICATION", "APPROVED", "RETURNED", "CLOSED"
    title: str
    description: str
    timestamp: Optional[datetime] = None
    is_completed: bool = False
    is_current: bool = False
    actor: Optional[str] = None  # "Owner", "Finder", "AI Matching Engine", "System Admin"
    meta_info: Optional[Dict[str, Any]] = None

class ItemLifecycleResponse(BaseModel):
    report_id: int
    item_name: str
    report_type: str
    category: str
    current_status: str
    created_at: datetime
    lifecycle_steps: List[LifecycleStep]
    completion_percentage: float
    is_fully_resolved: bool
    handover_otp_enabled: bool = True

class HandoverConfirmRequest(BaseModel):
    handover_otp: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[int] = 5

class HandoverConfirmResponse(BaseModel):
    report_id: int
    status: str
    message: str
    reputation_points_awarded: int
    completed_at: datetime
