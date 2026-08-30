from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.report import Report, Claim, Notification
from app.models.match import AIMatch
from app.schemas.qr_lifecycle import (
    QRCodeResponse,
    ItemLifecycleResponse,
    LifecycleStep,
    HandoverConfirmRequest,
    HandoverConfirmResponse
)
from app.deps import get_current_user
from app.services.qr_service import generate_report_qr_code
from app.services.audit_service import log_action

router = APIRouter(prefix="/reports", tags=["Item Lifecycle Tracking & QR Codes"])


@router.get("/{report_id}/qr", response_model=QRCodeResponse)
def get_report_qr_code(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate verifiable QR code and printable tag metadata for any item report.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return generate_report_qr_code(report)


@router.get("/{report_id}/lifecycle", response_model=ItemLifecycleResponse)
def get_report_lifecycle_history(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the complete chronological lifecycle timeline for an item report.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Fetch any matches and claims
    matches = db.query(AIMatch).filter(
        (AIMatch.lost_report_id == report_id) | (AIMatch.found_report_id == report_id)
    ).all()
    
    claims = db.query(Claim).filter(Claim.report_id == report_id).all()
    active_claim = claims[0] if claims else None

    # Step 1: Reported
    step_reported = LifecycleStep(
        step_key="REPORTED",
        title=f"Reported as {report.report_type.capitalize()}",
        description=f"Item logged into SmartFind with spatial location '{report.location}'.",
        timestamp=report.created_at,
        is_completed=True,
        is_current=report.status == "ACTIVE" and not matches and not active_claim,
        actor=report.user.full_name if report.user else "User",
        meta_info={"category": report.category, "location": report.location}
    )

    # Step 2: Match Detected
    has_match = len(matches) > 0
    top_match = matches[0] if has_match else None
    step_match = LifecycleStep(
        step_key="MATCH_DETECTED",
        title="AI Potential Match Detected",
        description=f"Multimodal AI scored compatibility at {top_match.overall_score}% ({top_match.confidence_level} confidence)." if top_match else "Awaiting compatible item filing across campus.",
        timestamp=top_match.created_at if top_match else None,
        is_completed=has_match,
        is_current=has_match and (not active_claim or active_claim.status == "PENDING"),
        actor="AI Matching Engine",
        meta_info={"match_score": top_match.overall_score} if top_match else None
    )

    # Step 3: Claim Submitted
    has_claim = active_claim is not None
    step_claim = LifecycleStep(
        step_key="CLAIM_SUBMITTED",
        title="Ownership Claim Submitted",
        description=f"Claimant filed verification details (Verification score: {active_claim.verification_score}%)." if active_claim else "Claimant initiates ownership verification.",
        timestamp=active_claim.created_at if active_claim else None,
        is_completed=has_claim,
        is_current=has_claim and active_claim.status == "UNDER_REVIEW",
        actor="Claimant",
        meta_info={"claim_id": active_claim.id} if active_claim else None
    )

    # Step 4: Verification & Review
    is_verified = active_claim is not None and active_claim.status in ["APPROVED", "COMPLETED"]
    step_verify = LifecycleStep(
        step_key="VERIFICATION",
        title="Ownership Verification & Review",
        description="Finder and administrator reviewed matching attributes and proof document." if is_verified else "Verification answers evaluated against item features.",
        timestamp=active_claim.updated_at if is_verified else None,
        is_completed=is_verified,
        is_current=active_claim is not None and active_claim.status == "APPROVED" and report.status != "RESOLVED",
        actor="Finder / Admin",
        meta_info={"status": active_claim.status} if active_claim else None
    )

    # Step 5: Approved & Contact Released
    step_approved = LifecycleStep(
        step_key="APPROVED",
        title="Claim Approved & Contact Released",
        description="Secure contact channel authorized for physical item handover on campus." if is_verified else "Direct messaging and secure handover protocol activated.",
        timestamp=active_claim.updated_at if is_verified else None,
        is_completed=is_verified,
        is_current=is_verified and report.status != "RESOLVED",
        actor="Security Desk / Finder"
    )

    # Step 6: Physical Handover & Returned
    is_returned = report.status in ["RESOLVED", "CLAIMED", "CLOSED"]
    step_returned = LifecycleStep(
        step_key="RETURNED",
        title="Physical Item Handover Completed",
        description="Item successfully handed over to verified owner with QR verification." if is_returned else "Claimant and Finder confirm in-person handover.",
        timestamp=report.updated_at if is_returned else None,
        is_completed=is_returned,
        is_current=is_returned,
        actor="Owner & Finder"
    )

    # Step 7: Case Closed
    step_closed = LifecycleStep(
        step_key="CLOSED",
        title="Case Closed & Reputation Awarded",
        description="Recovery recorded in campus analytics; +15 reputation awarded." if is_returned else "Final archive of resolved lost & found ticket.",
        timestamp=report.updated_at if is_returned else None,
        is_completed=is_returned,
        is_current=is_returned,
        actor="SmartFind System"
    )

    all_steps = [step_reported, step_match, step_claim, step_verify, step_approved, step_returned, step_closed]
    completed_count = sum(1 for s in all_steps if s.is_completed)
    completion_pct = round((completed_count / len(all_steps)) * 100.0, 1)

    return ItemLifecycleResponse(
        report_id=report.id,
        item_name=report.item_name,
        report_type=report.report_type,
        category=report.category,
        current_status=report.status,
        created_at=report.created_at,
        lifecycle_steps=all_steps,
        completion_percentage=completion_pct,
        is_fully_resolved=is_returned,
        handover_otp_enabled=True
    )


@router.post("/{report_id}/handover-confirm", response_model=HandoverConfirmResponse)
def confirm_item_handover(
    report_id: int,
    payload: HandoverConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Confirm physical item handover, finalize report status to RESOLVED, award reputation, and notify participants.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Authorization: User must be owner, finder, or Admin
    is_owner = report.user_id == current_user.id
    is_admin = current_user.role == "ADMIN"

    # Check if there is an active claim
    claims = db.query(Claim).filter(Claim.report_id == report_id).all()
    active_claim = claims[0] if claims else None

    is_claimant = active_claim and active_claim.claimant_id == current_user.id

    if not (is_owner or is_claimant or is_admin):
        raise HTTPException(status_code=403, detail="You do not have authorization to confirm handover for this item.")

    # Update report status
    report.status = "RESOLVED"
    report.updated_at = datetime.utcnow()

    # Update claim status if present
    if active_claim:
        active_claim.status = "COMPLETED"
        active_claim.updated_at = datetime.utcnow()

    # Award reputation points (+15 pts) to finder/owner
    reputation_points = 15
    current_user.reputation_score += reputation_points

    # Award reputation to the other party if different
    other_user_id = report.user_id if not is_owner else (active_claim.claimant_id if active_claim else None)
    if other_user_id and other_user_id != current_user.id:
        other_user = db.query(User).filter(User.id == other_user_id).first()
        if other_user:
            other_user.reputation_score += reputation_points

    # Create Notifications
    notif_title = f"🎉 Item Handover Confirmed: {report.item_name}"
    notif_msg = f"The handover for '{report.item_name}' (#{report.id}) has been confirmed! +{reputation_points} reputation points awarded."
    
    db.add(Notification(
        user_id=current_user.id,
        notification_type="REPUTATION_UP",
        title=notif_title,
        message=notif_msg,
        link=f"/reports/{'lost' if report.report_type == 'LOST' else 'found'}"
    ))

    if other_user_id and other_user_id != current_user.id:
        db.add(Notification(
            user_id=other_user_id,
            notification_type="REPUTATION_UP",
            title=notif_title,
            message=notif_msg,
            link=f"/reports/{'lost' if report.report_type == 'LOST' else 'found'}"
        ))

    log_action(db, "ITEM_HANDOVER_CONFIRMED", f"User #{current_user.id} confirmed handover of report #{report.id} ('{report.item_name}')", current_user.id)

    db.commit()
    db.refresh(report)

    return HandoverConfirmResponse(
        report_id=report.id,
        status="RESOLVED",
        message=f"Item handover successfully verified! +{reputation_points} reputation points added to your profile.",
        reputation_points_awarded=reputation_points,
        completed_at=datetime.utcnow()
    )
