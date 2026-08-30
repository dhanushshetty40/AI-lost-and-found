import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, FileText, Sparkles, Activity, Award, UserCheck, 
  UserX, Trash2, RefreshCw, CheckCircle2, AlertTriangle, Layers, 
  Clock, Filter, MapPin, Compass, TrendingUp, Calendar, ArrowUpRight, BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import adminService from '../services/adminService';
import matchService from '../services/matchService';
import analyticsService from '../services/analyticsService';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  "All Categories",
  "Electronics & Gadgets",
  "Bags & Backpacks",
  "Wallets & Purses",
  "Stationery & Books",
  "Clothing & Accessories",
  "ID Cards & Documents",
  "Keys & Security Cards",
  "Other Valuables"
];

export const AdminDashboard = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'reports', 'audit'

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [campusOverview, setCampusOverview] = useState(null);
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Analytics Filter states
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // '7d', '30d', '90d', 'all'
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('');

  // User Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionRunning, setActionRunning] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const overviewParams = {
        date_range: dateRangeFilter,
        ...(categoryFilter !== 'All Categories' ? { category: categoryFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {})
      };

      const [anData, cpData, hlData, uData, repData, logData] = await Promise.all([
        adminService.getAnalytics(),
        analyticsService.getAnalyticsOverview(overviewParams),
        adminService.getHealth(),
        adminService.getUsers(userSearch, userRoleFilter),
        adminService.getReports(),
        adminService.getAuditLogs()
      ]);
      setAnalytics(anData);
      setCampusOverview(cpData);
      setHealth(hlData);
      setUsers(uData);
      setReports(repData.items || []);
      setAuditLogs(logData.items || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
      addToast("Failed to fetch admin metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userRoleFilter, dateRangeFilter, categoryFilter, statusFilter]);

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleRoleToggle = async (userObj) => {
    const targetRole = userObj.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change ${userObj.full_name}'s role to ${targetRole}?`)) return;

    try {
      await adminService.updateUserRole(userObj.id, targetRole);
      addToast(`User role updated to ${targetRole}`, "success");
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to update user role", "error");
    }
  };

  const handleStatusToggle = async (userObj) => {
    const actionStr = userObj.is_active ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${actionStr} account for ${userObj.full_name}?`)) return;

    try {
      await adminService.toggleUserStatus(userObj.id);
      addToast(`Account ${actionStr}d successfully`, "success");
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to toggle account status", "error");
    }
  };

  const handleDeleteReport = async (reportId, itemName) => {
    if (!window.confirm(`Are you sure you want to FORCE DELETE report #${reportId}: '${itemName}'?`)) return;

    try {
      await adminService.deleteReport(reportId);
      addToast(`Report #${reportId} deleted successfully`, "success");
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to delete report", "error");
    }
  };

  const handleRunAIMatching = async () => {
    setActionRunning(true);
    try {
      const res = await matchService.runBatchAIMatching();
      addToast(`Batch AI Matching Completed! Processed ${res.processed_lost} lost reports against ${res.processed_found} found reports. Created ${res.new_matches_created} new matches!`, "success");
      fetchDashboardData();
    } catch (err) {
      addToast("Failed to run AI matching engine", "error");
    } finally {
      setActionRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ padding: 8, borderRadius: 10, backgroundColor: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
              <Shield size={24} />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Admin Executive Control Center</h1>
            {health && (
              <span className={`badge ${health.status === 'HEALTHY' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: 8 }}>
                ● {health.status}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            System health monitoring, RBAC user role permissions, content moderation, Campus Intelligence, and AI match auditing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/campus-map')}
            className="btn btn-outline"
            style={{ borderColor: '#6366f1', color: '#818cf8' }}
          >
            <Compass size={16} /> Open Campus Map
          </button>
          <button
            onClick={handleRunAIMatching}
            disabled={actionRunning}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', borderColor: '#8b5cf6' }}
          >
            <Sparkles size={16} /> {actionRunning ? 'Running AI Engine...' : 'Run AI Batch Engine'}
          </button>
          <button onClick={fetchDashboardData} className="btn btn-outline" title="Refresh Dashboard Data">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Activity size={16} /> Campus Intelligence & Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Users size={16} /> User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <FileText size={16} /> Report Moderation ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Clock size={16} /> Audit Logs ({auditLogs.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading Executive Control Center..." />
      ) : (
        <>
          {/* TAB 1: CAMPUS INTELLIGENCE & ANALYTICS */}
          {activeTab === 'analytics' && campusOverview && (
            <div>
              {/* Dynamic Filter Toolbar */}
              <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Filter size={15} /> Time Window:
                  </span>
                  <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                    {[
                      { id: '7d', label: 'Last 7 Days' },
                      { id: '30d', label: 'Last 30 Days' },
                      { id: '90d', label: 'Last 90 Days' },
                      { id: 'all', label: 'All Time' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => setDateRangeFilter(btn.id)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: dateRangeFilter === btn.id ? 'var(--primary)' : 'transparent',
                          color: dateRangeFilter === btn.id ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.8rem',
                          fontWeight: dateRangeFilter === btn.id ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.825rem', minWidth: '170px' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.825rem', minWidth: '140px' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              {/* Core KPI Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>TOTAL LOST ITEMS</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{campusOverview.total_lost}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                    Top lost: {campusOverview.most_lost_category || 'N/A'}
                  </span>
                </div>

                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>TOTAL FOUND ITEMS</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{campusOverview.total_found}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                    Top found: {campusOverview.most_found_category || 'N/A'}
                  </span>
                </div>

                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>RECOVERY RATE</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{campusOverview.overall_recovery_rate}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'block', marginTop: 4 }}>
                    {campusOverview.total_resolved} successfully recovered
                  </span>
                </div>

                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #c084fc' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>AI MATCH SUCCESS RATE</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>{campusOverview.ai_match_success_rate}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                    {campusOverview.confirmed_matches_count} confirmed / {campusOverview.total_ai_matches} matches
                  </span>
                </div>

                <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CLAIMS & RESOLUTIONS</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{campusOverview.approved_claims_count}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                    {campusOverview.pending_claims_count} pending reviews
                  </span>
                </div>
              </div>

              {/* Category Comparison & Temporal Analysis Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Category Comparison Chart */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Layers size={18} color="var(--primary)" /> Category Breakdown (Lost vs Found)
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#f87171' }}>● Lost</span>
                      <span style={{ color: '#34d399' }}>● Found</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {campusOverview.category_comparison.map(item => {
                      const maxVal = Math.max(item.lost_count, item.found_count, 1);
                      const lostPct = Math.min(100, (item.lost_count / maxVal) * 100);
                      const foundPct = Math.min(100, (item.found_count / maxVal) * 100);

                      return (
                        <div key={item.category}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#fff', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600 }}>{item.category}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {item.lost_count} lost / {item.found_count} found ({item.recovery_rate}% rec.)
                            </span>
                          </div>
                          {/* Dual progress bars */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${lostPct}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: 3 }} />
                            </div>
                            <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${foundPct}%`, height: '100%', backgroundColor: '#10b981', borderRadius: 3 }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Temporal Analysis: Hourly Loss Distribution */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={18} color="var(--accent-amber)" /> Hourly Loss Distribution & Peak Times
                    </h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 4, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 600 }}>
                      Peak: {campusOverview.peak_loss_time_window}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Identifies high-incident campus hours during student transitions, cafeteria lunch rush, and lab sessions.
                  </p>

                  {/* Hourly Bar Chart Visualizer */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', gap: '0.5rem', padding: '0 0.5rem', borderBottom: '1px solid var(--border)' }}>
                    {campusOverview.hourly_distribution.map(hb => {
                      const maxHourly = Math.max(...campusOverview.hourly_distribution.map(h => h.lost_count), 1);
                      const barHeight = Math.max(12, (hb.lost_count / maxHourly) * 120);

                      return (
                        <div key={hb.hour_range} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: hb.is_peak ? '#fbbf24' : '#94a3b8', marginBottom: 4 }}>
                            {hb.lost_count}
                          </span>
                          <div
                            style={{
                              width: '80%',
                              height: `${barHeight}px`,
                              backgroundColor: hb.is_peak ? '#f59e0b' : 'rgba(99, 102, 241, 0.6)',
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.3s ease'
                            }}
                            title={`${hb.hour_range}: ${hb.lost_count} Lost, ${hb.found_count} Found`}
                          />
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6, whiteSpace: 'nowrap', transform: 'rotate(-25deg)' }}>
                            {hb.hour_key}:00
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekday Distribution Row */}
                  <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>Busiest Incident Day:</strong> <span style={{ color: '#fff' }}>{campusOverview.busiest_day}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>Avg Resolution Time:</strong> <span style={{ color: 'var(--accent-emerald)' }}>{campusOverview.avg_resolution_days} Days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus Location Risk & Recovery Table */}
              <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={18} color="#ef4444" /> Campus Location Danger & Recovery Risk Index
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: 3 }}>
                      Spatial intelligence tracking recovery efficiency across buildings and identifying loss hotspots.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/campus-map')}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    View on Interactive Map <ArrowUpRight size={14} />
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem' }}>CAMPUS LANDMARK</th>
                        <th style={{ padding: '0.75rem' }}>ZONE</th>
                        <th style={{ padding: '0.75rem' }}>LOST</th>
                        <th style={{ padding: '0.75rem' }}>FOUND</th>
                        <th style={{ padding: '0.75rem' }}>RECOVERED</th>
                        <th style={{ padding: '0.75rem' }}>RECOVERY RATE</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>RISK INDEX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campusOverview.location_risk_table.map((loc) => (
                        <tr key={loc.location_name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 700 }}>
                            {loc.location_name}
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{loc.zone}</td>
                          <td style={{ padding: '0.75rem', color: '#f87171', fontWeight: 700 }}>{loc.total_lost}</td>
                          <td style={{ padding: '0.75rem', color: '#34d399', fontWeight: 700 }}>{loc.total_found}</td>
                          <td style={{ padding: '0.75rem', color: '#c084fc', fontWeight: 700 }}>{loc.total_resolved}</td>
                          <td style={{ padding: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                            {loc.recovery_rate_percent}%
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <span className={`badge ${loc.risk_level === 'HIGH' ? 'badge-danger' : (loc.risk_level === 'MODERATE' ? 'badge-warning' : 'badge-success')}`}>
                              {loc.risk_level} RISK
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Operational System Health */}
              {health && (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={18} color="var(--accent-emerald)" /> System Operational Health
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Database Connection</span>
                      <span style={{ color: health.database_connected ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
                        {health.database_connected ? '✓ Operational' : '✕ Disconnected'}
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>System Architecture</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{health.version}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Active Tables</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{health.active_tables_count} Tables</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Environment</span>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{health.environment}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              {/* Search & Role Filter Header */}
              <form onSubmit={handleUserSearchSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="input-field"
                  style={{ flex: 2, minWidth: 200 }}
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="form-select"
                  style={{ flex: 1, minWidth: 140 }}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
                <button type="submit" className="btn btn-secondary">
                  Search
                </button>
              </form>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>ID & USER</th>
                      <th style={{ padding: '0.75rem' }}>EMAIL</th>
                      <th style={{ padding: '0.75rem' }}>ROLE</th>
                      <th style={{ padding: '0.75rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem' }}>REPUTATION</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 700 }}>
                          #{u.id} {u.full_name}
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {u.is_active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                          {u.reputation_score} pts
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleRoleToggle(u)}
                              className="btn btn-outline btn-sm"
                              title="Toggle Role (ADMIN / USER)"
                            >
                              {u.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleStatusToggle(u)}
                              className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`}
                            >
                              {u.is_active ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REPORT MODERATION */}
          {activeTab === 'reports' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>ID & TITLE</th>
                      <th style={{ padding: '0.75rem' }}>TYPE</th>
                      <th style={{ padding: '0.75rem' }}>CATEGORY</th>
                      <th style={{ padding: '0.75rem' }}>LOCATION</th>
                      <th style={{ padding: '0.75rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>MODERATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 700 }}>
                          #{r.id} {r.item_name}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${r.report_type === 'LOST' ? 'badge-danger' : 'badge-success'}`}>
                            {r.report_type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{r.category}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--primary)' }}>{r.location}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="badge badge-primary">{r.status}</span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteReport(r.id, r.item_name)}
                            className="btn btn-danger btn-sm"
                          >
                            <Trash2 size={14} /> Force Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>LOG ID</th>
                      <th style={{ padding: '0.75rem' }}>ACTION</th>
                      <th style={{ padding: '0.75rem' }}>DETAILS</th>
                      <th style={{ padding: '0.75rem' }}>IP ADDRESS</th>
                      <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>#{log.id}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="badge badge-warning">{log.action}</span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#fff' }}>{log.details}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-dim)' }}>{log.ip_address || '127.0.0.1'}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
