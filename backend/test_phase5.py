import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User, AuditLog
from app.models.report import Report, Claim
from app.models.match import AIMatch
from app.security import get_password_hash, create_access_token

# Test Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_phase5.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestPhase5AdminDashboard(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

        db = TestingSessionLocal()
        
        # Create Admin & Regular Users
        admin_user = User(
            email="admin5@test.com",
            full_name="Admin Director",
            hashed_password=get_password_hash("AdminPass@123"),
            role="ADMIN",
            reputation_score=500
        )
        regular_user = User(
            email="user5@test.com",
            full_name="Regular Student",
            hashed_password=get_password_hash("UserPass@123"),
            role="USER",
            reputation_score=100
        )
        non_admin_user = User(
            email="nonadmin5@test.com",
            full_name="Non Admin Student",
            hashed_password=get_password_hash("UserPass@123"),
            role="USER",
            reputation_score=100
        )
        db.add_all([admin_user, regular_user, non_admin_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(regular_user)
        db.refresh(non_admin_user)

        cls.admin_id = admin_user.id
        cls.regular_id = regular_user.id
        cls.non_admin_token = create_access_token(data={"sub": non_admin_user.email, "role": non_admin_user.role})
        cls.admin_token = create_access_token(data={"sub": admin_user.email, "role": admin_user.role})
        cls.regular_token = create_access_token(data={"sub": regular_user.email, "role": regular_user.role})

        # Create Sample Reports
        report_lost = Report(
            user_id=regular_user.id,
            report_type="LOST",
            item_name="Lost Wireless Mouse",
            category="Electronics & Gadgets",
            description="Logitech MX Master 3S wireless mouse.",
            location="Lab 102",
            incident_date="2026-08-28",
            status="ACTIVE"
        )
        report_found = Report(
            user_id=admin_user.id,
            report_type="FOUND",
            item_name="Found Black Backpack",
            category="Bags & Backpacks",
            description="North Face black backpack with water bottle.",
            location="Cafeteria",
            incident_date="2026-08-28",
            status="RESOLVED"
        )
        db.add_all([report_lost, report_found])
        db.commit()
        db.refresh(report_lost)
        cls.report_to_delete_id = report_lost.id

        db.close()

    def test_01_admin_analytics_overview(self):
        """Test GET /api/admin/analytics returning system metrics."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/admin/analytics", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total_users"], 2)
        self.assertEqual(data["total_reports"], 2)
        self.assertGreaterEqual(data["resolution_rate_percent"], 50.0)
        self.assertIsInstance(data["category_distribution"], list)

    def test_02_system_health(self):
        """Test GET /api/admin/health returning health check."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/admin/health", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertTrue(data["database_connected"])

    def test_03_list_all_users(self):
        """Test GET /api/admin/users fetching registered users."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/admin/users?search=Regular", headers=headers)
        self.assertEqual(res.status_code, 200)
        users = res.json()
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0]["full_name"], "Regular Student")

    def test_04_toggle_user_role(self):
        """Test PUT /api/admin/users/{user_id}/role granting admin role."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.put(f"/api/admin/users/{self.regular_id}/role?new_role=ADMIN", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["role"], "ADMIN")

    def test_05_toggle_user_status(self):
        """Test PUT /api/admin/users/{user_id}/toggle-status disabling and enabling user."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.put(f"/api/admin/users/{self.regular_id}/toggle-status", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["is_active"])

        # Enable back
        res2 = self.client.put(f"/api/admin/users/{self.regular_id}/toggle-status", headers=headers)
        self.assertTrue(res2.json()["is_active"])

    def test_06_admin_delete_report(self):
        """Test DELETE /api/admin/reports/{report_id} force deleting item report."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.delete(f"/api/admin/reports/{self.report_to_delete_id}", headers=headers)
        self.assertEqual(res.status_code, 204)

    def test_07_audit_logs(self):
        """Test GET /api/admin/audit-logs returning recorded audit entries."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/admin/audit-logs", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total"], 2)

    def test_08_forbidden_for_regular_users(self):
        """Ensure non-admin users get 403 Forbidden on admin endpoints."""
        headers = {"Authorization": f"Bearer {self.non_admin_token}"}
        res = self.client.get("/api/admin/analytics", headers=headers)
        self.assertEqual(res.status_code, 403)

if __name__ == "__main__":
    unittest.main()
