from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel
from app.schemas.user import UserResponse

class CategoryDistributionItem(BaseModel):
    category: str
    count: int
    percentage: float

class AnalyticsOverviewResponse(BaseModel):
    total_users: int
    admin_users_count: int
    total_reports: int
    lost_reports_count: int
    found_reports_count: int
    active_reports_count: int
    resolved_reports_count: int
    resolution_rate_percent: float
    total_ai_matches: int
    confirmed_matches_count: int
    total_claims: int
    approved_claims_count: int
    average_ai_match_score: float
    category_distribution: List[CategoryDistributionItem]

class SystemHealthResponse(BaseModel):
    status: str
    database_connected: bool
    version: str
    active_tables_count: int
    environment: str
    timestamp: datetime

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details: str
    ip_address: Optional[str] = None
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class AuditLogListResponse(BaseModel):
    total: int
    items: List[AuditLogResponse]
