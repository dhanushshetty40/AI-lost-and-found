from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/dashboard-stats")
def get_user_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve user statistics
    lost_count = len([r for r in current_user.reports if r.report_type == "LOST"]) if hasattr(current_user, "reports") else 0
    found_count = len([r for r in current_user.reports if r.report_type == "FOUND"]) if hasattr(current_user, "reports") else 0
    claims_count = len(current_user.claims) if hasattr(current_user, "claims") else 0
    
    return {
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "reputation_score": current_user.reputation_score,
        "stats": {
            "lost_reports": lost_count,
            "found_reports": found_count,
            "potential_matches": 0,  # Placeholder for Phase 3
            "active_claims": claims_count,
            "resolved_items": 0
        }
    }
