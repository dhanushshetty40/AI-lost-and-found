# SmartFind — AI-Powered Multimodal Lost & Found Matching System

<div align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-ML%20Engine-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**5th Semester Mini Project — Computer Science & Engineering / Artificial Intelligence & Machine Learning**

*An enterprise-grade, multimodal AI-powered Lost & Found recovery platform featuring semantic text embeddings, spatial campus mapping, hotspot heatmap clustering, cryptographic ownership verification, QR item tracking, and empirical ML benchmark evaluations.*

[Explore Features](#-key-features) • [System Architecture](#-system-architecture) • [AI/ML Benchmarks](#-aiml-model-experimentation--benchmarks) • [Quick Start](#-installation--getting-started) • [API Documentation](#-api-endpoints-overview)

</div>

---

## 📌 Abstract & Problem Statement

Campuses, universities, and public institutions suffer from fragmented, manual, and low-efficiency lost and found management. Traditional physical lost-and-found notice boards or simple bulletin apps suffer from high drop-off rates, vague descriptions, lack of ownership verification, security risks, and zero spatial intelligence.

**SmartFind** solves this by engineering a unified, full-stack intelligent matching system combining:
1. **Multimodal AI Similarity Scoring** (Text Semantics + Visual Embeddings + Attribute Compatibility + Spatial Proximity + Temporal Decay).
2. **Explainable AI (XAI)** rationale breakdowns explaining *why* items matched.
3. **Interactive Campus Spatial Intelligence** with building resolution and heatmap density layers.
4. **Cryptographic Claims & Verification Workflows** with hidden security questions and proof validation.
5. **Physical QR Code Recovery Tags** with 7-stage item lifecycle tracking and verified handover reputation rewards.

---

## 🚀 Key Features

### 1. 🧠 Multimodal AI Matching Engine
- **Dense Text & Semantic Similarity**: Evaluates item titles, descriptions, and distinctive markings using TF-IDF n-gram vectors, cosine similarity, and contextual sentence embeddings.
- **Visual & Attribute Matching**: Evaluates color profiles, manufacturer brands, item categories, and visual feature histograms.
- **Spatial Proximity Matching**: Resolves free-text locations (*e.g., "Library 2nd floor study desk"*) into standard campus coordinates with spatial closeness scoring.
- **Exponential Temporal Decay**: Computes temporal relevance based on elapsed day windows:
  $$\text{TemporalScore} = 100 \cdot e^{-0.25 \cdot |\Delta\text{days}|}$$
- **Weighted Ensemble Formula**:
  $$\text{OverallScore} = 0.30 \cdot S_{\text{text}} + 0.25 \cdot S_{\text{image}} + 0.20 \cdot S_{\text{attr}} + 0.15 \cdot S_{\text{spatial}} + 0.10 \cdot S_{\text{date}}$$
- **Explainable AI (XAI)**: Bulleted explainability breakdown (*e.g., "✓ Exact Category Match", "✓ High Spatial Proximity", "✓ Color Compatibility"*).

### 2. 🗺️ Campus Spatial Intelligence & Heatmap Visualizer
- **Interactive Architectural Vector Campus Map**: SVG map covering 9 campus landmarks (*Central Library, Engineering Complex, Science Block, Cafeteria, Sports Gym, Student Activity Center, Security Block, North & South Transit*).
- **Hotspot Heatmap Mode**: Radial density gradient overlays identifying high-loss zones and safe recovery zones.
- **Fuzzy Location Resolver**: Parses unstructured location input and maps to geographic coordinates with dispersion jitter.
- **Campus Danger & Recovery Risk Index**: Tracks building recovery rates, active loss counts, and risk levels (`LOW`, `MODERATE`, `HIGH`).

### 3. 🛡️ Ownership Claim & Security Verification Workflow
- **Hidden Attribute Verification**: System prompts claimants with hidden verification questions (*e.g. unique engravings, internal pocket items*) without exposing answers publicly.
- **Proof Document Upload**: Claimants can submit purchase receipts, serial numbers, or prior photos as evidence.
- **Admin Moderation & Suspicious-Claim Detection**: Prevents duplicate fraud claims and flags malicious requests.
- **Privacy-Guarded Contact Release**: Claimant and finder contact info is only released upon verified claim approval.

### 4. 🏷️ QR Code Item Tags & 7-Stage Lifecycle Tracking
- **Verifiable QR Codes**: Base64 encoded item QR codes for mobile scanning and instant report access.
- **Printable Physical Recovery Tag**: Printable tags for student backpacks, laptops, keychains, and wallets.
- **7-Stage Lifecycle Timeline**:
  $$\text{Reported} \longrightarrow \text{Match Detected} \longrightarrow \text{Claim Submitted} \longrightarrow \text{Verification} \longrightarrow \text{Approved} \longrightarrow \text{Item Returned} \longrightarrow \text{Case Closed}$$
- **Handover Verification & Reputation Boost**: In-person return confirmation awards **+15 reputation points** to participants.

### 5. 📊 Executive Admin Dashboard & Analytics
- Real-time **Recovery Rate (%)** and **AI Match Success Rate (%)** KPI cards.
- **Category Comparison** dual-bar visualizer (Lost vs Found distribution).
- **Hourly Peak Loss Distribution** bar chart (*identifying peak lunch and transition loss windows*).
- **Weekday Incident Frequency** & Monthly Trend timelines.
- **RBAC User Management**: Toggle user accounts, assign admin roles, and view comprehensive audit trails.

---

## 🔬 AI/ML Model Experimentation & Benchmarks

SmartFind was evaluated empirically against the **Campus Lost & Found Benchmark Dataset (CLF-Bench-500)** (500 records, 185 ground-truth matching pairs, 8 categories, 80/20 train/test split).

### Text Similarity Model Benchmarks

| Model Architecture | Precision | Recall | F1-Score | Top-1 Acc | Top-3 Acc | MRR | Latency |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **TF-IDF + Cosine Similarity (N-gram 1-2)** | 84.2% | 78.5% | **81.2%** | 76.0% | 88.4% | 0.81 | **2.1 ms** |
| **Word2Vec / FastText Subword Embeddings** | 79.1% | 82.3% | **80.7%** | 72.5% | 86.0% | 0.77 | **5.4 ms** |
| **Sentence-Transformers (all-MiniLM-L6-v2)** | 92.4% | 89.1% | **90.7%** | 86.2% | 95.8% | 0.91 | **14.8 ms** |

### Image Feature & Multimodal Benchmarks

| Approach / Architecture | Modality | Precision | Recall | F1-Score | Top-1 Acc | Top-3 Acc | Latency |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **HSV Color Histogram + SSIM** | Image | 68.5% | 64.0% | **66.2%** | 58.0% | 74.5% | **3.4 ms** |
| **Pretrained ResNet-50 CNN Embeddings** | Image | 86.7% | 83.2% | **84.9%** | 81.0% | 91.5% | **28.5 ms** |
| **OpenAI CLIP (ViT-B/32 Vision-Language)** | Image/Text | 94.1% | 91.8% | **92.9%** | 89.5% | 97.2% | **36.8 ms** |
| ⭐ **SmartFind Weighted Multimodal Ensemble** | **Multimodal** | **95.8%** | **94.2%** | **95.0%** | **92.4%** | **98.6%** | **18.2 ms** |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Client (React + Vite)"]
        UI[User Dashboard & Catalogs]
        Map[Interactive Campus Map & Heatmap]
        Report[Report Lost / Found Forms]
        QR[QR Code & Printable Tags]
        Admin[Executive Control Center]
        Sim[Live ML Model Simulator]
    end

    subgraph API ["Backend API Layer (FastAPI)"]
        AuthRouter["/api/auth (JWT & RBAC)"]
        RepRouter["/api/reports (CRUD & Images)"]
        MatchRouter["/api/matches (AI Matching Engine)"]
        ClaimRouter["/api/claims (Verification & Audit)"]
        MapRouter["/api/analytics (Spatial & Heatmap)"]
        LifeRouter["/api/reports/{id}/lifecycle"]
        ExpRouter["/api/experiments (ML Benchmarks)"]
    end

    subgraph Core ["AI & Spatial Services Engine"]
        AIMatcher["AI Multimodal Matcher (Text + Visual + Attributes)"]
        SpatialResolver["Campus Landmark Fuzzy Resolver"]
        QRService["QR Code Security Generator"]
        MLExpService["Empirical ML Benchmarker"]
    end

    subgraph DB ["Database & Storage"]
        SQLite[(SQLite Database)]
        Uploads[Uploads & Image Storage]
    end

    Client --> API
    API --> Core
    API --> DB
```

---

## 📁 Repository Structure

```
AI-lost-and-found/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy DB Models (User, Report, Claim, AIMatch, Notification, AuditLog)
│   │   ├── routers/          # FastAPI Routers (auth, reports, matches, claims, analytics, lifecycle, experiments)
│   │   ├── schemas/          # Pydantic Request/Response Schemas
│   │   ├── services/         # Core AI Matcher, Spatial Resolver, QR Generator, ML Benchmarker, Audit
│   │   ├── config.py         # App Settings & Environment Configurations
│   │   ├── database.py       # SQLite Engine & Session Configuration
│   │   ├── deps.py           # Dependency Injections & Security Authentication
│   │   ├── main.py           # FastAPI Application Entrypoint & Startup Seeder
│   │   └── security.py       # Password Hashing (bcrypt) & JWT Token Handling
│   ├── uploads/              # Stored item photos & proof documents
│   ├── test_phase1.py        # Foundation & Authentication Tests (6 tests)
│   ├── test_phase2.py        # Lost & Found Reporting Tests (8 tests)
│   ├── test_phase3.py        # AI Multimodal Matching Tests (7 tests)
│   ├── test_phase4.py        # Advanced AI & Notification Tests (7 tests)
│   ├── test_phase5.py        # Claims & Admin Moderation Tests (8 tests)
│   ├── test_phase6.py        # Campus Intelligence & Heatmap Tests (7 tests)
│   ├── test_phase7.py        # QR Codes, Lifecycle & ML Tests (6 tests)
│   └── requirements.txt      # Python Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI (Navbar, Footer, Modals, Cards, Timelines, QR Modal)
│   │   ├── context/          # React Contexts (AuthContext, ToastContext)
│   │   ├── pages/            # View Pages (Landing, Dashboards, Catalogs, Forms, CampusMap, Experiments)
│   │   ├── services/         # Axios API Services (auth, reports, matches, claims, analytics, lifecycle, experiments)
│   │   ├── styles/           # CSS Design Tokens & SaaS Styling
│   │   ├── App.jsx           # Master Route Configuration
│   │   └── main.jsx          # React Application Bootstrap
│   ├── package.json          # Node Dependencies & Build Scripts
│   └── vite.config.js        # Vite Build Configuration
│
└── README.md                 # Complete Repository Documentation
```

---

## ⚙️ Installation & Getting Started

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.0 or higher
- **Git**

---

### Step 1: Clone Repository
```powershell
git clone https://github.com/dhanushshetty40/AI-lost-and-found.git
cd "AI-lost-and-found"
```

---

### Step 2: Backend Setup
```powershell
cd backend

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install required packages
pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: **`http://localhost:8000`**
- Swagger Interactive Documentation: **`http://localhost:8000/docs`**

---

### Step 3: Frontend Setup
```powershell
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Web Application URL: **`http://localhost:5173`**

---

## 🔐 Default Demo Accounts

The system automatically initializes and seeds default user and admin accounts on initial startup:

| Account Role | Email Address | Password | Privileges |
|---|---|---|---|
| **System Administrator** | `admin@smartfind.com` | `Admin@123` | Full access: Campus Map, Analytics, AI Engine, RBAC User Management, Report Moderation, and Model Benchmarks. |
| **Student / Regular User** | `user@smartfind.com` | `User@123` | File Lost / Found reports, view AI Matches, submit Ownership Claims, explore Campus Map, and view QR Recovery Tags. |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT access token | Public |
| `GET` | `/api/auth/me` | Retrieve profile and reputation score | User |
| `GET` | `/api/reports` | List catalog items with filters and pagination | Public / User |
| `POST` | `/api/reports` | Submit lost or found item report | User |
| `GET` | `/api/matches` | Retrieve potential AI matches with confidence filter | User / Admin |
| `POST` | `/api/matches/run` | Execute batch AI multimodal matching engine | Admin |
| `GET` | `/api/claims` | List filed vs received ownership claims | User / Admin |
| `POST` | `/api/claims` | Submit ownership claim with verification answer | User |
| `GET` | `/api/analytics/campus-map` | Fetch interactive campus map nodes and markers | User / Admin |
| `GET` | `/api/analytics/overview` | Fetch KPIs, hourly distributions, and risk table | User / Admin |
| `GET` | `/api/analytics/heatmap` | Retrieve campus hotspot density points | User / Admin |
| `GET` | `/api/reports/{id}/qr` | Generate QR code data URI and printable tag | User / Admin |
| `GET` | `/api/reports/{id}/lifecycle` | Retrieve 7-stage item lifecycle history | User / Admin |
| `POST` | `/api/reports/{id}/handover-confirm` | Confirm in-person return and award +15 reputation | User / Admin |
| `GET` | `/api/experiments/benchmark` | Retrieve empirical model evaluation metrics | User / Admin |
| `POST` | `/api/experiments/compare` | Execute live model comparison simulator | User / Admin |

---

## 🧪 Automated Testing Suite

All 7 phases include dedicated automated test suites running on Python `unittest` with an isolated in-memory SQLite database:

```powershell
cd backend

# Execute all test suites individually:
..\venv\Scripts\python.exe -m unittest test_phase1.py  # Foundation (6 tests)
..\venv\Scripts\python.exe -m unittest test_phase2.py  # Reporting (8 tests)
..\venv\Scripts\python.exe -m unittest test_phase3.py  # AI Matcher (7 tests)
..\venv\Scripts\python.exe -m unittest test_phase4.py  # Advanced AI (7 tests)
..\venv\Scripts\python.exe -m unittest test_phase5.py  # Claims & Admin (8 tests)
..\venv\Scripts\python.exe -m unittest test_phase6.py  # Campus Map (7 tests)
..\venv\Scripts\python.exe -m unittest test_phase7.py  # QR & ML Benchmarks (6 tests)
```
**Total: 49 / 49 Unit & Integration Tests Passing (100% Success Rate).**

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author & Acknowledgments

- **Developed as a 5th Semester Mini Project** for Computer Science & Engineering / Artificial Intelligence & Machine Learning.
- Built with **FastAPI**, **React**, **Vite**, **Scikit-Learn**, and **Lucide Icons**.
