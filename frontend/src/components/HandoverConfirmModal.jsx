import React, { useState } from 'react';
import { CheckCircle2, Award, Shield, X, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import lifecycleService from '../services/lifecycleService';

export const HandoverConfirmModal = ({ report, isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [handoverOtp, setHandoverOtp] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await lifecycleService.confirmHandover(report.id, {
        handover_otp: handoverOtp,
        notes: notes
      });
      addToast(res.message || "Item handover verified! +15 reputation points awarded.", "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Handover error:", err);
      addToast(err.response?.data?.detail || "Failed to confirm handover", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        padding: '1.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        color: '#1E293B'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#D1FAE5', color: '#059669', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Award size={13} /> HANDOVER & RESOLUTION (+15 REPUTATION)
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Confirm Physical Item Handover
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Item Banner */}
        <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Item to be Returned</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>{report.item_name} (#{report.id})</div>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>📍 {report.location}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
              Handover Verification PIN / QR Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 982104"
              value={handoverOtp}
              onChange={(e) => setHandoverOtp(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
              Handover Notes / Verification Remarks
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Item safely verified and handed over at Central Library Security Desk."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ background: 'rgba(79, 70, 229, 0.06)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(79, 70, 229, 0.15)', fontSize: '0.8rem', color: '#4338CA' }}>
            ✓ Confirming will mark this item as <strong>RESOLVED</strong>, update campus recovery statistics, and grant you <strong>+15 reputation points</strong>.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1rem',
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              <CheckCircle2 size={16} /> {submitting ? 'Confirming Return...' : 'Confirm Handover & Resolve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HandoverConfirmModal;
