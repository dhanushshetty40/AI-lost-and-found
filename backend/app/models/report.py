from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Report(Base):
    """
    Model for Lost & Found Item Reports.
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(20), nullable=False, index=True)  # "LOST" or "FOUND"
    
    item_name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    brand = Column(String(100), nullable=True)
    color = Column(String(100), nullable=True)
    distinctive_features = Column(Text, nullable=True)
    additional_info = Column(Text, nullable=True)
    
    # Feature 2: Finder-Generated Verification Question and Confidential Notes
    verification_question = Column(Text, nullable=True)
    confidential_notes = Column(Text, nullable=True)
    
    location = Column(String(255), nullable=False, index=True)
    incident_date = Column(String(50), nullable=False)
    incident_time = Column(String(50), nullable=True)
    
    image_url = Column(String(500), nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False, index=True)  # "ACTIVE", "RESOLVED", "MATCHED", "CLAIMED", "CLOSED"
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
    claims = relationship("Claim", back_populates="report", cascade="all, delete-orphan")


class Claim(Base):
    """
    Model for Ownership Claims on Found Reports.
    """
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claimant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # Legacy compatibility mapping
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    
    verification_question = Column(Text, nullable=True)
    verification_answer = Column(Text, nullable=True)
    proof_image_url = Column(String(500), nullable=True)
    verification_score = Column(Float, default=0.0, nullable=False)
    
    status = Column(String(50), default="PENDING", nullable=False, index=True)  # "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "COMPLETED"
    contact_released = Column(Boolean, default=False, nullable=False)
    owner_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    claimant = relationship("User", foreign_keys=[claimant_id], back_populates="claims")
    user = relationship("User", foreign_keys=[user_id])
    report = relationship("Report", back_populates="claims")


class Notification(Base):
    """
    Model for System & User Notifications.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    notification_type = Column(String(50), default="SYSTEM", nullable=False) # "MATCH_ALERT", "CLAIM_RECEIVED", "CLAIM_APPROVED", "CLAIM_REJECTED", "REPUTATION_UP"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
