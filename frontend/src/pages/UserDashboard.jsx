import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Sparkles, AlertCircle, Award, FileText, CheckSquare, Clock, ArrowRight, Compass, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import authService from '../services/authService';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authService.getUserDashboardStats();
        setStats(data.stats);
      } catch (err) {
        console.error("Failed to load user dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading User Dashboard..." />;
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* User Hero Greeting Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              Welcome back, {user?.full_name}!
            </h1>
            <span className="badge badge-primary">{user?.role}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            SmartFind AI Intelligence Portal — Manage your lost & found reports, view campus hotspots, and review match candidates.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Award size={24} color="var(--primary)" />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>REPUTATION SCORE</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{user?.reputation_score || 100} pts</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <StatCard
          title="Lost Reports"
          value={stats?.lost_reports || 0}
          subtitle="Items reported by you"
          icon={FileText}
          color="var(--accent-rose)"
        />
        <StatCard
          title="Found Reports"
          value={stats?.found_reports || 0}
          subtitle="Items found & turned in"
          icon={Search}
          color="var(--accent-emerald)"
        />
        <StatCard
          title="Potential Matches"
          value={stats?.potential_matches || 0}
          subtitle="AI multimodally scored"
          icon={Sparkles}
          color="var(--primary)"
        />
        <StatCard
          title="Active Claims"
          value={stats?.active_claims || 0}
          subtitle="Ownership verifications"
          icon={CheckSquare}
          color="var(--accent-amber)"
        />
      </div>

      {/* Quick Action Cards Grid */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
        Quick Actions & Workflows
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {/* Report Lost Item */}
        <div className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)' }}>
                <PlusCircle size={22} />
              </div>
              <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Lost Item</span>
            </div>
            <h3 className="card-title">Report Lost Item</h3>
            <p className="card-subtitle">
              Submit a lost item report with image, category, brand, distinctive features, date, and spatial campus location.
            </p>
          </div>
          <Link to="/report-lost" className="btn btn-primary btn-full" style={{ marginTop: '1rem', textDecoration: 'none' }}>
            <span>File Lost Report</span> <ArrowRight size={15} />
          </Link>
        </div>

        {/* Report Found Item */}
        <div className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                <Search size={22} />
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Found Item</span>
            </div>
            <h3 className="card-title">Report Found Item</h3>
            <p className="card-subtitle">
              Log an item discovered on campus to allow AI engine to match with registered lost item reports.
            </p>
          </div>
          <Link to="/report-found" className="btn btn-secondary btn-full" style={{ marginTop: '1rem', textDecoration: 'none' }}>
            <span>File Found Report</span> <ArrowRight size={15} />
          </Link>
        </div>

        {/* AI Matches */}
        <div className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}>
                <Sparkles size={22} />
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Multimodal AI</span>
            </div>
            <h3 className="card-title">AI Matching Engine</h3>
            <p className="card-subtitle">
              Review multimodal AI match confidence scores, text/image embeddings, and explainable match breakdown.
            </p>
          </div>
          <Link to="/matches" className="btn btn-outline btn-full" style={{ marginTop: '1rem', textDecoration: 'none' }}>
            <span>Review AI Matches</span> <ArrowRight size={15} />
          </Link>
        </div>

        {/* Campus Map & Intelligence */}
        <div className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Compass size={22} />
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem', background: '#4F46E5' }}>Phase 6 Active</span>
            </div>
            <h3 className="card-title">Interactive Campus Map</h3>
            <p className="card-subtitle">
              Explore live geospatial incident pins, building recovery zones, and campus loss heatmap density layers.
            </p>
          </div>
          <Link to="/campus-map" className="btn btn-outline btn-full" style={{ marginTop: '1rem', borderColor: '#6366f1', color: '#818cf8', textDecoration: 'none' }}>
            <span>Explore Campus Map</span> <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Phase 6 Intelligence Active Banner */}
      <div style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Compass size={18} color="#818cf8" />
          <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Phase 6 Campus Intelligence & Analytics Active</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Spatial mapping, fuzzy building resolution, campus hotspot density clustering, and multi-dimensional analytics are live and synchronized with the AI matching engine.
        </p>
      </div>
    </div>
  );
};

export default UserDashboard;
