from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.user import UserResponse
from app.schemas.report import ReportResponse

class ClaimCreate(BaseModel):
    report_id: int = Field(..., description="ID of the Found item report being claimed")
    verification_answer: str = Field(..., min_length=3, description="Answer to ownership verification question")
    proof_image_url: Optional[str] = Field(None, description="Uploaded proof document URL (receipt, serial number, photo)")

class ClaimReview(BaseModel):
    action: str = Field(..., description="'approve' or 'reject'")
    owner_notes: Optional[str] = Field(None, description="Notes to claimant")

class ClaimResponse(BaseModel):
    id: int
    claimant_id: int
    report_id: int
    verification_question: Optional[str] = None
    verification_answer: Optional[str] = None
    proof_image_url: Optional[str] = None
    verification_score: float
    status: str
    contact_released: bool
    owner_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    claimant: Optional[UserResponse] = None
    report: Optional[ReportResponse] = None

    class Config:
        from_attributes = True

class ClaimListResponse(BaseModel):
    total: int
    pending_count: int
    approved_count: int
    rejected_count: int
    items: List[ClaimResponse]
