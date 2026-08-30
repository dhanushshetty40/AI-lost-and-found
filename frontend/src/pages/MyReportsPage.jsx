import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, Search, Trash2, Edit, Eye, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import reportService from '../services/reportService';
import ReportCard from '../components/ReportCard';
import ReportDetailModal from '../components/ReportDetailModal';
import ReportEditModal from '../components/ReportEditModal';
import LoadingSpinner from '../components/LoadingSpinner';

export const MyReportsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'LOST', 'FOUND'

  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const [reportsData, catsData] = await Promise.all([
        reportService.getReports({ my_reports: true }),
        reportService.getCategories()
      ]);
      setReports(reportsData.items);
      setCategories(catsData);
    } catch (err) {
      console.error("Failed to load user reports:", err);
      addToast("Error fetching your reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleDelete = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await reportService.deleteReport(reportId);
      addToast("Report deleted successfully", "success");
      fetchMyReports();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to delete report", "error");
    }
  };

  const filteredReports = reports.filter(r => {
    if (activeTab === 'LOST') return r.report_type === 'LOST';
    if (activeTab === 'FOUND') return r.report_type === 'FOUND';
    return true;
  });

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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>My Filed Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
            Manage your registered lost and found items, update details, or track status.
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
          All Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('LOST')}
          className={`btn ${activeTab === 'LOST' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', backgroundColor: activeTab === 'LOST' ? 'var(--accent-rose)' : undefined, borderColor: activeTab === 'LOST' ? 'var(--accent-rose)' : undefined }}
        >
          Lost Items ({reports.filter(r => r.report_type === 'LOST').length})
        </button>
        <button
          onClick={() => setActiveTab('FOUND')}
          className={`btn ${activeTab === 'FOUND' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', backgroundColor: activeTab === 'FOUND' ? 'var(--accent-emerald)' : undefined, borderColor: activeTab === 'FOUND' ? 'var(--accent-emerald)' : undefined }}
        >
          Found Items ({reports.filter(r => r.report_type === 'FOUND').length})
        </button>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <LoadingSpinner label="Loading Your Reports..." />
      ) : filteredReports.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredReports.map((rep) => (
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
          <FileText size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>No Reports Registered</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, marginBottom: '1.5rem' }}>
            You have not filed any {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} reports yet.
          </p>
          <div style={{ display: 'inline-flex', gap: '1rem' }}>
            <Link to="/report-lost" className="btn btn-primary">
              <PlusCircle size={16} /> Report Lost Item
            </Link>
            <Link to="/report-found" className="btn btn-secondary">
              <Search size={16} /> Report Found Item
            </Link>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {/* Edit Modal */}
      {editingReport && (
        <ReportEditModal
          report={editingReport}
          categories={categories}
          onClose={() => setEditingReport(null)}
          onSaveSuccess={fetchMyReports}
        />
      )}
    </div>
  );
};

export default MyReportsPage;
