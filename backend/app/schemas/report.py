from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# Valid Categories
ITEM_CATEGORIES = [
    "Electronics & Gadgets",
    "Bags & Backpacks",
    "Clothing & Footwear",
    "IDs & Documents",
    "Keys & Access Cards",
    "Wallets & Purses",
    "Books & Stationery",
    "Jewellery & Accessories",
    "Sports Equipment",
    "Others"
]

class ReportBase(BaseModel):
    report_type: str = Field(..., description="'LOST' or 'FOUND'")
    item_name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., max_length=100)
    description: str = Field(..., min_length=5)
    brand: Optional[str] = None
    color: Optional[str] = None
    distinctive_features: Optional[str] = None
    additional_info: Optional[str] = None
    verification_question: Optional[str] = None
    confidential_notes: Optional[str] = None
    location: str = Field(..., min_length=2, max_length=255)
    incident_date: str = Field(..., description="YYYY-MM-DD format")
    incident_time: Optional[str] = None
    image_url: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    distinctive_features: Optional[str] = None
    additional_info: Optional[str] = None
    verification_question: Optional[str] = None
    confidential_notes: Optional[str] = None
    location: Optional[str] = None
    incident_date: Optional[str] = None
    incident_time: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class OwnerInfo(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class ReportResponse(ReportBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    user: Optional[OwnerInfo] = None

    class Config:
        from_attributes = True

class ReportListResponse(BaseModel):
    total: int
    items: List[ReportResponse]
