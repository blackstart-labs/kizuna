import React from 'react';
import { Sparkles } from 'lucide-react';
import { Recommendation } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface OptimizerViewProps {
  recommendations: Recommendation[] | null;
  loading: boolean;
}

export const OptimizerView: React.FC<OptimizerViewProps> = ({ recommendations, loading }) => {
  if (loading && !recommendations) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing waste and pressure points...</div>;
  }

  const allRecs = recommendations || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Resource Intelligence & Waste Optimizer
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Actionable homelab recommendations with zero destructive auto-actions.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {allRecs.map((rec) => {
          const savingsGB = rec.potential_savings_bytes
            ? (rec.potential_savings_bytes / (1024 * 1024 * 1024)).toFixed(1)
            : null;

          return (
            <div key={rec.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{rec.title}</h3>
                      {savingsGB && (
                        <span className="mono" style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', backgroundColor: 'var(--status-online-bg)', color: 'var(--status-online)', borderRadius: 'var(--radius-sm)' }}>
                          +{savingsGB} GB Storage Reclaim
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      Category: {rec.category}
                    </span>
                  </div>
                </div>
                <StatusBadge status={rec.severity} />
              </div>

              {/* What / Why / Action Matrix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', margin: '14px 0' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', minWidth: '120px' }}>Why it matters:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{rec.why_it_matters}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', minWidth: '120px' }}>Recommended action:</span>
                  <code style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                    {rec.action_suggestion}
                  </code>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
