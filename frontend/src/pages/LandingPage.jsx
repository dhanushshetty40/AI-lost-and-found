import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, MapPin, ShieldCheck, Cpu, ArrowRight, Layers, Lock, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem 5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
        marginBottom: '4rem',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <Sparkles size={16} /> 5th Sem Mini Project — AI & Machine Learning
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          color: '#ffffff',
          marginBottom: '1.25rem',
          letterSpacing: '-0.02em'
        }}>
          SmartFind <span style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>AI-Powered</span> Multimodal Lost & Found
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: 780,
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Intelligent campus item recovery system utilizing semantic text embeddings, deep visual similarity, spatial location matching, and explainable match scoring.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="btn btn-primary btn-lg">
              <span>Go to {isAdmin ? "Admin Dashboard" : "User Dashboard"}</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                <span>Create User Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Demo Credentials Box for Evaluators */}
      <div className="card" style={{
        marginBottom: '4rem',
        borderColor: 'rgba(59, 130, 246, 0.4)',
        background: 'linear-gradient(180deg, #182234 0%, #0f172a 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <ShieldCheck size={22} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
            Evaluator Demo Credentials (Phase 1 Ready)
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Use pre-configured credentials below to test instant authentication, role-based authorization, and protected dashboard routing:
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <UserCheck size={16} color="#60a5fa" />
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Regular User Role</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Email:</strong> <code>user@smartfind.com</code><br />
              <strong>Password:</strong> <code>User@123</code>
            </div>
          </div>

          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Shield size={16} color="#c084fc" />
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Administrator Role</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Email:</strong> <code>admin@smartfind.com</code><br />
              <strong>Password:</strong> <code>Admin@123</code>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <h2 style={{ textAlign: 'center', fontSize: '1.75rem', color: '#fff', fontWeight: 800, marginBottom: '2rem' }}>
        Multimodal Intelligent Matching Engine
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '4rem'
      }}>
        <div className="card">
          <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.15)', width: 'fit-content', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Cpu size={24} />
          </div>
          <h3 className="card-title">Semantic Text Similarity</h3>
          <p className="card-subtitle">
            Leverages vector embeddings and NLP feature extraction to match item descriptions, categories, brand names, and visual attributes.
          </p>
        </div>

        <div className="card">
          <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', width: 'fit-content', color: 'var(--accent-emerald)', marginBottom: '1rem' }}>
            <Sparkles size={24} />
          </div>
          <h3 className="card-title">Visual Image Embeddings</h3>
          <p className="card-subtitle">
            Extracts deep feature representations from uploaded lost/found photographs to detect visual shape, color, and object similarity.
          </p>
        </div>

        <div className="card">
          <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.15)', width: 'fit-content', color: 'var(--accent-amber)', marginBottom: '1rem' }}>
            <MapPin size={24} />
          </div>
          <h3 className="card-title">Spatial & Temporal Proximity</h3>
          <p className="card-subtitle">
            Computes distance matrices across campus coordinates and incident timestamps to calculate high-confidence proximity scores.
          </p>
        </div>

        <div className="card">
          <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(139, 92, 246, 0.15)', width: 'fit-content', color: 'var(--accent-purple)', marginBottom: '1rem' }}>
            <Lock size={24} />
          </div>
          <h3 className="card-title">Ownership Verification</h3>
          <p className="card-subtitle">
            Hidden attribute questionnaire workflow preventing fraudulent claims while maintaining complete privacy for rightful owners.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
