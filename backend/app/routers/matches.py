import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.models.match import AIMatch
from app.schemas.match import MatchResponse, MatchListResponse, RunMatchResponse
from app.deps import get_current_user
from app.services.ai_matcher import compute_multimodal_match

router = APIRouter(prefix="/matches", tags=["AI Matching Engine"])

def run_ai_matching_for_report(db: Session, target_report: Report) -> int:
    """
    Executes AI similarity algorithm for a given report against all active complementary reports.
    If target is LOST, compares against all active FOUND reports.
    If target is FOUND, compares against all active LOST reports.
    Saves/updates AIMatch records with score >= 35.0%.
    """
    if target_report.report_type.upper() == "LOST":
        complementary = db.query(Report).filter(
            Report.report_type == "FOUND",
            Report.status == "ACTIVE",
            Report.id != target_report.id
        ).all()
        lost_reports = [target_report]
        found_reports = complementary
    else:
        complementary = db.query(Report).filter(
            Report.report_type == "LOST",
            Report.status == "ACTIVE",
            Report.id != target_report.id
        ).all()
        lost_reports = complementary
        found_reports = [target_report]

    matches_created = 0
    for lost in lost_reports:
        for found in found_reports:
            match_data = compute_multimodal_match(lost, found)
            
            # Only save meaningful matches (>= 35.0% score)
            if match_data["overall_score"] >= 35.0:
                existing = db.query(AIMatch).filter(
                    AIMatch.lost_report_id == lost.id,
                    AIMatch.found_report_id == found.id
                ).first()
                
                explanation_str = json.dumps(match_data["explanation"])
                
                if existing:
                    existing.overall_score = match_data["overall_score"]
                    existing.confidence_level = match_data["confidence_level"]
                    existing.text_score = match_data["text_score"]
                    existing.image_score = match_data["image_score"]
                    existing.location_score = match_data["location_score"]
                    existing.date_score = match_data["date_score"]
                    existing.attribute_score = match_data["attribute_score"]
                    existing.explanation = explanation_str
                else:
                    new_match = AIMatch(
                        lost_report_id=lost.id,
                        found_report_id=found.id,
                        overall_score=match_data["overall_score"],
                        confidence_level=match_data["confidence_level"],
                        text_score=match_data["text_score"],
                        image_score=match_data["image_score"],
                        location_score=match_data["location_score"],
                        date_score=match_data["date_score"],
                        attribute_score=match_data["attribute_score"],
                        explanation=explanation_str,
                        status="PENDING"
                    )
                    db.add(new_match)
                    matches_created += 1
                    
    db.commit()
    return matches_created


