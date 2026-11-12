import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, Calendar, CheckCircle2, AlertTriangle, XCircle, Trash2, User } from 'lucide-react';

export const MatchCard = ({ match, onConfirmDecision, onDeleteMatch }) => {
  const navigate = useNavigate();

  if (!match || !match.lost_report || !match.found_report) return null;

  const { lost_report, found_report, overall_score, confidence_level, status } = match;

  const isHigh = confidence_level === 'HIGH';
  const isMedium = confidence_level === 'MEDIUM';

  const badgeClass = isHigh ? 'badge-success' : isMedium ? 'badge-primary' : 'badge-warning';
  const scoreColor = isHigh ? '#10b981' : isMedium ? '#3b82f6' : '#f59e0b';

  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

  return (
    <div className="card" style={{
      border: isHigh ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
      boxShadow: isHigh ? '0 4px 20px rgba(16, 185, 129, 0.12)' : undefined,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative'
    }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${badgeClass}`} style={{ fontWeight: 700 }}>
            {confidence_level} CONFIDENCE
          </span>
          {status === 'CONFIRMED' && (
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={12} /> CONFIRMED
            </span>
          )}
          {status === 'REJECTED' && (
            <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <XCircle size={12} /> REJECTED
            </span>
          )}
        </div>

        {/* AI Score Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          padding: '4px 10px',
          borderRadius: 20,
          border: `1px solid ${scoreColor}`
        }}>
          <Sparkles size={14} color={scoreColor} />
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: scoreColor }}>
            {overall_score.toFixed(0)}% MATCH
          </span>
        </div>
      </div>

      {/* Side-by-Side Preview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '0.75rem',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: '0.85rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)'
      }}>
        {/* Lost Report Brief */}
        <div>
          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>
            🔴 LOST ITEM #{lost_report.id}
          </span>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '2px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lost_report.item_name}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            {lost_report.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            <MapPin size={12} /> {lost_report.location}
          </div>
        </div>

        {/* Connector Icon */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scoreColor
        }}>
          <ArrowRight size={16} />
        </div>

        {/* Found Report Brief */}
        <div>
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
            🟢 FOUND ITEM #{found_report.id}
          </span>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '2px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {found_report.item_name}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            {found_report.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            <MapPin size={12} /> {found_report.location}
          </div>
        </div>
      </div>

      {/* Explanation Teaser */}
      {match.explanation && match.explanation.length > 0 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '0.6rem 0.85rem', borderRadius: 8, borderLeft: `3px solid ${scoreColor}` }}>
          💡 {match.explanation[0]}
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
        <button
          onClick={() => navigate(`/matches/${match.id}`)}
          className="btn btn-primary"
          style={{ flex: 1, fontSize: '0.85rem' }}
        >
          Compare Details
        </button>

        {onDeleteMatch && (
          <button
            onClick={() => onDeleteMatch(match.id)}
            className="btn btn-sm"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0 0.75rem'
            }}
            title="Dismiss / Delete AI Match"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
