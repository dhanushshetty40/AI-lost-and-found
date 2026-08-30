import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Award, Calendar, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';

export const ProfilePage = () => {
  const { user, login } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
      addToast("Profile updated successfully!", "success");
      // Reload current user state
      const updatedUser = await authService.getCurrentUser();
      window.location.reload();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '3rem auto', padding: '0 1.5rem 4rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800
          }}>
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{user?.full_name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span className={`badge ${user?.role?.toUpperCase() === 'ADMIN' ? 'badge-admin' : 'badge-primary'}`}>
                {user?.role}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reputation Score</label>
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{user?.reputation_score || 100} / 100 Points</span>
              <Award size={20} color="var(--primary)" />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem' }}
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Updates'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
