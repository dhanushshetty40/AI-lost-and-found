import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, LogOut, User as UserIcon, Shield, FileText, Layers, Sparkles, Compass, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import NotificationBell from './NotificationBell';

export const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Search size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              Smart<span style={{ color: 'var(--primary)' }}>Find</span>
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Multimodal Lost & Found
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/reports/lost" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
            <FileText size={16} color="var(--accent-rose)" /> Lost Items
          </Link>

          <Link to="/reports/found" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Search size={16} color="var(--accent-emerald)" /> Found Items
          </Link>

          <Link to="/campus-map" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Compass size={16} color="#818cf8" /> Campus Map
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/my-reports" style={{ color: '#60a5fa', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={16} color="var(--primary)" /> My Reports & AI Matches
              </Link>

              <Link to="/claims" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Shield size={16} color="var(--accent-emerald)" /> Claims
              </Link>

              {isAdmin && (
                <>
                  <Link to="/experiments" style={{ color: '#fbbf24', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <FlaskConical size={16} color="#fbbf24" /> Experiments
                  </Link>
                  <Link to="/admin/ai-engine" style={{ color: '#c084fc', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Sparkles size={16} color="#c084fc" /> AI Control
                  </Link>
                  <Link to="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Shield size={16} /> Admin
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Right Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <>
              <NotificationBell />

              <Link to="/report-lost" className="btn btn-primary btn-sm">
                <PlusCircle size={15} /> Report Lost
              </Link>
              <Link to="/report-found" className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                <PlusCircle size={15} color="var(--accent-emerald)" /> Report Found
              </Link>

              <div style={{ height: 24, width: 1, backgroundColor: 'var(--border)', margin: '0 4px' }} />

              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ display: 'none', mdDisplay: 'block' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block' }}>
                    {user?.full_name?.split(' ')[0]}
                  </span>
                  <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-primary'}`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                    {user?.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.4rem 0.6rem' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
