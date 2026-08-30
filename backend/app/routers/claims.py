import difflib
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
import uuid

from app.database import get_db
from app.models.user import User
from app.models.report import Report, Claim
from app.schemas.claim import ClaimCreate, ClaimReview, ClaimResponse, ClaimListResponse
from app.deps import get_current_user
from app.services.notification_service import create_notification

router = APIRouter(prefix="/claims", tags=["Claims & Verification"])

def calculate_verification_score(answer: str, report: Report) -> float:
    """
    Evaluates claimant's verification answer against item's distinctive features & description.
    Returns calculated score between 0.0% and 100.0%.
    """
    if not answer:
        return 0.0
        
    ans_clean = answer.strip().lower()
    target_text = f"{report.item_name} {report.description} {report.distinctive_features or ''} {report.color or ''} {report.brand or ''}".lower()
    
    # 1. Sequence matcher fuzzy ratio
    seq_ratio = difflib.SequenceMatcher(None, ans_clean, target_text).ratio()
    
    # 2. Token overlap ratio
    ans_tokens = set(ans_clean.split())
    target_tokens = set(target_text.split())
    
    if not ans_tokens:
        overlap = 0.0
    else:
        matched_tokens = ans_tokens.intersection(target_tokens)
        overlap = len(matched_tokens) / len(ans_tokens)
        
    score = (overlap * 70.0) + (seq_ratio * 30.0)
    # Boost if length >= 15 characters and contains matched features
    if len(ans_clean) >= 15 and overlap > 0.3:
        score += 15.0
        
    return round(min(100.0, max(25.0, score)), 2)


