import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Award, Phone, Mail, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import claimService from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';

export const ClaimsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('filed'); // 'filed' or 'received'
  const [claimsData, setClaimsData] = useState({ total: 0, pending_count: 0, approved_count: 0, rejected_count: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [ownerNotes, setOwnerNotes] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const data = await claimService.getClaims(activeTab);
      setClaimsData(data);
    } catch (err) {
      console.error("Failed to load claims:", err);
      addToast("Failed to fetch claims list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [activeTab]);

  const handleVerifyDecision = async (claimId, action) => {
    setSubmittingId(claimId);
    try {
      const notes = ownerNotes[claimId] || '';
      await claimService.verifyClaim(claimId, action, notes);
      addToast(`Claim decision set to ${action.toUpperCase()} successfully!`, "success");
      fetchClaims();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to process claim decision", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCompleteExchange = async (claimId) => {
    setSubmittingId(claimId);
    try {
      await claimService.completeClaimExchange(claimId);
      addToast("Item handover completed! +10 Reputation score awarded to finder! 🌟", "success");
      fetchClaims();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to complete exchange", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <ShieldCheck size={28} color="var(--accent-emerald)" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Ownership Claims & Verification</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage ownership verification questions, proof documents, contact releases, and item handover confirmations.
          </p>
        </div>

        <button onClick={fetchClaims} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={16} /> Refresh Claims
        </button>
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>TOTAL CLAIMS ({activeTab.toUpperCase()})</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{claimsData.total}</span>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>PENDING REVIEW</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{claimsData.pending_count}</span>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>APPROVED</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{claimsData.approved_count}</span>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>REJECTED</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{claimsData.rejected_count}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('filed')}
          className={`btn ${activeTab === 'filed' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem' }}
        >
          Claims I've Filed ({activeTab === 'filed' ? claimsData.total : ''})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`btn ${activeTab === 'received' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem' }}
        >
          Claims Received on My Found Items ({activeTab === 'received' ? claimsData.total : ''})
        </button>
      </div>

      {/* Claims List */}
      {loading ? (
        <LoadingSpinner label="Loading Claims Verification Registry..." />
      ) : claimsData.items.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {claimsData.items.map((c) => {
            const report = c.report;
            const claimant = c.claimant;
            const proofUrl = c.proof_image_url ? (c.proof_image_url.startsWith('http') ? c.proof_image_url : `${API_BASE}${c.proof_image_url}`) : null;

            return (
              <div key={c.id} className="card" style={{
                borderLeft: c.status === 'APPROVED' || c.status === 'COMPLETED' ? '5px solid var(--accent-emerald)' : c.status === 'REJECTED' ? '5px solid var(--accent-rose)' : '5px solid var(--accent-amber)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge ${c.status === 'APPROVED' || c.status === 'COMPLETED' ? 'badge-success' : c.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                      STATUS: {c.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Claim ID #{c.id}</span>
                  </div>

                  {/* Verification Score Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--primary)' }}>
                    <ShieldCheck size={14} color="var(--primary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                      Verification Score: {c.verification_score}%
                    </span>
                  </div>
                </div>

                {/* Report Info */}
                {report && (
                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                      CLAIMED ITEM
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '2px 0 4px' }}>
                      {report.item_name}
                    </h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Category: {report.category} | Location: {report.location} | Date: {report.incident_date}
                    </div>
                  </div>
                )}

                {/* Claimant Details (if mode === 'received') */}
                {activeTab === 'received' && claimant && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                    <strong>Claimant:</strong> {claimant.full_name} ({claimant.email}) — <span style={{ color: 'var(--accent-amber)' }}>Reputation: {claimant.reputation_score} pts</span>
                  </div>
                )}

                {/* Verification Answer */}
                <div style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>
                  <strong style={{ color: '#fff' }}>Claimant's Verification Answer:</strong>
                  <div style={{ marginTop: 4, padding: '0.75rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 8, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    "{c.verification_answer}"
                  </div>
                </div>

                {/* Proof Document Thumbnail */}
                {proofUrl && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginBottom: 6 }}>
                      Uploaded Proof of Ownership:
                    </strong>
                    <a href={proofUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                      <FileText size={16} /> View Proof Document / Receipt <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {/* Owner Notes */}
                {c.owner_notes && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                    <strong>Finder Notes:</strong> "{c.owner_notes}"
                  </div>
                )}

                {/* RELEASED CONTACT INFORMATION (If Contact Released is True) */}
                {c.contact_released && (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '0.95rem', marginBottom: 6 }}>
                      <CheckCircle2 size={18} /> Contact Information Released
                    </div>
                    <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.88rem', color: '#fff' }}>
                      <div><Mail size={14} style={{ display: 'inline', marginRight: 6 }} /> <strong>Email:</strong> {activeTab === 'filed' ? (report?.user?.email || 'finder@smartfind.com') : claimant?.email}</div>
                      <div><Phone size={14} style={{ display: 'inline', marginRight: 6 }} /> <strong>Phone:</strong> {activeTab === 'filed' ? (report?.user?.phone || '+1 (555) 019-2831') : (claimant?.phone || '+1 (555) 018-4920')}</div>
                    </div>
                  </div>
                )}

                {/* Actions Bar for Claims Received */}
                {activeTab === 'received' && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    {c.status === 'PENDING' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input
                          type="text"
                          placeholder="Optional notes to claimant (e.g. meet at security desk)..."
                          value={ownerNotes[c.id] || ''}
                          onChange={(e) => setOwnerNotes({ ...ownerNotes, [c.id]: e.target.value })}
                          className="input-field"
                          style={{ fontSize: '0.85rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleVerifyDecision(c.id, 'reject')}
                            className="btn btn-danger btn-sm"
                            disabled={submittingId === c.id}
                          >
                            <XCircle size={16} /> Reject Claim
                          </button>
                          <button
                            onClick={() => handleVerifyDecision(c.id, 'approve')}
                            className="btn btn-primary btn-sm"
                            disabled={submittingId === c.id}
                            style={{ backgroundColor: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                          >
                            <CheckCircle2 size={16} /> Approve Claim & Release Contact
                          </button>
                        </div>
                      </div>
                    )}

                    {c.status === 'APPROVED' && (
                      <button
                        onClick={() => handleCompleteExchange(c.id)}
                        className="btn btn-primary btn-sm"
                        disabled={submittingId === c.id}
                        style={{ backgroundColor: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' }}
                      >
                        <Award size={16} /> Confirm Handover Completed (+10 Reputation)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <ShieldCheck size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>No Claims Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {activeTab === 'filed' ? "You haven't submitted any ownership claims on found items." : "No ownership claims have been submitted on your found items."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClaimsPage;
