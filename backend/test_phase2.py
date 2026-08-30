import sys
import os
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app, seed_initial_data
from app.database import Base, engine
from app.models.user import User

class TestPhase2Reporting(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        if os.path.exists("smartfind.db"):
            try:
                os.remove("smartfind.db")
            except Exception:
                pass
                
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        seed_initial_data()
        cls.client = TestClient(app)

        # Login user
        user_res = cls.client.post("/api/auth/login", json={
            "email": "user@smartfind.com",
            "password": "User@123"
        }).json()
        cls.user_token = user_res["access_token"]
        cls.user_headers = {"Authorization": f"Bearer {cls.user_token}"}

        # Login admin
        admin_res = cls.client.post("/api/auth/login", json={
            "email": "admin@smartfind.com",
            "password": "Admin@123"
        }).json()
        cls.admin_token = admin_res["access_token"]
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}

    def test_01_categories_endpoint(self):
        res = self.client.get("/api/reports/categories")
        self.assertEqual(res.status_code, 200)
        categories = res.json()
        self.assertIn("Electronics & Gadgets", categories)
        self.assertIn("Bags & Backpacks", categories)

    def test_02_create_lost_report(self):
        payload = {
            "report_type": "LOST",
            "item_name": "Sony WH-1000XM5 Headphones",
            "category": "Electronics & Gadgets",
            "description": "Black noise canceling over-ear headphones in original silver zipper case.",
            "brand": "Sony",
            "color": "Black",
            "distinctive_features": "Small scratch near left hinge",
            "additional_info": "Left on table 4",
            "location": "Student Cafeteria",
            "incident_date": "2026-08-29",
            "incident_time": "11:30"
        }
        res = self.client.post("/api/reports", json=payload, headers=self.user_headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["item_name"], "Sony WH-1000XM5 Headphones")
        self.assertEqual(data["status"], "ACTIVE")
        self.assertEqual(data["report_type"], "LOST")
        self.__class__.created_report_id = data["id"]

    def test_03_create_found_report(self):
        payload = {
            "report_type": "FOUND",
            "item_name": "Silver Car Keys (Toyota)",
            "category": "Keys & Access Cards",
            "description": "Found Toyota remote key fob with blue leather tag.",
            "brand": "Toyota",
            "color": "Silver / Blue",
            "distinctive_features": "Tag says 'TRD'",
            "location": "Auditorium Main Hall",
            "incident_date": "2026-08-29",
            "incident_time": "09:15"
        }
        res = self.client.post("/api/reports", json=payload, headers=self.user_headers)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()["report_type"], "FOUND")

    def test_04_image_upload(self):
        file_content = b"fake-image-bytes-content-for-testing"
        files = {"file": ("test_photo.jpg", file_content, "image/jpeg")}
        res = self.client.post("/api/reports/upload-image", files=files, headers=self.user_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("image_url", data)
        self.assertTrue(data["image_url"].startswith("/uploads/"))

    def test_05_list_and_search_reports(self):
        # Search by query "MacBook"
        res_search = self.client.get("/api/reports?query=MacBook")
        self.assertEqual(res_search.status_code, 200)
        items = res_search.json()["items"]
        self.assertGreaterEqual(len(items), 1)
        self.assertIn("MacBook", items[0]["item_name"])

        # Filter by report_type "LOST"
        res_lost = self.client.get("/api/reports?report_type=LOST")
        self.assertEqual(res_lost.status_code, 200)
        for item in res_lost.json()["items"]:
            self.assertEqual(item["report_type"], "LOST")

        # Filter by category
        res_cat = self.client.get("/api/reports?category=Electronics%20%26%20Gadgets")
        self.assertEqual(res_cat.status_code, 200)
        self.assertGreaterEqual(len(res_cat.json()["items"]), 1)

    def test_06_my_reports_filter(self):
        res_my = self.client.get("/api/reports?my_reports=true", headers=self.user_headers)
        self.assertEqual(res_my.status_code, 200)
        items = res_my.json()["items"]
        self.assertGreaterEqual(len(items), 1)

    def test_07_edit_report(self):
        report_id = self.__class__.created_report_id
        edit_payload = {
            "item_name": "Updated Sony Headphones",
            "additional_info": "Reward offered!"
        }
        res = self.client.put(f"/api/reports/{report_id}", json=edit_payload, headers=self.user_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["item_name"], "Updated Sony Headphones")

    def test_08_delete_report(self):
        report_id = self.__class__.created_report_id
        res_del = self.client.delete(f"/api/reports/{report_id}", headers=self.user_headers)
        self.assertEqual(res_del.status_code, 200)

        # Verify deletion
        res_get = self.client.get(f"/api/reports/{report_id}")
        self.assertEqual(res_get.status_code, 404)

if __name__ == "__main__":
    unittest.main()
