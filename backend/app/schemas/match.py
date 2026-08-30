from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.report import ReportResponse

class MatchScoreBreakdown(BaseModel):
    text_score: float = Field(..., description="Text TF-IDF & Fuzzy Cosine Similarity (0-100)")
    image_score: float = Field(..., description="Visual Feature Similarity (0-100)")
    location_score: float = Field(..., description="Campus Spatial Similarity (0-100)")
    date_score: float = Field(..., description="Temporal Proximity Score (0-100)")
    attribute_score: float = Field(..., description="Category, Brand, Color Match Score (0-100)")

class MatchResponse(BaseModel):
    id: int
    lost_report_id: int
    found_report_id: int
    overall_score: float
    confidence_level: str
    breakdown: MatchScoreBreakdown
    explanation: List[str]
    status: str
    created_at: datetime
    lost_report: Optional[ReportResponse] = None
    found_report: Optional[ReportResponse] = None

    class Config:
        from_attributes = True

class MatchListResponse(BaseModel):
    total: int
    high_confidence_count: int
    medium_confidence_count: int
    low_confidence_count: int
    items: List[MatchResponse]

class RunMatchResponse(BaseModel):
    message: str
    matches_generated: int
    reports_processed: int
