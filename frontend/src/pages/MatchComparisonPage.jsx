import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, MapPin, Calendar, Tag, ShieldCheck, HelpCircle, User, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import matchService from '../services/matchService';
import ClaimModal from '../components/ClaimModal';
import LoadingSpinner from '../components/LoadingSpinner';

export const MatchComparisonPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const fetchMatchDetails = async () => {
    setLoading(true);
    try {
      const data = await matchService.getMatchById(matchId);
      setMatch(data);
    } catch (err) {
      console.error("Failed to load match detail:", err);
      addToast("Failed to load match comparison details", "error");
      navigate('/matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  const handleDecision = async (action) => {
    setSubmitting(true);
    try {
      await matchService.confirmMatchDecision(matchId, action);
      addToast(`Match recommendation successfully ${action === 'confirm' ? 'confirmed' : 'rejected'}!`, "success");
      fetchMatchDetails();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to update match decision", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading AI Match Comparison Matrix..." />;
  if (!match || !match.lost_report || !match.found_report) return null;

  const { lost_report, found_report, overall_score, confidence_level, breakdown, explanation, status, is_verified } = match;

  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

  const lostImg = lost_report.image_url ? (lost_report.image_url.startsWith('http') ? lost_report.image_url : `${API_BASE}${lost_report.image_url}`) : null;
  const foundImg = found_report.image_url ? (found_report.image_url.startsWith('http') ? found_report.image_url : `${API_BASE}${found_report.image_url}`) : null;

  const scoreColor = overall_score >= 75 ? '#10b981' : overall_score >= 45 ? '#3b82f6' : '#f59e0b';
  const isOwnerOfLost = user && user.id === lost_report.user_id;
  const isFoundReporter = user && user.id === found_report.user_id;
  const isAuthorized = is_verified || isFoundReporter || (user && user.role?.toUpperCase() === 'ADMIN');

  return (
    <div style={{ maxWidth: 1180, margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      {/* Back button */}
      <Link to="/matches" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Potential Matches
      </Link>

      {/* Top Banner with Overall AI Score Ring */}
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
        border: `1px solid ${scoreColor}`
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className={`badge ${overall_score >= 75 ? 'badge-success' : 'badge-primary'}`}>
              {confidence_level} CONFIDENCE MATCH
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Match ID #{match.id}</span>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            Multimodal Match Comparison
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Side-by-side inspection of Lost Item #{lost_report.id} vs Found Item #{found_report.id}
          </p>
        </div>

        {/* Circular Overall Score Display */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: `2px solid ${scoreColor}`,
          minWidth: 160
        }}>
          <Sparkles size={24} color={scoreColor} style={{ marginBottom: 4 }} />
          <span style={{ fontSize: '2.2rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
            {overall_score.toFixed(0)}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            Overall AI Score
          </span>
        </div>
      </div>

      {/* Side-by-Side Items Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* LEFT: Lost Item Card */}
        <div className="card" style={{ borderTop: '4px solid var(--accent-rose)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 6 }}>
            <span className="badge badge-danger">🔴 LOST ITEM</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Report #{lost_report.id}</span>
          </div>

          {/* Reporter line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--accent-rose)', fontWeight: 700, marginBottom: '0.75rem' }}>
            <User size={14} /> Reported by: {lost_report.user?.full_name || `User #${lost_report.user_id}`}
          </div>

          {lostImg ? (
            <div style={{ width: '100%', height: 200, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#0f172a' }}>
              <img src={lostImg} alt={lost_report.item_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ width: '100%', height: 120, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              No image uploaded
            </div>
          )}

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>{lost_report.item_name}</h3>

          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <div><strong>Category:</strong> {lost_report.category}</div>
            {lost_report.brand && <div><strong>Brand:</strong> {lost_report.brand}</div>}
            {lost_report.color && <div><strong>Color:</strong> {lost_report.color}</div>}
            <div><strong>Location:</strong> <span style={{ color: 'var(--primary)' }}>{lost_report.location}</span></div>
            <div><strong>Incident Date:</strong> {lost_report.incident_date}</div>
            <div style={{ marginTop: 8, padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, fontSize: '0.85rem' }}>
              <strong>Description:</strong><br />{lost_report.description}
            </div>
          </div>
        </div>

        {/* RIGHT: Found Item Card */}
        <div className="card" style={{ borderTop: '4px solid var(--accent-emerald)', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 6 }}>
            <span className="badge badge-success">🟢 FOUND ITEM</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Report #{found_report.id}</span>
          </div>

          {/* Reporter line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.75rem' }}>
            <User size={14} /> Reported by: {found_report.user?.full_name || `User #${found_report.user_id}`}
          </div>

          {!isAuthorized ? (
            /* LOCKED / ZERO-LEAK SHIELD STATE */
            <div style={{
              padding: '2.5rem 1.5rem',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed rgba(245, 158, 11, 0.4)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ padding: 14, borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                <Lock size={32} />
              </div>
              <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Details Protected by Finder
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 360, lineHeight: 1.5, margin: 0 }}>
                To prevent false claims, confidential photographs and distinctive markings are hidden until you answer the finder's security question.
              </p>
              <button
                onClick={() => setShowVerificationModal(true)}
                className="btn btn-primary"
                style={{ backgroundColor: '#f59e0b', color: '#000', borderColor: '#f59e0b', fontWeight: 800, marginTop: 8 }}
              >
                <ShieldCheck size={16} /> Answer Finder's Question & Unlock
              </button>
            </div>
          ) : (
            /* UNLOCKED DETAILS (Verified & Remembered) */
            <>
              {foundImg ? (
                <div style={{ width: '100%', height: 200, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#0f172a' }}>
                  <img src={foundImg} alt={found_report.item_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: 120, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                  No image uploaded
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  ✓ VERIFIED & UNLOCKED
                </span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>{found_report.item_name}</h3>

              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                <div><strong>Category:</strong> {found_report.category}</div>
                {found_report.brand && <div><strong>Brand:</strong> {found_report.brand}</div>}
                {found_report.color && <div><strong>Color:</strong> {found_report.color}</div>}
                <div><strong>Location:</strong> <span style={{ color: 'var(--accent-emerald)' }}>{found_report.location}</span></div>
                <div><strong>Incident Date:</strong> {found_report.incident_date}</div>
                <div style={{ marginTop: 8, padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, fontSize: '0.85rem' }}>
                  <strong>Description:</strong><br />{found_report.description}
                </div>
                {found_report.distinctive_features && (
                  <div style={{ marginTop: 4, padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--accent-emerald)' }}>Distinctive Markings:</strong><br />{found_report.distinctive_features}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Score Breakdown Progress Bars */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} color="var(--primary)" /> Multimodal Sub-Score Matrix
        </h3>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Text Score (30%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>Text & Keyword Similarity (30% weight)</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{breakdown.text_score}%</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${breakdown.text_score}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Image Feature Score (25%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>Visual Feature & Embedding Similarity (25% weight)</span>
              <span style={{ fontWeight: 700, color: '#ec4899' }}>{breakdown.image_score}%</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${breakdown.image_score}%`, height: '100%', backgroundColor: '#ec4899', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Attribute Score (20%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>Attribute Match (Category, Brand, Color) (20% weight)</span>
              <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{breakdown.attribute_score}%</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${breakdown.attribute_score}%`, height: '100%', backgroundColor: '#8b5cf6', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Spatial Location Score (15%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>Campus Spatial Location Proximity (15% weight)</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{breakdown.location_score}%</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${breakdown.location_score}%`, height: '100%', backgroundColor: 'var(--accent-emerald)', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Temporal Date Score (10%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>Temporal Proximity (Incident Date Decay) (10% weight)</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{breakdown.date_score}%</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${breakdown.date_score}%`, height: '100%', backgroundColor: 'var(--accent-amber)', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI (XAI) Rationale Box */}
      <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          💡 Explainable AI Match Reasoning
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {explanation?.map((item, idx) => (
            <div key={idx} style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
              lineHeight: 1.5
            }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Match Decision Action Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>CURRENT DECISION STATUS</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: status === 'CONFIRMED' ? 'var(--accent-emerald)' : status === 'REJECTED' ? '#f87171' : '#fff' }}>
            {status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleDecision('reject')}
            className="btn btn-danger"
            disabled={submitting || status === 'REJECTED'}
          >
            <XCircle size={18} /> Reject Match
          </button>

          <button
            onClick={() => handleDecision('confirm')}
            className="btn btn-primary"
            disabled={submitting || status === 'CONFIRMED'}
            style={{ backgroundColor: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
          >
            <CheckCircle2 size={18} /> Confirm Match
          </button>
        </div>
      </div>

      {/* Claim & Verification Modal (Zero-Leak) */}
      {showVerificationModal && found_report && (
        <ClaimModal
          report={found_report}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={() => {
            addToast("Ownership verified successfully! Found item details unlocked.", "success");
            setShowVerificationModal(false);
            fetchMatchDetails();
          }}
        />
      )}
    </div>
  );
};

export default MatchComparisonPage;
