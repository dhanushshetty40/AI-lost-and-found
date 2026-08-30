import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Shield, Layers, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import matchService from '../services/matchService';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const AdminAIMatchPage = () => {
  const { addToast } = useToast();
  const [matchesData, setMatchesData] = useState({ total: 0, high_confidence_count: 0, medium_confidence_count: 0, low_confidence_count: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [runningEngine, setRunningEngine] = useState(false);

  const fetchAdminMatches = async () => {
    setLoading(true);
    try {
      const data = await matchService.getMatches({ all_matches: true });
      setMatchesData(data);
    } catch (err) {
      console.error("Admin matches error:", err);
      addToast("Failed to fetch system-wide AI matches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminMatches();
  }, []);

  const handleRunBatchEngine = async () => {
    setRunningEngine(true);
    try {
      const res = await matchService.runMatchingEngine();
      addToast(`Batch AI run completed! Processed ${res.reports_processed} reports and generated ${res.matches_generated} potential matches.`, "success");
      fetchAdminMatches();
    } catch (err) {
      addToast(err.response?.data?.detail || "Batch execution error", "error");
    } finally {
      setRunningEngine(false);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Admin Header */}
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
            <Shield size={28} color="#c084fc" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Admin AI Engine Control Panel</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            System-wide multimodal AI feature matching, similarity metrics, and global batch execution controls.
          </p>
        </div>

        <button
          onClick={handleRunBatchEngine}
          className="btn btn-primary"
          disabled={runningEngine}
          style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
        >
          <RefreshCw size={18} className={runningEngine ? 'spin' : ''} />
          <span>{runningEngine ? 'Running System Batch...' : 'Trigger System-Wide AI Run'}</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>SYSTEM TOTAL MATCHES</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{matchesData.total}</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>HIGH CONFIDENCE (&ge;75%)</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{matchesData.high_confidence_count}</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>MEDIUM CONFIDENCE (45-74%)</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{matchesData.medium_confidence_count}</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>LOW CONFIDENCE (&lt;45%)</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{matchesData.low_confidence_count}</span>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <LoadingSpinner label="Fetching System-Wide AI Match Registry..." />
      ) : matchesData.items.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {matchesData.items.map((m) => (
            <MatchCard key={m.id} match={m} onConfirmDecision={fetchAdminMatches} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Sparkles size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>No Active System Matches</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: '1.5rem' }}>
            Click below to execute the AI matching engine across all active database reports.
          </p>
          <button onClick={handleRunBatchEngine} className="btn btn-primary">
            <RefreshCw size={16} /> Execute Global AI Matching Engine
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAIMatchPage;
