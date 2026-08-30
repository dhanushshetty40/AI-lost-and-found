import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'var(--primary)' }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>
          {value}
        </div>
        {subtitle && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {subtitle}
          </span>
        )}
      </div>
      {Icon && (
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: `${color}18`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
