from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CampusLocationInfo(BaseModel):
    id: str
    name: str
    zone: str
    x: float  # Percentage on map 0-100
    y: float  # Percentage on map 0-100
    icon: str
    description: Optional[str] = None
    total_lost: int = 0
    total_found: int = 0
    total_resolved: int = 0
    recovery_rate_percent: float = 0.0
    risk_level: str = "LOW"  # "LOW", "MEDIUM", "HIGH"

class CampusMapReportItem(BaseModel):
    id: int
    user_id: int
    report_type: str  # "LOST" or "FOUND"
    item_name: str
    category: str
    description: str
    brand: Optional[str] = None
    color: Optional[str] = None
    distinctive_features: Optional[str] = None
    location: str
    campus_location_id: str
    x: float
    y: float
    incident_date: str
    incident_time: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class HeatmapPoint(BaseModel):
    location_id: str
    location_name: str
    zone: str
    x: float
    y: float
    intensity: float  # Normalized density 0.0 - 1.0
    lost_count: int
    found_count: int
    total_count: int
    risk_level: str

class CampusMapDataResponse(BaseModel):
    locations: List[CampusLocationInfo]
    reports: List[CampusMapReportItem]
    total_markers: int
    lost_markers_count: int
    found_markers_count: int
    resolved_markers_count: int
    active_hotspots_count: int

class CategoryComparisonItem(BaseModel):
    category: str
    lost_count: int
    found_count: int
    total_count: int
    recovery_rate: float

class HourlyDistributionItem(BaseModel):
    hour_range: str  # e.g., "08:00 - 10:00"
    hour_key: str    # "8", "10", "12", etc.
    lost_count: int
    found_count: int
    is_peak: bool = False

class WeekdayDistributionItem(BaseModel):
    day_name: str    # "Monday", "Tuesday", etc.
    day_index: int   # 0 to 6
    lost_count: int
    found_count: int
    total_count: int

class MonthlyTrendItem(BaseModel):
    month_label: str  # "Aug 2026", "Sep 2026"
    lost_count: int
    found_count: int
    resolved_count: int
    matches_formed: int

class CampusLocationRiskItem(BaseModel):
    location_name: str
    zone: str
    total_lost: int
    total_found: int
    total_resolved: int
    recovery_rate_percent: float
    risk_level: str  # "HIGH", "MODERATE", "LOW"

class CampusAnalyticsOverviewResponse(BaseModel):
    # Core KPIs
    total_lost: int
    total_found: int
    total_active: int
    total_resolved: int
    overall_recovery_rate: float
    ai_match_success_rate: float
    total_ai_matches: int
    confirmed_matches_count: int
    pending_claims_count: int
    approved_claims_count: int
    avg_resolution_days: float

    # Category Intelligence
    category_comparison: List[CategoryComparisonItem]
    most_lost_category: Optional[str] = None
    most_found_category: Optional[str] = None

    # Temporal Intelligence
    hourly_distribution: List[HourlyDistributionItem]
    peak_loss_time_window: str
    weekday_distribution: List[WeekdayDistributionItem]
    busiest_day: str
    monthly_trends: List[MonthlyTrendItem]

    # Location Intelligence
    location_risk_table: List[CampusLocationRiskItem]
    highest_loss_location: Optional[str] = None
    safest_recovery_location: Optional[str] = None
    heatmap_points: List[HeatmapPoint]

    # Applied Filters metadata
    filters_applied: Dict[str, Any]
