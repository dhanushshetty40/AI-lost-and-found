import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 28, label = "Loading...", fullScreen = false }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '2rem',
      color: 'var(--text-muted)'
    }}>
      <Loader2 size={size} className="spin" color="var(--primary)" />
      {label && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
