import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Search as SearchIcon, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import reportService from '../services/reportService';
import ReportCard from '../components/ReportCard';
import ReportDetailModal from '../components/ReportDetailModal';
import ReportEditModal from '../components/ReportEditModal';
import ClaimModal from '../components/ClaimModal';
import LoadingSpinner from '../components/LoadingSpinner';

export const FoundItemsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [claimingReport, setClaimingReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [reportsData, catsData] = await Promise.all([
        reportService.getReports({
          report_type: 'FOUND',
          query: searchQuery.trim() || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sort_by: sortBy
        }),
        reportService.getCategories()
      ]);
      setReports(reportsData.items);
      setCategories(catsData);
    } catch (err) {
      console.error("Error loading found items:", err);
      addToast("Failed to load found item reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this found item report?")) return;
    try {
      await reportService.deleteReport(reportId);
      addToast("Report deleted successfully", "success");
      fetchReports();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to delete report", "error");
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <SearchIcon size={28} color="var(--accent-emerald)" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Found Items Directory</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Inspect items found across campus grounds, library, labs, and security holding offices.
          </p>
        </div>

        <Link to="/report-found" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}>
          <PlusCircle size={18} /> Report Found Item
        </Link>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search item name, brand, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpDown size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            Apply Filters
          </button>
        </form>
      </div>

      {/* Reports Cards Grid */}
      {loading ? (
        <LoadingSpinner label="Searching Found Reports..." />
      ) : reports.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem'
        }}>
          {reports.map((rep) => (
            <ReportCard
              key={rep.id}
              report={rep}
              onViewDetails={setSelectedReport}
              onEdit={setEditingReport}
              onDelete={handleDelete}
              isOwner={user && rep.user_id === user.id}
              isAdmin={user && user.role?.toUpperCase() === 'ADMIN'}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <SearchIcon size={42} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>No Found Items Registered</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Try clearing search terms or selecting a different category.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onClaimItem={(rep) => setClaimingReport(rep)}
        />
      )}

      {/* Claim Modal */}
      {claimingReport && (
        <ClaimModal
          report={claimingReport}
          onClose={() => setClaimingReport(null)}
          onSuccess={fetchReports}
        />
      )}

      {/* Edit Modal */}
      {editingReport && (
        <ReportEditModal
          report={editingReport}
          categories={categories}
          onClose={() => setEditingReport(null)}
          onSaveSuccess={fetchReports}
        />
      )}
    </div>
  );
};

export default FoundItemsPage;