@router.post("/run", response_model=RunMatchResponse)
def trigger_ai_matching_engine(
    report_id: Optional[int] = Query(None, description="Optional target report ID to match"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger AI matching engine manually across active reports."""
    if report_id:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        created_count = run_ai_matching_for_report(db, report)
        return {
            "message": f"AI matching completed for report #{report_id}.",
            "matches_generated": created_count,
            "reports_processed": 1
        }
        
    # Batch run all active reports
    active_reports = db.query(Report).filter(Report.status == "ACTIVE").all()
    created_total = 0
    for rep in active_reports:
        created_total += run_ai_matching_for_report(db, rep)
        
    return {
        "message": "System-wide AI Multimodal Matching Engine batch run completed.",
        "matches_generated": created_total,
        "reports_processed": len(active_reports)
    }


@router.get("", response_model=MatchListResponse)
def list_ai_matches(
    confidence_level: Optional[str] = Query(None, description="Filter by HIGH, MEDIUM, LOW"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by PENDING, CONFIRMED, REJECTED"),
    report_id: Optional[int] = Query(None, description="Filter matches for specific report ID"),
    all_matches: Optional[bool] = Query(False, description="Admin flag to list system-wide matches"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List potential AI matches for logged in user's reports (or all matches if Admin)."""
    q = db.query(AIMatch)
    
    # Filter by user ownership unless admin requests all_matches
    is_admin = current_user.role.upper() == "ADMIN"
    if not (all_matches and is_admin):
        # User sees matches where they own either the lost or found report
        user_report_ids = [r.id for r in db.query(Report.id).filter(Report.user_id == current_user.id).all()]
        q = q.filter(
            or_(
                AIMatch.lost_report_id.in_(user_report_ids),
                AIMatch.found_report_id.in_(user_report_ids)
            )
        )
        
    if report_id:
        q = q.filter(
            or_(
                AIMatch.lost_report_id == report_id,
                AIMatch.found_report_id == report_id
            )
        )
        
    if confidence_level:
        q = q.filter(AIMatch.confidence_level == confidence_level.upper())
        
    if status_filter:
        q = q.filter(AIMatch.status == status_filter.upper())
        
    matches = q.order_by(AIMatch.overall_score.desc()).all()
    
    # Process breakdown & JSON explanation for response schema
    items_out = []
    high_count = 0
    med_count = 0
    low_count = 0
    
    for m in matches:
        if m.confidence_level == "HIGH":
            high_count += 1
        elif m.confidence_level == "MEDIUM":
            med_count += 1
        else:
            low_count += 1
            
        try:
            exp_list = json.loads(m.explanation)
        except Exception:
            exp_list = [m.explanation]
            
        item_dict = {
            "id": m.id,
            "lost_report_id": m.lost_report_id,
            "found_report_id": m.found_report_id,
            "overall_score": m.overall_score,
            "confidence_level": m.confidence_level,
            "breakdown": {
                "text_score": m.text_score,
                "image_score": m.image_score,
                "location_score": m.location_score,
                "date_score": m.date_score,
                "attribute_score": m.attribute_score
            },
            "explanation": exp_list,
            "status": m.status,
            "created_at": m.created_at,
            "lost_report": m.lost_report,
            "found_report": m.found_report
        }
        items_out.append(item_dict)
        
    return {
        "total": len(items_out),
        "high_confidence_count": high_count,
        "medium_confidence_count": med_count,
        "low_confidence_count": low_count,
        "items": items_out
    }


@router.get("/{match_id}", response_model=MatchResponse)
def get_match_by_id(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single AI match comparison details."""
    match = db.query(AIMatch).filter(AIMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="AI Match not found")
        
    try:
        exp_list = json.loads(match.explanation)
    except Exception:
        exp_list = [match.explanation]
        
    return {
        "id": match.id,
        "lost_report_id": match.lost_report_id,
        "found_report_id": match.found_report_id,
        "overall_score": match.overall_score,
        "confidence_level": match.confidence_level,
        "breakdown": {
            "text_score": match.text_score,
            "image_score": match.image_score,
            "location_score": match.location_score,
            "date_score": match.date_score,
            "attribute_score": match.attribute_score
        },
        "explanation": exp_list,
        "status": match.status,
        "created_at": match.created_at,
        "lost_report": match.lost_report,
        "found_report": match.found_report
    }


@router.post("/{match_id}/confirm")
def confirm_match_decision(
    match_id: int,
    action: str = Query(..., description="'confirm' or 'reject'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Confirm or reject an AI match recommendation."""
    match = db.query(AIMatch).filter(AIMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="AI Match not found")
        
    act_upper = action.upper()
    if act_upper not in ["CONFIRM", "REJECT"]:
        raise HTTPException(status_code=400, detail="Action must be 'confirm' or 'reject'")
        
    if act_upper == "CONFIRM":
        match.status = "CONFIRMED"
        # Update associated reports to MATCHED status
        if match.lost_report:
            match.lost_report.status = "MATCHED"
        if match.found_report:
            match.found_report.status = "MATCHED"
    else:
        match.status = "REJECTED"
        
    db.commit()
    return {"message": f"AI Match status updated to {match.status}", "match_id": match_id}
