from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User, AuditLog
from app.models.report import Report, Claim
from app.models.match import AIMatch
from app.schemas.user import UserResponse
from app.schemas.report import ReportResponse, ReportListResponse
from app.schemas.admin import AnalyticsOverviewResponse, SystemHealthResponse, AuditLogListResponse, CategoryDistributionItem
from app.deps import get_current_admin_user
from app.services.audit_service import log_action

router = APIRouter(prefix="/admin", tags=["Admin Dashboard & System Monitoring"])

@router.get("/analytics", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Retrieve system analytics metrics and distribution statistics."""
    total_users = db.query(User).count()
    admin_users = db.query(User).filter(User.role == "ADMIN").count()
    
    total_reports = db.query(Report).count()
    lost_reports = db.query(Report).filter(Report.report_type == "LOST").count()
    found_reports = db.query(Report).filter(Report.report_type == "FOUND").count()
    active_reports = db.query(Report).filter(Report.status == "ACTIVE").count()
    resolved_reports = db.query(Report).filter(Report.status.in_(["RESOLVED", "CLAIMED"])).count()
    
    resolution_rate = round((resolved_reports / total_reports * 100.0), 2) if total_reports > 0 else 0.0
    
    total_ai_matches = db.query(AIMatch).count()
    confirmed_matches = db.query(AIMatch).filter(AIMatch.status == "CONFIRMED").count()
    avg_score_res = db.query(func.avg(AIMatch.overall_score)).scalar()
    avg_score = round(float(avg_score_res), 2) if avg_score_res is not None else 0.0
    
    total_claims = db.query(Claim).count()
    approved_claims = db.query(Claim).filter(Claim.status.in_(["APPROVED", "COMPLETED"])).count()
    
    # Category Distribution
    cat_counts = db.query(Report.category, func.count(Report.id)).group_by(Report.category).all()
    cat_items = []
    for cat, count in cat_counts:
        pct = round((count / total_reports * 100.0), 2) if total_reports > 0 else 0.0
        cat_items.append(CategoryDistributionItem(category=cat, count=count, percentage=pct))
        
    return {
        "total_users": total_users,
        "admin_users_count": admin_users,
        "total_reports": total_reports,
        "lost_reports_count": lost_reports,
        "found_reports_count": found_reports,
        "active_reports_count": active_reports,
        "resolved_reports_count": resolved_reports,
        "resolution_rate_percent": resolution_rate,
        "total_ai_matches": total_ai_matches,
        "confirmed_matches_count": confirmed_matches,
        "total_claims": total_claims,
        "approved_claims_count": approved_claims,
        "average_ai_match_score": avg_score,
        "category_distribution": cat_items
    }


@router.get("/health", response_model=SystemHealthResponse)
def get_system_health(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Retrieve system operational health status."""
    try:
        db.execute(func.now())
        db_connected = True
    except Exception:
        db_connected = False
        
    return {
        "status": "HEALTHY" if db_connected else "DEGRADED",
        "database_connected": db_connected,
        "version": "v1.0.0-Phase5",
        "active_tables_count": 5,
        "environment": "production",
        "timestamp": datetime.utcnow()
    }


@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """List registered users with role filter and search."""
    q = db.query(User)
    if search:
        term = f"%{search.strip()}%"
        q = q.filter(User.full_name.ilike(term) | User.email.ilike(term))
    if role:
        q = q.filter(User.role == role.upper())
        
    return q.order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    new_role: str = Query(..., description="'ADMIN' or 'USER'"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Grant or revoke administrator privileges."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot alter your own logged-in administrator role.")
        
    role_upper = new_role.upper()
    if role_upper not in ["ADMIN", "USER"]:
        raise HTTPException(status_code=400, detail="Role must be 'ADMIN' or 'USER'.")
        
    old_role = target_user.role
    target_user.role = role_upper
    db.commit()
    db.refresh(target_user)
    
    log_action(db, "USER_ROLE_CHANGE", f"Changed role of user #{user_id} ({target_user.email}) from {old_role} to {role_upper}", admin.id)
    return target_user


@router.put("/users/{user_id}/toggle-status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Enable or disable user access account."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot toggle status of logged-in admin account.")
        
    target_user.is_active = not target_user.is_active
    db.commit()
    db.refresh(target_user)
    
    status_str = "ENABLED" if target_user.is_active else "DISABLED"
    log_action(db, "USER_STATUS_TOGGLE", f"{status_str} account for user #{user_id} ({target_user.email})", admin.id)
    return target_user


@router.get("/reports", response_model=ReportListResponse)
def admin_list_reports(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Moderate all system item reports."""
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return {
        "total": len(reports),
        "page": 1,
        "size": len(reports),
        "items": reports
    }


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Admin force-delete an item report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    item_title = report.item_name
    db.delete(report)
    db.commit()
    
    log_action(db, "REPORT_DELETE", f"Admin deleted report #{report_id} ('{item_title}')", admin.id)
    return None


@router.get("/audit-logs", response_model=AuditLogListResponse)
def get_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Fetch system audit log entries."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    return {
        "total": len(logs),
        "items": logs
    }
