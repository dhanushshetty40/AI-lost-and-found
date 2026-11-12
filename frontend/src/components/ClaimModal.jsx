import React, { useState } from 'react';
import { X, ShieldCheck, Upload, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import claimService from '../services/claimService';

export const ClaimModal = ({ report, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer || answer.trim().length < 5) {
      addToast("Please provide a detailed verification answer (at least 5 characters).", "error");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create claim
      const claim = await claimService.createClaim({
        report_id: report.id,
        verification_answer: answer.trim()
      });

      // 2. Upload proof if selected
      if (file) {
        await claimService.uploadClaimProof(claim.id, file);
      }

      addToast(`Ownership claim filed successfully! Verification score: ${claim.verification_score}%.`, "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to submit claim", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        maxWidth: 560,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid var(--border)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
          <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>File Ownership Claim</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Claiming Found Item #{report.id}: {report.item_name}</span>
          </div>
        </div>

        {/* Info Callout */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderLeft: '4px solid var(--primary)',
          padding: '0.85rem 1rem',
          borderRadius: 8,
          fontSize: '0.85rem',
          color: 'var(--text-main)',
          marginBottom: '1.25rem'
        }}>
          💡 To prevent fraudulent claims, describe specific unique markings, serial numbers, hidden contents, or wallpaper. The AI verification engine will score your answer. Contact information will be released upon approval.
        </div>

        {/* Claim Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="input-label" style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              Ownership Verification Question *
            </label>
            <div style={{ fontSize: '0.88rem', color: '#fff', marginBottom: 8, padding: '0.75rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8 }}>
              ❓ {report.verification_question && report.verification_question.trim() ? report.verification_question : `Please describe any distinctive markings, serial numbers, wallpapers, or proof of ownership for '${report.item_name}'.`}
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Type your answer to the question above..."
              required
            />
          </div>

          <div>
            <label className="input-label" style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              Proof of Ownership Document / Receipt (Optional)
            </label>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.01)'
            }}>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="claim-proof-input"
              />
              <label htmlFor="claim-proof-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Upload size={24} color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', color: file ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: file ? 700 : 400 }}>
                  {file ? `Selected: ${file.name}` : 'Click to upload receipt, purchase invoice, or serial photo'}
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 2, backgroundColor: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}>
              {submitting ? 'Verifying & Submitting...' : 'Submit Ownership Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
