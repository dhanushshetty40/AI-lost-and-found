import React from 'react';
import { MapPin, Calendar, Tag, Info, Eye, Clock, ShieldCheck } from 'lucide-react';

export const ReportCard = ({ report, onViewDetails, onEdit, onDelete, isOwner, isAdmin }) => {
  const isLost = report.report_type === 'LOST';
  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

  const getImageUrl = () => {
    if (!report.image_url) return null;
    if (report.image_url.startsWith('http')) return report.image_url;
    return `${API_BASE}${report.image_url}`;
  };

  const imageUrl = getImageUrl();

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <span className="badge badge-primary">ACTIVE</span>;
      case 'MATCHED': return <span className="badge badge-warning">MATCHED</span>;
      case 'CLAIMED': return <span className="badge badge-success">CLAIMED</span>;
      case 'RESOLVED': return <span className="badge badge-success">RESOLVED</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Type Indicator Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: isLost ? 'var(--accent-rose)' : 'var(--accent-emerald)'
      }} />

      {/* Image Thumbnail Header */}
      <div style={{
        width: '100%',
        height: 160,
        backgroundColor: '#0f172a',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={report.item_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1rem' }}>
            <Tag size={32} style={{ opacity: 0.4, marginBottom: 4 }} />
            <div style={{ fontSize: '0.75rem' }}>No Photo Provided</div>
          </div>
        )}

        {/* Floating Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <span className={`badge ${isLost ? 'badge-danger' : 'badge-success'}`}>
            {report.report_type}
          </span>
        </div>

        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          {getStatusBadge(report.status)}
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          <Tag size={13} color="var(--primary)" />
          <span>{report.category}</span>
          {report.brand && <span style={{ marginLeft: 4 }}>• <strong>{report.brand}</strong></span>}
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {report.item_name}
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {report.description}
        </p>

        {/* Details Metadata */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-light)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {report.location}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <span>{report.incident_date} {report.incident_time && `at ${report.incident_time}`}</span>
          </div>
        </div>

        {/* Card Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button
            onClick={() => onViewDetails(report)}
            className="btn btn-outline btn-sm"
            style={{ flex: 1 }}
          >
            <Eye size={14} /> View Details
          </button>

          {(isOwner || isAdmin) && onEdit && (
            <button
              onClick={() => onEdit(report)}
              className="btn btn-secondary btn-sm"
              title="Edit Report"
            >
              Edit
            </button>
          )}

          {(isOwner || isAdmin) && onDelete && (
            <button
              onClick={() => onDelete(report.id)}
              className="btn btn-sm"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              title="Delete Report"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
