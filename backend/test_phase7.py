import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.report import Report, Claim
from app.models.match import AIMatch
from app.security import get_password_hash, create_access_token

# Test Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_phase7.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


class TestPhase7QRLifecycleAndExperiments(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

        db = TestingSessionLocal()

        # Create Test Users (Owner & Finder & Admin)
        admin_user = User(
            email="admin7@test.com",
            full_name="Dr. Director Admin",
            hashed_password=get_password_hash("AdminPass@123"),
            role="ADMIN",
            reputation_score=300
        )
        owner_user = User(
            email="owner7@test.com",
            full_name="Sarah Owner",
            hashed_password=get_password_hash("OwnerPass@123"),
            role="USER",
            reputation_score=100
        )
        finder_user = User(
            email="finder7@test.com",
            full_name="David Finder",
            hashed_password=get_password_hash("FinderPass@123"),
            role="USER",
            reputation_score=100
        )
        db.add_all([admin_user, owner_user, finder_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(owner_user)
        db.refresh(finder_user)

        cls.owner_id = owner_user.id
        cls.finder_id = finder_user.id
        cls.admin_token = create_access_token(data={"sub": admin_user.email, "role": admin_user.role})
        cls.owner_token = create_access_token(data={"sub": owner_user.email, "role": owner_user.role})
        cls.finder_token = create_access_token(data={"sub": finder_user.email, "role": finder_user.role})

        # Create Sample Reports
        lost_report = Report(
            user_id=owner_user.id,
            report_type="LOST",
            item_name="Sony WH-1000XM5 Headphones",
            category="Electronics & Gadgets",
            description="Silver Sony wireless noise-cancelling headphones left in study booth.",
            location="Central Library 2nd Floor",
            incident_date="2026-08-28",
            incident_time="14:00",
            status="ACTIVE"
        )
        found_report = Report(
            user_id=finder_user.id,
            report_type="FOUND",
            item_name="Found Silver Sony Headphones",
            category="Electronics & Gadgets",
            description="Found premium silver wireless headphones on study desk.",
            location="Central Library 2nd Floor",
            incident_date="2026-08-28",
            incident_time="15:00",
            status="ACTIVE"
        )
        db.add_all([lost_report, found_report])
        db.commit()
        db.refresh(lost_report)
        db.refresh(found_report)

        cls.lost_report_id = lost_report.id
        cls.found_report_id = found_report.id

        # Seed AI Match
        match_record = AIMatch(
            lost_report_id=lost_report.id,
            found_report_id=found_report.id,
            overall_score=92.5,
            confidence_level="HIGH",
            text_score=91.0,
            image_score=88.0,
            location_score=95.0,
            date_score=100.0,
            attribute_score=90.0,
            explanation="✓ High confidence match on Sony headphones in Central Library.",
            status="CONFIRMED"
        )
        db.add(match_record)

        # Seed Claim
        claim_record = Claim(
            claimant_id=owner_user.id,
            user_id=owner_user.id,
            report_id=found_report.id,
            verification_question="What unique serial number / marking was on the headset?",
            verification_answer="Serial ending in 9821 with custom silver case.",
            verification_score=85.0,
            status="APPROVED",
            contact_released=True
        )
        db.add(claim_record)
        db.commit()
        db.close()

    def test_01_qr_code_generation(self):
        """Test GET /api/reports/{id}/qr generating verifiable QR code and item tag."""
        headers = {"Authorization": f"Bearer {self.owner_token}"}
        res = self.client.get(f"/api/reports/{self.lost_report_id}/qr", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["report_id"], self.lost_report_id)
        self.assertTrue(data["qr_data_url"].startswith("data:image/"))
        self.assertTrue(data["item_tag_code"].startswith("SF-2026-L"))
        self.assertIn("verification_url", data)

    def test_02_item_lifecycle_tracking(self):
        """Test GET /api/reports/{id}/lifecycle returning complete 7-stage timeline."""
        headers = {"Authorization": f"Bearer {self.owner_token}"}
        res = self.client.get(f"/api/reports/{self.found_report_id}/lifecycle", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["report_id"], self.found_report_id)
        self.assertEqual(len(data["lifecycle_steps"]), 7)
        
        # Verify first step completed
        first_step = data["lifecycle_steps"][0]
        self.assertEqual(first_step["step_key"], "REPORTED")
        self.assertTrue(first_step["is_completed"])
        self.assertGreater(data["completion_percentage"], 0.0)

    def test_03_handover_confirmation_and_reputation_boost(self):
        """Test POST /api/reports/{id}/handover-confirm confirming return and boosting reputation."""
        headers = {"Authorization": f"Bearer {self.owner_token}"}
        payload = {
            "handover_otp": "982104",
            "notes": "Headphones returned in pristine condition."
        }
        res = self.client.post(f"/api/reports/{self.found_report_id}/handover-confirm", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "RESOLVED")
        self.assertEqual(data["reputation_points_awarded"], 15)

        # Check reputation score boosted in database
        db = TestingSessionLocal()
        owner_db = db.query(User).filter(User.id == self.owner_id).first()
        finder_db = db.query(User).filter(User.id == self.finder_id).first()
        self.assertEqual(owner_db.reputation_score, 115)
        self.assertEqual(finder_db.reputation_score, 115)
        db.close()

    def test_04_ai_ml_experiment_benchmarks(self):
        """Test GET /api/experiments/benchmark returning documented empirical metrics."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/experiments/benchmark", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("dataset_summary", data)
        self.assertEqual(data["dataset_summary"]["total_records"], 500)
        self.assertGreaterEqual(len(data["text_models"]), 3)
        self.assertGreaterEqual(len(data["image_models"]), 3)
        self.assertIn("multimodal_fusion", data)
        self.assertGreaterEqual(data["multimodal_fusion"]["f1_score"], 90.0)

    def test_05_live_model_comparison_simulation(self):
        """Test POST /api/experiments/compare running live similarity across models."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        payload = {
            "query_text": "Black Dell XPS 15 laptop with carbon fiber palmrest",
            "candidate_text": "Found dark 15-inch Dell laptop in computer science laboratory",
            "category": "Electronics & Gadgets"
        }
        res = self.client.post("/api/experiments/compare", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(len(data["results"]), 3)
        self.assertIn("best_matching_model", data)
        self.assertIn("explainable_breakdown", data)
        for r in data["results"]:
            self.assertIn("similarity_score", r)
            self.assertIn("latency_ms", r)
            self.assertIn("decision", r)

    def test_06_unauthenticated_security_check(self):
        """Ensure unauthenticated access to lifecycle and experiments is denied."""
        res = self.client.get(f"/api/reports/{self.lost_report_id}/qr")
        self.assertEqual(res.status_code, 401)
        res_exp = self.client.get("/api/experiments/benchmark")
        self.assertEqual(res_exp.status_code, 401)


if __name__ == "__main__":
    unittest.main()
