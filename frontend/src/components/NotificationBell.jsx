import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Sparkles, ShieldCheck, Award, MessageSquare, ExternalLink } from 'lucide-react';
import notificationService from '../services/notificationService';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setUnreadCount(data.unread_count);
      setNotifications(data.items);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      fetchNotifications();
    }
    setOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CLAIM_RECEIVED': return <MessageSquare size={14} color="var(--primary)" />;
      case 'CLAIM_APPROVED': return <ShieldCheck size={14} color="var(--accent-emerald)" />;
      case 'REPUTATION_UP': return <Award size={14} color="var(--accent-amber)" />;
      case 'MATCH_ALERT': return <Sparkles size={14} color="#c084fc" />;
      default: return <Bell size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-outline btn-sm"
        style={{ padding: '0.4rem 0.6rem', position: 'relative', border: '1px solid var(--border)' }}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: 'var(--accent-rose)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-surface)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Drawer Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 340,
          maxHeight: 420,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '0.85rem 1rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15, 23, 42, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bell size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-light)',
                    backgroundColor: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    gap: 10
                  }}
                  className="notification-item"
                >
                  <div style={{ marginTop: 2 }}>{getTypeIcon(n.notification_type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: n.is_read ? 'var(--text-muted)' : '#fff' }}>
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.35 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
