import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import matchService from '../services/matchService';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const PotentialMatchesPage = () => {
  const { addToast } = useToast();
  const [matchesData, setMatchesData] = useState({ total: 0, high_confidence_count: 0, medium_confidence_count: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [runningEngine, setRunningEngine] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'HIGH', 'MEDIUM'

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await matchService.getMatches({
        confidence_level: activeTab !== 'ALL' ? activeTab : undefined
      });
      setMatchesData(data);
    } catch (err) {
      console.error("Failed to load matches:", err);
      addToast("Failed to fetch potential AI matches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [activeTab]);

  const handleRunEngine = async () => {
    setRunningEngine(true);
    try {
      const res = await matchService.runMatchingEngine();
      addToast(`AI Match Engine complete! ${res.matches_generated} new matches identified.`, "success");
      fetchMatches();
    } catch (err) {
      addToast(err.response?.data?.detail || "Error triggering AI match engine", "error");
    } finally {
      setRunningEngine(false);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Sparkles size={28} color="var(--primary)" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>AI Potential Matches</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Multimodal AI analysis cross-referencing text similarity, visual features, campus location, date window, and item attributes.
          </p>
        </div>

        <button
          onClick={handleRunEngine}
          className="btn btn-primary"
          disabled={runningEngine}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCw size={18} className={runningEngine ? 'spin' : ''} />
          <span>{runningEngine ? 'Analyzing Features...' : 'Re-Run AI Match Engine'}</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}>
            <Layers size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL AI MATCHES</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{matchesData.total}</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>HIGH CONFIDENCE (&ge;75%)</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{matchesData.high_confidence_count}</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>MEDIUM CONFIDENCE (45-74%)</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{matchesData.medium_confidence_count}</span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.75rem'
      }}>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem' }}
        >
          All Matches
        </button>
        <button
          onClick={() => setActiveTab('HIGH')}
          className={`btn ${activeTab === 'HIGH' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', backgroundColor: activeTab === 'HIGH' ? 'var(--accent-emerald)' : undefined, borderColor: activeTab === 'HIGH' ? 'var(--accent-emerald)' : undefined }}
        >
          High Confidence
        </button>
        <button
          onClick={() => setActiveTab('MEDIUM')}
          className={`btn ${activeTab === 'MEDIUM' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', backgroundColor: activeTab === 'MEDIUM' ? 'var(--accent-amber)' : undefined, borderColor: activeTab === 'MEDIUM' ? 'var(--accent-amber)' : undefined }}
        >
          Medium Confidence
        </button>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <LoadingSpinner label="AI Multimodal Engine cross-referencing lost & found reports..." />
      ) : matchesData.items.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {matchesData.items.map((m) => (
            <MatchCard key={m.id} match={m} onConfirmDecision={fetchMatches} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Sparkles size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>No AI Matches Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: '1.5rem' }}>
            The AI engine hasn't detected matching items for your reports yet. Submit more reports or trigger a manual run.
          </p>
          <button onClick={handleRunEngine} className="btn btn-primary">
            <RefreshCw size={16} /> Run AI Match Engine Now
          </button>
        </div>
      )}
    </div>
  );
};

export default PotentialMatchesPage;
