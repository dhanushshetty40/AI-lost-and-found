import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse, ReportListResponse, ITEM_CATEGORIES
from app.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/reports", tags=["Reports"])


UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

@router.get("/categories", response_model=List[str])
def get_categories():
    """Return available item categories."""
    return ITEM_CATEGORIES

@router.post("/upload-image")
async def upload_report_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload an item image and return relative URL."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)
    
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")
        
    with open(filepath, "wb") as f:
        f.write(contents)
        
    image_url = f"/uploads/{unique_filename}"
    return {"image_url": image_url, "filename": unique_filename}

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new lost or found item report."""
    report_type_upper = report_in.report_type.upper()
    if report_type_upper not in ["LOST", "FOUND"]:
        raise HTTPException(status_code=400, detail="Report type must be either 'LOST' or 'FOUND'.")
        
    new_report = Report(
        user_id=current_user.id,
        report_type=report_type_upper,
        item_name=report_in.item_name,
        category=report_in.category,
        description=report_in.description,
        brand=report_in.brand,
        color=report_in.color,
        distinctive_features=report_in.distinctive_features,
        additional_info=report_in.additional_info,
        verification_question=report_in.verification_question,
        confidential_notes=report_in.confidential_notes,
        location=report_in.location,
        incident_date=report_in.incident_date,
        incident_time=report_in.incident_time,
        image_url=report_in.image_url,
        status="ACTIVE"
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    # Auto-trigger AI matching engine for newly created report
    try:
        from app.routers.matches import run_ai_matching_for_report
        run_ai_matching_for_report(db, new_report)
    except Exception as e:
        print(f"[WARNING] Auto AI match failed: {e}")
        
    return new_report

@router.get("", response_model=ReportListResponse)
def list_reports(
    query: Optional[str] = Query(None, description="Search term for item name, description, brand, location"),
    report_type: Optional[str] = Query(None, description="Filter by LOST or FOUND"),
    category: Optional[str] = Query(None, description="Filter by Category"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by Report Status"),
    my_reports: Optional[bool] = Query(False, description="Filter logged in user's reports"),
    sort_by: Optional[str] = Query("newest", description="'newest' or 'oldest'"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """List & search reports with category, type, and user filters."""
    q = db.query(Report)
    
    if my_reports and current_user:
        q = q.filter(Report.user_id == current_user.id)
        
    if report_type:
        q = q.filter(Report.report_type == report_type.upper())
        
    if category and category != "All":
        q = q.filter(Report.category == category)
        
    if status_filter:
        q = q.filter(Report.status == status_filter.upper())
        
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            or_(
                Report.item_name.ilike(search_pattern),
                Report.description.ilike(search_pattern),
                Report.location.ilike(search_pattern),
                Report.brand.ilike(search_pattern),
                Report.color.ilike(search_pattern),
                Report.category.ilike(search_pattern)
            )
        )
        
    if sort_by == "oldest":
        q = q.order_by(Report.created_at.asc())
    else:
        q = q.order_by(Report.created_at.desc())
        
    reports = q.all()
    return {"total": len(reports), "items": reports}

@router.get("/{report_id}", response_model=ReportResponse)
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    """Get single report details."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report

@router.put("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: int,
    report_update: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update report (Owner or Admin authorization)."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    # Security check: only report owner or Admin can update
    is_admin = current_user.role.upper() == "ADMIN"
    if report.user_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this report."
        )
        
    update_data = report_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            if field == "report_type":
                setattr(report, field, value.upper())
            else:
                setattr(report, field, value)
                
    db.commit()
    db.refresh(report)
    return report

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete report (Owner or Admin authorization)."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    is_admin = current_user.role.upper() == "ADMIN"
    if report.user_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this report."
        )
        
    # Cascade clean any associated AI matches
    from app.models.match import AIMatch
    db.query(AIMatch).filter(
        (AIMatch.lost_report_id == report_id) | (AIMatch.found_report_id == report_id)
    ).delete(synchronize_session=False)

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully", "id": report_id}
