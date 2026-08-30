from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="USER", nullable=False)  # "USER" or "ADMIN"
    phone = Column(String(50), nullable=True)
    reputation_score = Column(Integer, default=100, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="claimant", cascade="all, delete-orphan", foreign_keys="[Claim.claimant_id]")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email='{self.email}' role='{self.role}'>"


class AuditLog(Base):
    """
    Model for System Audit Logging (Phase 5).
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    action = Column(String(100), nullable=False, index=True) # "USER_ROLE_CHANGE", "REPORT_DELETE", "AI_MATCH_RUN", "CLAIM_VERIFIED"
    details = Column(Text, nullable=False)
    ip_address = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")
