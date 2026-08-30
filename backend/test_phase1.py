import sys
import os
import unittest
from fastapi.testclient import TestClient

# Ensure app package can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app, seed_initial_data
from app.database import Base, engine, SessionLocal
from app.models.user import User

class TestPhase1Foundation(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Remove existing db if present for clean test state
        if os.path.exists("smartfind.db"):
            try:
                os.remove("smartfind.db")
            except Exception:
                pass
                
        # Recreate tables and seed initial users
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        seed_initial_data()
        cls.client = TestClient(app)

    def test_01_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("SmartFind", data["system"])

    def test_02_seeded_users(self):
        # Test seeded admin login
        admin_login = self.client.post("/api/auth/login", json={
            "email": "admin@smartfind.com",
            "password": "Admin@123"
        })
        self.assertEqual(admin_login.status_code, 200, msg=f"Admin login failed: {admin_login.text}")
        admin_data = admin_login.json()
        self.assertIn("access_token", admin_data)
        self.assertEqual(admin_data["user"]["role"], "ADMIN")

        # Test seeded user login
        user_login = self.client.post("/api/auth/login", json={
            "email": "user@smartfind.com",
            "password": "User@123"
        })
        self.assertEqual(user_login.status_code, 200, msg=f"User login failed: {user_login.text}")
        user_data = user_login.json()
        self.assertEqual(user_data["user"]["role"], "USER")

    def test_03_user_registration(self):
        # Register new user
        reg_response = self.client.post("/api/auth/register", json={
            "email": "testuser_phase1@smartfind.com",
            "full_name": "Phase 1 Tester",
            "password": "SecurePassword123!",
            "phone": "+1 555-999-8888",
            "role": "USER"
        })
        self.assertEqual(reg_response.status_code, 201)
        data = reg_response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], "testuser_phase1@smartfind.com")

        # Attempt duplicate registration
        dup_response = self.client.post("/api/auth/register", json={
            "email": "testuser_phase1@smartfind.com",
            "full_name": "Duplicate Tester",
            "password": "SecurePassword123!",
            "role": "USER"
        })
        self.assertEqual(dup_response.status_code, 400)
        self.assertIn("already exists", dup_response.json()["detail"])

    def test_04_invalid_login(self):
        response = self.client.post("/api/auth/login", json={
            "email": "admin@smartfind.com",
            "password": "WrongPassword!"
        })
        self.assertEqual(response.status_code, 401)

    def test_05_protected_route_authorization(self):
        # Login as user
        user_login = self.client.post("/api/auth/login", json={
            "email": "user@smartfind.com",
            "password": "User@123"
        }).json()
        user_token = user_login["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}

        # Login as admin
        admin_login = self.client.post("/api/auth/login", json={
            "email": "admin@smartfind.com",
            "password": "Admin@123"
        }).json()
        admin_token = admin_login["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # User profile access (valid for user token)
        res_me_user = self.client.get("/api/auth/me", headers=user_headers)
        self.assertEqual(res_me_user.status_code, 200)

        # Admin route access with ADMIN token -> 200 OK
        res_admin_ok = self.client.get("/api/admin/users", headers=admin_headers)
        self.assertEqual(res_admin_ok.status_code, 200)
        self.assertGreaterEqual(len(res_admin_ok.json()), 2)

        # Admin route access with USER token -> 403 Forbidden (RBAC Test!)
        res_admin_forbidden = self.client.get("/api/admin/users", headers=user_headers)
        self.assertEqual(res_admin_forbidden.status_code, 403)
        self.assertIn("restricted", res_admin_forbidden.json()["detail"].lower())

    def test_06_unauthenticated_access(self):
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, 401)

if __name__ == "__main__":
    unittest.main()
