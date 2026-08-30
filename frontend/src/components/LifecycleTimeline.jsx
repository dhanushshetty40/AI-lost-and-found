import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Sparkles, Shield, UserCheck, 
  Award, PackageCheck, AlertCircle, ArrowRight 
} from 'lucide-react';
import lifecycleService from '../services/lifecycleService';
import LoadingSpinner from './LoadingSpinner';

const STEP_ICONS = {
  REPORTED: PackageCheck,
  MATCH_DETECTED: Sparkles,
  CLAIM_SUBMITTED: Shield,
  VERIFICATION: UserCheck,
  APPROVED: CheckCircle2,
  RETURNED: PackageCheck,
  CLOSED: Award
};

export const LifecycleTimeline = ({ reportId }) => {
  const [lifecycle, setLifecycle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId) return;

    const fetchLifecycle = async () => {
      setLoading(true);
      try {
        const data = await lifecycleService.getReportLifecycle(reportId);
        setLifecycle(data);
      } catch (err) {
        console.error("Failed to load lifecycle timeline:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLifecycle();
  }, [reportId]);

  if (loading) {
    return <LoadingSpinner message="Tracing Item Lifecycle Progression..." />;
  }

  if (!lifecycle) return null;

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
      padding: '1.25rem',
      color: '#1E293B'
    }}>
      {/* Header with Completion Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={16} color="#4F46E5" /> Item Recovery Lifecycle Timeline
          </h4>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4F46E5' }}>
            {lifecycle.completion_percentage}% Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${lifecycle.completion_percentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4F46E5 0%, #10B981 100%)',
            borderRadius: 3,
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Stepper Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
        {lifecycle.lifecycle_steps.map((step, idx) => {
          const IconComp = STEP_ICONS[step.step_key] || CheckCircle2;
          const isDone = step.is_completed;
          const isCurrent = step.is_current;

          return (
            <div 
              key={step.step_key} 
              style={{
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start',
                position: 'relative'
              }}
            >
              {/* Connector line */}
              {idx < lifecycle.lifecycle_steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '28px',
                  bottom: '-8px',
                  width: '2px',
                  backgroundColor: isDone ? '#10B981' : '#E2E8F0',
                  zIndex: 1
                }} />
              )}

              {/* Step Circle Icon */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isDone ? '#10B981' : (isCurrent ? '#4F46E5' : '#F1F5F9'),
                color: isDone || isCurrent ? '#FFFFFF' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 2,
                boxShadow: isCurrent ? '0 0 0 4px rgba(79, 70, 229, 0.2)' : 'none'
              }}>
                <IconComp size={14} />
              </div>

              {/* Step Details */}
              <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: isDone ? '#0F172A' : (isCurrent ? '#4F46E5' : '#64748B')
                  }}>
                    {idx + 1}. {step.title}
                  </span>
                  {step.timestamp && (
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {new Date(step.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748B', lineHeight: 1.35 }}>
                  {step.description}
                </p>

                {step.actor && (
                  <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.7rem', color: '#4F46E5', background: '#EEF2FF', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    Actor: {step.actor}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LifecycleTimeline;
