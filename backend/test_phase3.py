import unittest
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.report import Report
from app.models.match import AIMatch
from app.security import get_password_hash, create_access_token
from app.services.ai_matcher import (
    calculate_text_similarity,
    calculate_attribute_similarity,
    calculate_location_similarity,
    calculate_date_similarity,
    compute_multimodal_match
)

# Test Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_phase3.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestPhase3AIMatchingEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

        db = TestingSessionLocal()
        
        # Create Test Users
        user = User(
            email="matchuser@test.com",
            full_name="Match Tester",
            hashed_password=get_password_hash("Password@123"),
            role="USER"
        )
        admin = User(
            email="adminuser@test.com",
            full_name="Admin Tester",
            hashed_password=get_password_hash("Admin@123"),
            role="ADMIN"
        )
        db.add_all([user, admin])
        db.commit()
        db.refresh(user)
        db.refresh(admin)

        cls.user_id = user.id
        cls.admin_id = admin.id
        cls.user_token = create_access_token(data={"sub": user.email, "role": user.role})
        cls.admin_token = create_access_token(data={"sub": admin.email, "role": admin.role})

        # Create High Matching Reports Pair
        lost_item_high = Report(
            user_id=user.id,
            report_type="LOST",
            item_name="Sony WH-1000XM4 Headphones",
            category="Electronics & Gadgets",
            description="Sony WH-1000XM4 noise canceling headphones black lost in main library desk 8",
            brand="Sony",
            color="Black",
            distinctive_features="Antigravity sticker on right ear cup",
            location="Main Library Desk 8",
            incident_date="2026-08-28",
            image_url="/uploads/sony_headphones.jpg",
            status="ACTIVE"
        )
        found_item_high = Report(
            user_id=admin.id,
            report_type="FOUND",
            item_name="Sony WH-1000XM4 Headphones",
            category="Electronics & Gadgets",
            description="Sony WH-1000XM4 noise canceling headphones black found on desk 8 in main library",
            brand="Sony",
            color="Black",
            distinctive_features="Antigravity sticker on right ear cup",
            location="Main Library Desk 8",
            incident_date="2026-08-28",
            image_url="/uploads/sony_headphones.jpg",
            status="ACTIVE"
        )

        # Create Low Matching Report
        found_item_low = Report(
            user_id=admin.id,
            report_type="FOUND",
            item_name="Red Umbrella",
            category="Others",
            description="Red folding umbrella found near sports complex",
            brand="Unknown",
            color="Red",
            location="Sports Complex",
            incident_date="2026-08-10",
            status="ACTIVE"
        )

        db.add_all([lost_item_high, found_item_high, found_item_low])
        db.commit()
        db.refresh(lost_item_high)
        db.refresh(found_item_high)
        db.refresh(found_item_low)

        cls.lost_high_id = lost_item_high.id
        cls.found_high_id = found_item_high.id
        cls.found_low_id = found_item_low.id

        db.close()

    def test_01_scoring_algorithms(self):
        """Test underlying text, attribute, spatial, and temporal mathematical score calculations."""
        # High text similarity
        text_sim = calculate_text_similarity(
            "Sony WH-1000XM4 noise canceling headphones",
            "Sony noise canceling headphones black"
        )
        self.assertGreater(text_sim, 50.0)

        # High location similarity
        loc_sim = calculate_location_similarity(
            "Main Library Study Hall Desk 8",
            "Main Library Desk 8"
        )
        self.assertGreater(loc_sim, 75.0)

        # Date proximity (same day = 100%)
        date_sim_same = calculate_date_similarity("2026-08-28", "2026-08-28")
        self.assertEqual(date_sim_same, 100.0)

        # Date proximity decay (10 days diff < 20%)
        date_sim_diff = calculate_date_similarity("2026-08-28", "2026-08-18")
        self.assertLess(date_sim_diff, 20.0)

    def test_02_multimodal_match_computation(self):
        """Test compute_multimodal_match returning overall score, breakdown, and XAI rationale."""
        db = TestingSessionLocal()
        lost = db.query(Report).filter(Report.id == self.lost_high_id).first()
        found_high = db.query(Report).filter(Report.id == self.found_high_id).first()
        found_low = db.query(Report).filter(Report.id == self.found_low_id).first()

        # High match comparison
        high_result = compute_multimodal_match(lost, found_high)
        self.assertGreaterEqual(high_result["overall_score"], 75.0)
        self.assertEqual(high_result["confidence_level"], "HIGH")
        self.assertGreater(len(high_result["explanation"]), 2)

        # Low match comparison
        low_result = compute_multimodal_match(lost, found_low)
        self.assertLess(low_result["overall_score"], 45.0)
        self.assertEqual(low_result["confidence_level"], "LOW")

        db.close()

    def test_03_manual_batch_match_trigger(self):
        """Test POST /api/matches/run triggering batch AI match engine."""
        headers = {"Authorization": f"Bearer {self.user_token}"}
        res = self.client.post("/api/matches/run", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("matches_generated", data)
        self.assertGreater(data["matches_generated"], 0)

    def test_04_list_matches_api(self):
        """Test GET /api/matches filtering by confidence level."""
        headers = {"Authorization": f"Bearer {self.user_token}"}
        res = self.client.get("/api/matches?confidence_level=HIGH", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total"], 0)
        self.assertEqual(data["items"][0]["confidence_level"], "HIGH")

    def test_05_get_match_detail_api(self):
        """Test GET /api/matches/{id} side-by-side comparison payload."""
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Get match id
        list_res = self.client.get("/api/matches", headers=headers)
        match_id = list_res.json()["items"][0]["id"]

        res = self.client.get(f"/api/matches/{match_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("breakdown", data)
        self.assertIn("explanation", data)
        self.assertIsNotNone(data["lost_report"])
        self.assertIsNotNone(data["found_report"])

    def test_06_confirm_match_decision(self):
        """Test POST /api/matches/{id}/confirm updating status to CONFIRMED."""
        headers = {"Authorization": f"Bearer {self.user_token}"}
        list_res = self.client.get("/api/matches", headers=headers)
        match_id = list_res.json()["items"][0]["id"]

        res = self.client.post(f"/api/matches/{match_id}/confirm?action=confirm", headers=headers)
        self.assertEqual(res.status_code, 200)
        
        # Verify status is CONFIRMED
        detail_res = self.client.get(f"/api/matches/{match_id}", headers=headers)
        self.assertEqual(detail_res.json()["status"], "CONFIRMED")

    def test_07_auto_match_on_report_submission(self):
        """Test automatic AI match trigger upon filing a new Lost report."""
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # File a new Lost report matching the red umbrella found item
        lost_payload = {
            "report_type": "LOST",
            "item_name": "Lost Red Folding Umbrella",
            "category": "Others",
            "description": "Red folding umbrella lost near campus sports complex entrance",
            "brand": "Unknown",
            "color": "Red",
            "location": "Sports Complex Entrance",
            "incident_date": "2026-08-10"
        }
        create_res = self.client.post("/api/reports", json=lost_payload, headers=headers)
        self.assertEqual(create_res.status_code, 201)
        new_report_id = create_res.json()["id"]

        # Check that a match was automatically created for new_report_id
        matches_res = self.client.get(f"/api/matches?report_id={new_report_id}", headers=headers)
        self.assertEqual(matches_res.status_code, 200)
        self.assertGreater(matches_res.json()["total"], 0)

if __name__ == "__main__":
    unittest.main()
