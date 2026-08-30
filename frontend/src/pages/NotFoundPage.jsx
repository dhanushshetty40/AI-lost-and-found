import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{
      maxWidth: 500,
      margin: '6rem auto',
      textAlign: 'center',
      padding: '0 1.5rem'
    }}>
      <div className="card">
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: 'var(--accent-rose)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <AlertTriangle size={30} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          The requested SmartFind route or page does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-full">
          <Home size={18} /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
