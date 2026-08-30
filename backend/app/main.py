import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.report import Report
import app.models
from app.security import get_password_hash
from app.routers import (
    auth_router, users_router, admin_router,
    reports_router, matches_router, claims_router,
    notifications_router, analytics_router,
    lifecycle_router, experiments_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SmartFind - AI-Powered Multimodal Lost & Found Matching System API"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(matches_router, prefix=settings.API_V1_STR)
app.include_router(claims_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(lifecycle_router, prefix=settings.API_V1_STR)
app.include_router(experiments_router, prefix=settings.API_V1_STR)

def seed_initial_data():
    """Seed default Admin, Demo User, and sample Lost/Found reports if not existing."""
    db = SessionLocal()
    try:
        # Seed Admin
        admin = db.query(User).filter(User.email == "admin@smartfind.com").first()
        if not admin:
            admin = User(
                email="admin@smartfind.com",
                full_name="System Administrator",
                hashed_password=get_password_hash("Admin@123"),
                role="ADMIN",
                phone="+1 (555) 019-2831",
                reputation_score=100
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # Seed Demo User
        user = db.query(User).filter(User.email == "user@smartfind.com").first()
        if not user:
            user = User(
                email="user@smartfind.com",
                full_name="Alex Student",
                hashed_password=get_password_hash("User@123"),
                role="USER",
                phone="+1 (555) 012-9482",
                reputation_score=100
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Seed initial reports if empty
        if db.query(Report).count() == 0:
            sample_reports = [
                Report(
                    user_id=user.id,
                    report_type="LOST",
                    item_name="Apple MacBook Pro 14-inch",
                    category="Electronics & Gadgets",
                    description="Space Gray MacBook Pro 14-inch (M2 Pro) left in a black leather sleeve during CS302 lecture.",
                    brand="Apple",
                    color="Space Gray",
                    distinctive_features="Small Antigravity stickers near trackpad",
                    additional_info="High priority academic work inside.",
                    location="Central Library - 2nd Floor Study Desk 14",
                    incident_date="2026-08-28",
                    incident_time="14:30",
                    image_url=None,
                    status="ACTIVE"
                ),
                Report(
                    user_id=admin.id,
                    report_type="FOUND",
                    item_name="Found Space Gray Laptop",
                    category="Electronics & Gadgets",
                    description="Found a 14-inch gray laptop inside a dark sleeve on a library desk.",
                    brand="Apple",
                    color="Space Gray",
                    distinctive_features="Contains tech stickers near trackpad",
                    additional_info="Handed over to Security Desk.",
                    location="Central Library 2nd Floor",
                    incident_date="2026-08-28",
                    incident_time="15:10",
                    image_url=None,
                    status="ACTIVE"
                ),
                Report(
                    user_id=user.id,
                    report_type="LOST",
                    item_name="Black Nike Utility Backpack",
                    category="Bags & Backpacks",
                    description="Black Nike backpack containing notebooks, calculator, and blue water bottle.",
                    brand="Nike",
                    color="Black",
                    distinctive_features="Silver keychain attached to front zip",
                    additional_info="Lost after sports practice.",
                    location="Campus Sports Complex / Gym Locker Area",
                    incident_date="2026-08-27",
                    incident_time="17:45",
                    image_url=None,
                    status="ACTIVE"
                ),
                Report(
                    user_id=admin.id,
                    report_type="FOUND",
                    item_name="Found Sony WH-1000XM4 Headphones",
                    category="Electronics & Gadgets",
                    description="Black Sony noise-cancelling headphones left at table in cafeteria food court.",
                    brand="Sony",
                    color="Black",
                    distinctive_features="Custom ear cushion covers",
                    additional_info="Found near juice bar.",
                    location="Main Cafeteria Food Plaza Table 8",
                    incident_date="2026-08-29",
                    incident_time="12:30",
                    image_url=None,
                    status="ACTIVE"
                ),
                Report(
                    user_id=user.id,
                    report_type="LOST",
                    item_name="Titan Brown Leather Wallet",
                    category="Wallets & Purses",
                    description="Brown leather wallet containing student ID card and bus pass.",
                    brand="Titan",
                    color="Brown",
                    distinctive_features="Slight wear on edges with initials AS",
                    additional_info="Lost during lab practical session.",
                    location="Engineering Complex Lab 102",
                    incident_date="2026-08-29",
                    incident_time="11:15",
                    image_url=None,
                    status="ACTIVE"
                ),
                Report(
                    user_id=admin.id,
                    report_type="FOUND",
                    item_name="Found Scientific Calculator Casio fx-991EX",
                    category="Stationery & Books",
                    description="Black Casio scientific calculator with name label on back cover.",
                    brand="Casio",
                    color="Black",
                    distinctive_features="Name sticker slightly faded",
                    additional_info="Found on first row desk.",
                    location="Science Block Auditorium 1",
                    incident_date="2026-08-26",
                    incident_time="16:00",
                    image_url=None,
                    status="RESOLVED"
                )
            ]
            db.add_all(sample_reports)
            db.commit()
            print("[INFO] Seeded sample Lost & Found reports.")

            # Trigger initial AI matching for seeded reports
            from app.routers.matches import run_ai_matching_for_report
            for r in sample_reports:
                run_ai_matching_for_report(db, r)
            print("[INFO] Initial AI Matching Engine executed for seeded reports.")

    except Exception as e:
        print(f"[ERROR] Error seeding initial data: {e}")
        db.rollback()
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    seed_initial_data()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "phase": "Phase 7 - Production AI Multimodal Lost & Found System Finalized"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