@router.post("", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def create_claim(
    claim_in: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """File a new ownership claim for a found item report."""
    report = db.query(Report).filter(Report.id == claim_in.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Found item report not found.")
        
    if report.report_type.upper() != "FOUND":
        raise HTTPException(status_code=400, detail="Claims can only be filed on FOUND item reports.")
        
    if report.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot file a claim on your own report.")
        
    # Check for existing pending claim by this user
    existing = db.query(Claim).filter(
        Claim.claimant_id == current_user.id,
        Claim.report_id == report.id,
        Claim.status.in_(["PENDING", "APPROVED", "COMPLETED"])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active claim filed for this item.")
        
    ver_question = f"Please describe any distinctive markings, serial numbers, wallpapers, or proof of ownership for '{report.item_name}'."
    ver_score = calculate_verification_score(claim_in.verification_answer, report)
    
    new_claim = Claim(
        claimant_id=current_user.id,
        user_id=current_user.id, # legacy mapping
        report_id=report.id,
        verification_question=ver_question,
        verification_answer=claim_in.verification_answer,
        proof_image_url=claim_in.proof_image_url,
        verification_score=ver_score,
        status="PENDING",
        contact_released=False
    )
    
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    
    # Notify item finder/reporter
    create_notification(
        db=db,
        user_id=report.user_id,
        notification_type="CLAIM_RECEIVED",
        title="New Claim Filed on Found Item",
        message=f"{current_user.full_name} filed an ownership claim for '{report.item_name}' with a verification score of {ver_score}%.",
        link=f"/claims/{new_claim.id}"
    )
    
    return new_claim


@router.post("/{claim_id}/upload-proof")
def upload_claim_proof(
    claim_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload proof of ownership document or receipt image for a claim."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
        
    if claim.claimant_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to update this claim.")
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".pdf"]:
        raise HTTPException(status_code=400, detail="File format not supported. Upload JPG, PNG, WEBP, or PDF.")
        
    upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    unique_filename = f"proof_{uuid.uuid4().hex[:10]}{ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        
    proof_url = f"/uploads/{unique_filename}"
    claim.proof_image_url = proof_url
    db.commit()
    
    return {"message": "Proof document uploaded successfully", "proof_image_url": proof_url}


@router.get("", response_model=ClaimListResponse)
def list_claims(
    mode: str = Query("filed", description="'filed' (claims filed by me) or 'received' (claims on my reports)"),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List claims filed by user or received on user's reports."""
    q = db.query(Claim)
    
    if mode == "received":
        # Claims filed on reports owned by current_user
        user_report_ids = [r.id for r in db.query(Report.id).filter(Report.user_id == current_user.id).all()]
        q = q.filter(Claim.report_id.in_(user_report_ids))
    else:
        # Claims filed by current_user
        q = q.filter(Claim.claimant_id == current_user.id)
        
    if status_filter:
        q = q.filter(Claim.status == status_filter.upper())
        
    claims = q.order_by(Claim.created_at.desc()).all()
    
    pending = sum(1 for c in claims if c.status == "PENDING")
    approved = sum(1 for c in claims if c.status in ["APPROVED", "COMPLETED"])
    rejected = sum(1 for c in claims if c.status == "REJECTED")
    
    return {
        "total": len(claims),
        "pending_count": pending,
        "approved_count": approved,
        "rejected_count": rejected,
        "items": claims
    }


@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim_by_id(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single claim details."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
        
    # Check access: claimant, report owner, or admin
    is_claimant = claim.claimant_id == current_user.id
    is_owner = claim.report and claim.report.user_id == current_user.id
    is_admin = current_user.role == "ADMIN"
    
    if not (is_claimant or is_owner or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to view this claim.")
        
    return claim


@router.post("/{claim_id}/verify", response_model=ClaimResponse)
def verify_claim(
    claim_id: int,
    review: ClaimReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve or Reject an ownership claim (performed by item finder or admin)."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
        
    is_owner = claim.report and claim.report.user_id == current_user.id
    is_admin = current_user.role == "ADMIN"
    
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="Only the item finder/reporter can approve or reject claims.")
        
    act_upper = review.action.upper()
    if act_upper not in ["APPROVE", "REJECT"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'.")
        
    claim.owner_notes = review.owner_notes
    
    if act_upper == "APPROVE":
        claim.status = "APPROVED"
        claim.contact_released = True
        if claim.report:
            claim.report.status = "CLAIMED"
            
        # Notify claimant
        create_notification(
            db=db,
            user_id=claim.claimant_id,
            notification_type="CLAIM_APPROVED",
            title="Ownership Claim Approved! 🎉",
            message=f"Your claim for '{claim.report.item_name}' was approved! Finder contact info has been released.",
            link=f"/claims/{claim.id}"
        )
    else:
        claim.status = "REJECTED"
        claim.contact_released = False
        
        # Notify claimant
        create_notification(
            db=db,
            user_id=claim.claimant_id,
            notification_type="CLAIM_REJECTED",
            title="Claim Verification Status Updated",
            message=f"Your claim for '{claim.report.item_name}' was reviewed and rejected by the finder.",
            link=f"/claims/{claim.id}"
        )
        
    db.commit()
    db.refresh(claim)
    return claim


@router.post("/{claim_id}/complete")
def complete_claim_exchange(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Confirm successful physical item exchange & award finder +10 reputation score!"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
        
    if claim.status != "APPROVED":
        raise HTTPException(status_code=400, detail="Only approved claims can be marked as completed.")
        
    claim.status = "COMPLETED"
    if claim.report:
        claim.report.status = "RESOLVED"
        # Increase finder reputation score
        finder = db.query(User).filter(User.id == claim.report.user_id).first()
        if finder:
            finder.reputation_score += 10
            
            # Notify finder of reputation increase
            create_notification(
                db=db,
                user_id=finder.id,
                notification_type="REPUTATION_UP",
                title="Reputation Score Boost! +10 Points 🌟",
                message=f"Successful handover confirmed for '{claim.report.item_name}'. Your campus reputation score is now {finder.reputation_score}!",
                link="/profile"
            )
            
    db.commit()
    return {"message": "Item handover completed successfully! Reputation score updated.", "claim_id": claim.id}
