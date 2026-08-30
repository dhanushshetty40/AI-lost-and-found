import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.report import Report
from app.models.match import AIMatch
from app.security import get_password_hash, create_access_token
from app.services.campus_spatial import resolve_campus_location, CAMPUS_LOCATIONS

# Test Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_phase6.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


class TestPhase6CampusIntelligence(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

        db = TestingSessionLocal()

        # Create Test Users
        admin_user = User(
            email="admin6@test.com",
            full_name="Campus Intelligence Officer",
            hashed_password=get_password_hash("AdminPass@123"),
            role="ADMIN",
            reputation_score=200
        )
        student_user = User(
            email="student6@test.com",
            full_name="Campus Explorer",
            hashed_password=get_password_hash("StudentPass@123"),
            role="USER",
            reputation_score=100
        )
        db.add_all([admin_user, student_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(student_user)

        cls.admin_token = create_access_token(data={"sub": admin_user.email, "role": admin_user.role})
        cls.student_token = create_access_token(data={"sub": student_user.email, "role": student_user.role})

        # Create Sample Reports across different campus landmarks
        reports = [
            Report(
                user_id=student_user.id,
                report_type="LOST",
                item_name="AirPods Pro 2nd Gen",
                category="Electronics & Gadgets",
                description="White AirPods Pro left on quiet reading desk.",
                location="Central Library 3rd Floor",
                incident_date="2026-08-28",
                incident_time="14:15",
                status="ACTIVE"
            ),
            Report(
                user_id=student_user.id,
                report_type="LOST",
                item_name="Leather Cardholder Wallet",
                category="Wallets & Purses",
                description="Brown leather cardholder lost near treadmill.",
                location="Sports Complex Gym Locker Room",
                incident_date="2026-08-29",
                incident_time="17:30",
                status="ACTIVE"
            ),
            Report(
                user_id=admin_user.id,
                report_type="FOUND",
                item_name="Found AirPods Pro Charging Case",
                category="Electronics & Gadgets",
                description="Found white case near library entrance.",
                location="Central Library 1st Floor Entrance",
                incident_date="2026-08-28",
                incident_time="15:00",
                status="ACTIVE"
            ),
            Report(
                user_id=admin_user.id,
                report_type="FOUND",
                item_name="Casio Scientific Calculator",
                category="Stationery & Books",
                description="Black Casio fx-991CW left after exam.",
                location="Science Block Auditorium 2",
                incident_date="2026-08-27",
                incident_time="11:45",
                status="RESOLVED"
            ),
            Report(
                user_id=student_user.id,
                report_type="LOST",
                item_name="Mechanical Keyboard Keychron K2",
                category="Electronics & Gadgets",
                description="RGB wireless keyboard left in coding lab.",
                location="Engineering Wing Lab 101",
                incident_date="2026-08-29",
                incident_time="16:20",
                status="ACTIVE"
            )
        ]
        db.add_all(reports)
        db.commit()

        # Seed sample match
        sample_match = AIMatch(
            lost_report_id=1,
            found_report_id=3,
            overall_score=88.5,
            confidence_level="HIGH",
            text_score=85.0,
            image_score=80.0,
            location_score=95.0,
            date_score=100.0,
            attribute_score=90.0,
            explanation="✓ High Spatial Proximity: Both items reported at Central Library.",
            status="CONFIRMED"
        )
        db.add(sample_match)
        db.commit()

        db.close()

    def test_01_campus_map_data_retrieval(self):
        """Test GET /api/analytics/campus-map returns map locations and report markers."""
        headers = {"Authorization": f"Bearer {self.student_token}"}
        res = self.client.get("/api/analytics/campus-map", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        self.assertGreaterEqual(len(data["locations"]), 5)
        self.assertGreaterEqual(data["total_markers"], 5)
        self.assertGreaterEqual(data["lost_markers_count"], 3)
        self.assertGreaterEqual(data["found_markers_count"], 2)
        self.assertGreaterEqual(data["resolved_markers_count"], 1)

        # Check marker properties
        first_rep = data["reports"][0]
        self.assertIn("x", first_rep)
        self.assertIn("y", first_rep)
        self.assertIn("campus_location_id", first_rep)
        self.assertGreater(first_rep["x"], 0)
        self.assertGreater(first_rep["y"], 0)

    def test_02_heatmap_data_computation(self):
        """Test GET /api/analytics/heatmap computing hotspot density."""
        headers = {"Authorization": f"Bearer {self.student_token}"}
        res = self.client.get("/api/analytics/heatmap", headers=headers)
        self.assertEqual(res.status_code, 200)
        points = res.json()
        
        self.assertGreaterEqual(len(points), len(CAMPUS_LOCATIONS))
        for pt in points:
            self.assertIn("intensity", pt)
            self.assertGreaterEqual(pt["intensity"], 0.0)
            self.assertLessEqual(pt["intensity"], 1.0)
            self.assertIn("risk_level", pt)

    def test_03_analytics_overview_kpis(self):
        """Test GET /api/analytics/overview returning KPIs, temporal distribution, and category insights."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/analytics/overview", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertGreaterEqual(data["total_lost"], 3)
        self.assertGreaterEqual(data["total_found"], 2)
        self.assertGreater(data["overall_recovery_rate"], 0.0)
        self.assertGreater(data["ai_match_success_rate"], 0.0)
        
        # Category comparison
        self.assertIsInstance(data["category_comparison"], list)
        self.assertGreater(len(data["category_comparison"]), 0)
        
        # Temporal analysis
        self.assertIsInstance(data["hourly_distribution"], list)
        self.assertIn("peak_loss_time_window", data)
        self.assertIsInstance(data["weekday_distribution"], list)
        self.assertIn("busiest_day", data)
        
        # Location risk index
        self.assertIsInstance(data["location_risk_table"], list)
        self.assertIn("highest_loss_location", data)

    def test_04_analytics_filtering_by_category_and_date(self):
        """Test GET /api/analytics/overview with query parameters."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/analytics/overview?date_range=7d&category=Electronics%20%26%20Gadgets", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["filters_applied"]["category"], "Electronics & Gadgets")
        self.assertEqual(data["filters_applied"]["date_range"], "7d")

    def test_05_location_spatial_fuzzy_resolver(self):
        """Test fuzzy location spatial resolver algorithm."""
        # Test Library mapping
        loc_lib, x_lib, y_lib = resolve_campus_location("Central Library 3rd Floor reading study desk")
        self.assertEqual(loc_lib["id"], "central_library")
        self.assertAlmostEqual(x_lib, 28.0, delta=5.0)

        # Test Gym mapping
        loc_gym, x_gym, y_gym = resolve_campus_location("Sports complex fitness gym locker")
        self.assertEqual(loc_gym["id"], "sports_complex")
        self.assertAlmostEqual(x_gym, 80.0, delta=5.0)

        # Test Cafeteria mapping
        loc_caf, x_caf, y_caf = resolve_campus_location("Canteen food court table 12")
        self.assertEqual(loc_caf["id"], "main_cafeteria")

    def test_06_campus_locations_catalog(self):
        """Test GET /api/analytics/locations fetching landmarks."""
        headers = {"Authorization": f"Bearer {self.student_token}"}
        res = self.client.get("/api/analytics/locations", headers=headers)
        self.assertEqual(res.status_code, 200)
        locations = res.json()
        self.assertGreaterEqual(len(locations), 8)
        self.assertTrue(any(l["name"].startswith("Central Library") for l in locations))

    def test_07_unauthenticated_access_denied(self):
        """Ensure unauthenticated access receives 401."""
        res = self.client.get("/api/analytics/campus-map")
        self.assertEqual(res.status_code, 401)


if __name__ == "__main__":
    unittest.main()
