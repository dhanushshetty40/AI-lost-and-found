import React, { useState } from 'react';
import { X, MapPin, Calendar, Tag, ShieldCheck, User, Sparkles, AlertCircle, QrCode, Clock, CheckCircle2, Award } from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import LifecycleTimeline from './LifecycleTimeline';
import HandoverConfirmModal from './HandoverConfirmModal';

export const ReportDetailModal = ({ report, onClose, onClaimItem, onRefresh }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);

  if (!report) return null;

  const isLost = report.report_type === 'LOST';
  const isResolved = report.status === 'RESOLVED' || report.status === 'CLAIMED' || report.status === 'CLOSED';
  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

  const imageUrl = report.image_url
    ? (report.image_url.startsWith('http') ? report.image_url : `${API_BASE}${report.image_url}`)
    : null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}>
        <div className="card" style={{
          maxWidth: 720,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid var(--border)'
        }}>
          {/* Header close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={18} />
          </button>

          {/* Modal Title Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: '1.25rem', paddingRight: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${isLost ? 'badge-danger' : 'badge-success'}`}>
                {report.report_type} REPORT
              </span>
              <span className="badge badge-primary">{report.status}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Report ID #{report.id}</span>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem' }}
            >
              <QrCode size={14} /> Item QR Tag
            </button>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            {report.item_name}
          </h2>

          {/* Image Preview */}
          {imageUrl && (
            <div style={{
              width: '100%',
              maxHeight: 280,
              backgroundColor: '#0f172a',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={imageUrl}
                alt={report.item_name}
                style={{ width: '100%', maxHeight: 280, objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-light)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', fontWeight: 600 }}>CATEGORY</span>
              <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{report.category}</span>
            </div>

            {report.brand && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', fontWeight: 600 }}>BRAND</span>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{report.brand}</span>
              </div>
            )}

            {report.color && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', fontWeight: 600 }}>COLOR</span>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{report.color}</span>
              </div>
            )}

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', fontWeight: 600 }}>LOCATION</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{report.location}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', fontWeight: 600 }}>INCIDENT DATE</span>
              <span style={{ fontSize: '0.9rem', color: '#fff' }}>{report.incident_date} {report.incident_time && `at ${report.incident_time}`}</span>
            </div>
          </div>

          {/* Detailed Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Item Description</h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {report.description}
            </p>
          </div>

          {/* Distinctive Features */}
          {report.distinctive_features && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>
                <Sparkles size={16} /> Distinctive Features
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {report.distinctive_features}
              </p>
            </div>
          )}

          {/* Verification Challenge Notice if present */}
          {report.verification_question && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: 4 }}>
                <ShieldCheck size={16} /> Ownership Verification Challenge
              </div>
              <p style={{ fontSize: '0.88rem', color: '#fff' }}>
                Finder requires claimants to answer: <em>"{report.verification_question}"</em>
              </p>
            </div>
          )}

          {/* Embedded Lifecycle Stepper Timeline */}
          <div style={{ marginBottom: '1.5rem' }}>
            <LifecycleTimeline reportId={report.id} />
          </div>

          {/* Modal Action Footer */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>

            {!isResolved && (
              <button
                onClick={() => setShowHandoverModal(true)}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}
              >
                <CheckCircle2 size={16} /> Handover & Resolve (+15 Pts)
              </button>
            )}

            {!isLost && onClaimItem && !isResolved && (
              <button
                onClick={() => {
                  onClose();
                  onClaimItem(report);
                }}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
              >
                <ShieldCheck size={16} /> File Ownership Claim
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        reportId={report.id}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      {/* Handover Confirmation Modal */}
      <HandoverConfirmModal
        report={report}
        isOpen={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
          onClose();
        }}
      />
    </>
  );
};

export default ReportDetailModal;
