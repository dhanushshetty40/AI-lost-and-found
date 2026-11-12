import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, Search, Trash2, Edit, Eye, Filter, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import reportService from '../services/reportService';
import matchService from '../services/matchService';
import ReportCard from '../components/ReportCard';
import ReportDetailModal from '../components/ReportDetailModal';
import ReportEditModal from '../components/ReportEditModal';
import ClaimModal from '../components/ClaimModal';
import LoadingSpinner from '../components/LoadingSpinner';

export const MyReportsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('LOST'); // Default to LOST with paired matches

  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [claimingReport, setClaimingReport] = useState(null);

  const fetchMyReportsAndMatches = async () => {
    setLoading(true);
    try {
      const [reportsData, catsData, matchesData] = await Promise.all([
        reportService.getReports({ my_reports: true }),
        reportService.getCategories(),
        matchService.getMatches()
      ]);
      setReports(reportsData.items);
      setCategories(catsData);
      setMatches(matchesData.items || []);
    } catch (err) {
      console.error("Failed to load user reports:", err);
      addToast("Error fetching your reports and matches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReportsAndMatches();
  }, []);

  const handleDelete = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report? Any associated AI matches will also be cleared.")) return;
    try {
      await reportService.deleteReport(reportId);
      addToast("Report deleted successfully", "success");
      fetchMyReportsAndMatches();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to delete report", "error");
    }
  };

  const lostReports = reports.filter(r => r.report_type === 'LOST');
  const foundReports = reports.filter(r => r.report_type === 'FOUND');

  // Find best match for a specific lost report
  const getMatchesForLostReport = (lostReportId) => {
    return matches.filter(m => m.lost_report_id === lostReportId);
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>My Filed Reports & AI Matches</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
            Track your lost items with active AI match recommendations, or manage items you found on campus.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/report-lost" className="btn btn-primary">
            <PlusCircle size={16} /> Report Lost Item
          </Link>
          <Link to="/report-found" className="btn btn-secondary">
            <Search size={16} /> Report Found Item
          </Link>
        </div>
      </div>

      {/* Modern Two-Section Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.75rem'
      }}>
        <button
          onClick={() => setActiveTab('LOST')}
          className={`btn ${activeTab === 'LOST' ? 'btn-primary' : 'btn-outline'}`}
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            backgroundColor: activeTab === 'LOST' ? '#ef4444' : undefined,
            borderColor: activeTab === 'LOST' ? '#ef4444' : undefined
          }}
        >
          🔴 My Lost Items & AI Matches ({lostReports.length})
        </button>
        <button
          onClick={() => setActiveTab('FOUND')}
          className={`btn ${activeTab === 'FOUND' ? 'btn-primary' : 'btn-outline'}`}
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            backgroundColor: activeTab === 'FOUND' ? '#10b981' : undefined,
            borderColor: activeTab === 'FOUND' ? '#10b981' : undefined
          }}
        >
          🟢 Items I Found ({foundReports.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading your registered reports and active matches..." />
      ) : activeTab === 'LOST' ? (
        /* SECTION 1: MY LOST ITEMS WITH PAIRED MATCHES */
        <div>
          {lostReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {lostReports.map((lost) => {
                const lostMatches = getMatchesForLostReport(lost.id);
                return (
                  <div key={lost.id} className="card" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.35)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
                    {/* Header info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ backgroundColor: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: 6, fontWeight: 800, fontSize: '0.75rem' }}>
                          🔴 MY LOST REPORT #{lost.id}
                        </span>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                          {lost.item_name}
                        </h2>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setSelectedReport(lost)} className="btn btn-outline btn-sm">
                          <Eye size={14} /> Details
                        </button>
                        <button onClick={() => setEditingReport(lost)} className="btn btn-secondary btn-sm">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(lost.id)} className="btn btn-sm" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Matched Found Items Side-by-Side with Arrow */}
                    {lostMatches.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Sparkles size={16} /> AI Found {lostMatches.length} Matching Item(s) on Campus:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {lostMatches.map((m) => {
                            const found = m.found_report;
                            const isHigh = m.overall_score >= 75;
                            const scoreColor = isHigh ? '#10b981' : '#3b82f6';
                            return (
                              <div
                                key={m.id}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'minmax(200px, 1fr) auto minmax(240px, 1.2fr)',
                                  gap: '1.25rem',
                                  alignItems: 'center',
                                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                  padding: '1.25rem',
                                  borderRadius: 'var(--radius-md)',
                                  border: `1px solid ${scoreColor}`
                                }}
                              >
                                {/* Left: Your lost summary */}
                                <div>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>YOUR REPORT</span>
                                  <h4 style={{ color: '#fff', margin: '2px 0 4px', fontSize: '1rem' }}>{lost.item_name}</h4>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {lost.location}</span>
                                </div>

                                {/* Center: Arrow + Match Score */}
                                <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    border: `1px solid ${scoreColor}`,
                                    marginBottom: 6
                                  }}>
                                    <Sparkles size={14} color={scoreColor} />
                                    <span style={{ fontWeight: 800, color: scoreColor, fontSize: '0.88rem' }}>
                                      {m.overall_score.toFixed(0)}% MATCH
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: scoreColor }}>
                                    <ArrowRight size={24} />
                                  </div>
                                </div>

                                {/* Right: Matching Found Item & Claim Action */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>
                                        🟢 FOUND ITEM #{found.id}
                                      </span>
                                      <h4 style={{ color: '#fff', margin: '2px 0 4px', fontSize: '1rem' }}>{found.item_name}</h4>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Found at: {found.location} on {found.incident_date}
                                      </span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 8 }}>
                                    <button
                                      onClick={() => setSelectedReport(found)}
                                      className="btn btn-outline btn-sm"
                                      style={{ fontSize: '0.8rem' }}
                                    >
                                      View Item
                                    </button>
                                    <button
                                      onClick={() => setClaimingReport(found)}
                                      className="btn btn-primary btn-sm"
                                      style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontSize: '0.8rem' }}
                                    >
                                      <ShieldCheck size={14} /> Claim This Item
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        🔍 <em>No matching found items detected by the AI yet. The engine checks automatically as new found reports are filed across campus.</em>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <FileText size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>No Lost Items Registered</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: '1.5rem' }}>
                You have not filed any lost item reports yet.
              </p>
              <Link to="/report-lost" className="btn btn-primary">
                <PlusCircle size={16} /> Report a Lost Item Now
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* SECTION 2: ITEMS I FOUND */
        <div>
          {foundReports.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem'
            }}>
              {foundReports.map((rep) => (
                <ReportCard
                  key={rep.id}
                  report={rep}
                  onViewDetails={setSelectedReport}
                  onEdit={setEditingReport}
                  onDelete={handleDelete}
                  isOwner={true}
                  isAdmin={user && user.role?.toUpperCase() === 'ADMIN'}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <Search size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>No Found Items Registered</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: '1.5rem' }}>
                You haven't turned in or registered any found campus items yet.
              </p>
              <Link to="/report-found" className="btn btn-secondary">
                <Search size={16} /> Report a Found Item
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onClaimItem={(rep) => setClaimingReport(rep)}
          onRefresh={fetchMyReportsAndMatches}
        />
      )}

      {/* Claim Modal */}
      {claimingReport && (
        <ClaimModal
          report={claimingReport}
          onClose={() => setClaimingReport(null)}
          onSuccess={fetchMyReportsAndMatches}
        />
      )}

      {/* Edit Modal */}
      {editingReport && (
        <ReportEditModal
          report={editingReport}
          categories={categories}
          onClose={() => setEditingReport(null)}
          onSaveSuccess={fetchMyReportsAndMatches}
        />
      )}
    </div>
  );
};

export default MyReportsPage;
