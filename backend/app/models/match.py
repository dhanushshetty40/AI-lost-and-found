from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AIMatch(Base):
    """
    Model storing computed AI Multimodal Match results between Lost and Found reports.
    """
    __tablename__ = "ai_matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    found_report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)

    overall_score = Column(Float, nullable=False, index=True)  # Percentage 0.0 - 100.0
    confidence_level = Column(String(20), nullable=False, index=True)  # "HIGH", "MEDIUM", "LOW"

    # Score Breakdown components
    text_score = Column(Float, nullable=False)
    image_score = Column(Float, nullable=False)
    location_score = Column(Float, nullable=False)
    date_score = Column(Float, nullable=False)
    attribute_score = Column(Float, nullable=False)

    # Human-readable Explainable AI rationale
    explanation = Column(Text, nullable=False)
    
    # Status: "PENDING", "CONFIRMED", "REJECTED"
    status = Column(String(50), default="PENDING", nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    lost_report = relationship("Report", foreign_keys=[lost_report_id])
    found_report = relationship("Report", foreign_keys=[found_report_id])
