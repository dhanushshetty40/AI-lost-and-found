import unittest
import os
import io
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.report import Report, Claim, Notification
from app.security import get_password_hash, create_access_token

# Test Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_phase4.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestPhase4ClaimVerificationWorkflow(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

        db = TestingSessionLocal()
        
        # Create Test Users (Claimant & Finder)
        claimant = User(
            email="claimant@test.com",
            full_name="Alice Claimant",
            hashed_password=get_password_hash("Password@123"),
            role="USER",
            phone="+1 (555) 018-4920",
            reputation_score=100
        )
        finder = User(
            email="finder@test.com",
            full_name="Bob Finder",
            hashed_password=get_password_hash("Password@123"),
            role="USER",
            phone="+1 (555) 019-3821",
            reputation_score=100
        )
        db.add_all([claimant, finder])
        db.commit()
        db.refresh(claimant)
        db.refresh(finder)

        cls.claimant_id = claimant.id
        cls.finder_id = finder.id
        cls.claimant_token = create_access_token(data={"sub": claimant.email, "role": claimant.role})
        cls.finder_token = create_access_token(data={"sub": finder.email, "role": finder.role})

        # Create Found Item Report by Finder
        found_report = Report(
            user_id=finder.id,
            report_type="FOUND",
            item_name="Found Silver Apple iPad Air",
            category="Electronics & Gadgets",
            description="Found a 10.9-inch silver iPad Air with a dark blue magnetic smart cover left on library 3rd floor desk.",
            brand="Apple",
            color="Silver",
            distinctive_features="Contains engraving on back: 'Alice's Study Pad'",
            location="Library 3rd Floor",
            incident_date="2026-08-28",
            status="ACTIVE"
        )
        db.add(found_report)
        db.commit()
        db.refresh(found_report)
        cls.found_report_id = found_report.id

        db.close()

    def test_01_create_claim_and_scoring(self):
        """Test POST /api/claims creating claim and calculating verification score."""
        headers = {"Authorization": f"Bearer {self.claimant_token}"}
        payload = {
            "report_id": self.found_report_id,
            "verification_answer": "It is my silver iPad Air 10.9 inch with blue magnetic smart cover. Back has custom engraving 'Alice's Study Pad'."
        }
        res = self.client.post("/api/claims", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["status"], "PENDING")
        self.assertFalse(data["contact_released"])
        self.assertGreaterEqual(data["verification_score"], 60.0)
        TestPhase4ClaimVerificationWorkflow.claim_id = data["id"]

    def test_02_notifications_generated(self):
        """Test GET /api/notifications for finder receiving claim alert."""
        headers = {"Authorization": f"Bearer {self.finder_token}"}
        res = self.client.get("/api/notifications", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["unread_count"], 0)
        self.assertIn("New Claim Filed", data["items"][0]["title"])

    def test_03_upload_claim_proof(self):
        """Test POST /api/claims/{id}/upload-proof uploading document receipt."""
        headers = {"Authorization": f"Bearer {self.claimant_token}"}
        file_content = b"Mock receipt image content"
        files = {"file": ("receipt.jpg", io.BytesIO(file_content), "image/jpeg")}
        
        res = self.client.post(f"/api/claims/{self.claim_id}/upload-proof", files=files, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("proof_image_url", data)

    def test_04_list_claims(self):
        """Test GET /api/claims listing filed vs received claims."""
        # Claimant checks filed claims
        headers_c = {"Authorization": f"Bearer {self.claimant_token}"}
        res_c = self.client.get("/api/claims?mode=filed", headers=headers_c)
        self.assertEqual(res_c.status_code, 200)
        self.assertEqual(res_c.json()["total"], 1)

        # Finder checks received claims
        headers_f = {"Authorization": f"Bearer {self.finder_token}"}
        res_f = self.client.get("/api/claims?mode=received", headers=headers_f)
        self.assertEqual(res_f.status_code, 200)
        self.assertEqual(res_f.json()["total"], 1)

    def test_05_verify_approve_claim(self):
        """Test POST /api/claims/{id}/verify approving claim and releasing contact info."""
        headers = {"Authorization": f"Bearer {self.finder_token}"}
        payload = {
            "action": "approve",
            "owner_notes": "Answers match engraving perfectly. Contact me at +1 (555) 019-3821 to collect."
        }
        res = self.client.post(f"/api/claims/{self.claim_id}/verify", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "APPROVED")
        self.assertTrue(data["contact_released"])

    def test_06_complete_claim_exchange_and_reputation(self):
        """Test POST /api/claims/{id}/complete confirming handover and boosting reputation score."""
        headers = {"Authorization": f"Bearer {self.finder_token}"}
        res = self.client.post(f"/api/claims/{self.claim_id}/complete", headers=headers)
        self.assertEqual(res.status_code, 200)
        
        # Check finder reputation score boosted (+10 pts)
        db = TestingSessionLocal()
        finder_db = db.query(User).filter(User.id == self.finder_id).first()
        self.assertEqual(finder_db.reputation_score, 110)
        db.close()

    def test_07_mark_notifications_read(self):
        """Test PUT /api/notifications/read-all marking all notifications read."""
        headers = {"Authorization": f"Bearer {self.claimant_token}"}
        res = self.client.put("/api/notifications/read-all", headers=headers)
        self.assertEqual(res.status_code, 200)
        
        list_res = self.client.get("/api/notifications", headers=headers)
        self.assertEqual(list_res.json()["unread_count"], 0)

if __name__ == "__main__":
    unittest.main()
