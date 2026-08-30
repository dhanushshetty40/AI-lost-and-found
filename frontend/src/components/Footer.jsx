import React from 'react';
import { Search, Shield, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      padding: '2.5rem 1.5rem 1.5rem',
      color: 'var(--text-muted)',
      fontSize: '0.85rem'
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Search size={20} color="var(--primary)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
              Smart<span style={{ color: 'var(--primary)' }}>Find</span> AI
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            AI-Powered Multimodal Lost & Found Matching System. Intelligent text, image, location, and date feature matching for campus recovery.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>System Architecture</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Multimodal Feature Extraction</li>
            <li>Semantic Text Embeddings</li>
            <li>Explainable AI Confidence Engine</li>
            <li>Campus Spatial & Temporal Matching</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Academic Context</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            5th Semester Mini Project<br />
            Department of Artificial Intelligence & Machine Learning / CSE<br />
            Academic Year 2026
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem'
      }}>
        <span>&copy; {new Date().getFullYear()} SmartFind AI System. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>Phase 1 — Project Foundation & Security Architecture</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
