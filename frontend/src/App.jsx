import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Phase 2 Pages
import LostItemsPage from './pages/LostItemsPage';
import FoundItemsPage from './pages/FoundItemsPage';
import ReportLostPage from './pages/ReportLostPage';
import ReportFoundPage from './pages/ReportFoundPage';
import MyReportsPage from './pages/MyReportsPage';

// Phase 3 Pages
import PotentialMatchesPage from './pages/PotentialMatchesPage';
import MatchComparisonPage from './pages/MatchComparisonPage';
import AdminAIMatchPage from './pages/AdminAIMatchPage';

// Phase 4 Pages
import ClaimsPage from './pages/ClaimsPage';

// Phase 6 Pages
import CampusMapPage from './pages/CampusMapPage';

// Phase 7 Pages
import ModelExperimentPage from './pages/ModelExperimentPage';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Public / Authenticated Directory Catalogs */}
                <Route path="/reports/lost" element={<LostItemsPage />} />
                <Route path="/reports/found" element={<FoundItemsPage />} />

                {/* Protected User Reporting Routes */}
                <Route
                  path="/report-lost"
                  element={
                    <ProtectedRoute>
                      <ReportLostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-found"
                  element={
                    <ProtectedRoute>
                      <ReportFoundPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-reports"
                  element={
                    <ProtectedRoute>
                      <MyReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Phase 3 Protected AI Matching Routes */}
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <PotentialMatchesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches/:matchId"
                  element={
                    <ProtectedRoute>
                      <MatchComparisonPage />
                    </ProtectedRoute>
                  }
                />

                {/* Phase 4 Protected Claims & Verification Route */}
                <Route
                  path="/claims"
                  element={
                    <ProtectedRoute>
                      <ClaimsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Phase 6 Campus Spatial Intelligence & Map Route */}
                <Route
                  path="/campus-map"
                  element={
                    <ProtectedRoute>
                      <CampusMapPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected User Dashboard & Profile */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/ai-engine"
                  element={
                    <AdminRoute>
                      <AdminAIMatchPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/experiments"
                  element={
                    <ProtectedRoute>
                      <ModelExperimentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/experiments"
                  element={
                    <AdminRoute>
                      <ModelExperimentPage />
                    </AdminRoute>
                  }
                />

                {/* Fallback 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
