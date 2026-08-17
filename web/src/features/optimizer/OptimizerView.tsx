import React, { useState } from 'react';
import { Sparkles, Play, ShieldCheck } from 'lucide-react';
import { Recommendation } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface OptimizerViewProps {
  recommendations: Recommendation[] | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const OptimizerView: React.FC<OptimizerViewProps> = ({ recommendations, loading, onRefresh }) => {
  const [actingId, setActingId] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (loading && !recommendations) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing waste and pressure points...</div>;
  }

  const allRecs = recommendations || [];

  const handleExecuteAction = async (rec: Recommendation) => {
    if (!rec.auto_fix_action) return;
    setActingId(rec.id);
    setToastMessage(null);

    try {
      const res = await fetch('/api/v1/optimizer/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: rec.auto_fix_action, dry_run: dryRun }),
      });

      if (!res.ok) throw new Error('Optimizer action failed');
      const data = await res.json();

      setToastMessage({
        text: dryRun
          ? `[Simulation] Safe execution validated. Would reclaim ${data.reclaimed_human || 'space'}.`
          : `Success! Reclaimed ${data.reclaimed_human || 'storage'} across node fleet.`,
        type: 'success',
      });

      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Execution failed';
      setToastMessage({ text: msg, type: 'error' });
    } finally {
      setActingId(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleDismiss = async (id: string) => {
    setActingId(id);
    try {
      await fetch(`/api/v1/optimizer/recommendations/${id}/dismiss`, { method: 'POST' });
      if (onRefresh) onRefresh();
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: toastMessage.type === 'success' ? 'var(--status-online-bg)' : 'var(--status-critical-bg)',
            color: toastMessage.type === 'success' ? 'var(--status-online)' : 'var(--status-critical)',
            border: `1px solid ${toastMessage.type === 'success' ? 'var(--status-online-border)' : 'var(--status-critical-border)'}`,
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header with Dry-Run Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Resource Intelligence & Waste Optimizer
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Proactive homelab recommendations with zero irreversible automatic actions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Dry-Run Simulation Mode</span>
          </label>
        </div>
      </div>

      {allRecs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={32} style={{ color: 'var(--status-online)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Fleet is fully optimized!</div>
          <div style={{ fontSize: '12px' }}>No active storage waste or memory bottlenecks detected.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allRecs.map((rec) => {
            const isActing = actingId === rec.id;
            const savings = rec.estimated_savings || (rec.potential_savings_bytes ? `${(rec.potential_savings_bytes / (1024 * 1024 * 1024)).toFixed(1)} GB` : null);

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
                        {savings && (
                          <span className="mono" style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', backgroundColor: 'var(--status-online-bg)', color: 'var(--status-online)', borderRadius: 'var(--radius-sm)' }}>
                            +{savings} Reclaimed
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
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)', minWidth: '120px' }}>Impact:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{rec.why_it_matters}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)', minWidth: '120px' }}>Action:</span>
                    <code style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                      {rec.action_suggestion}
                    </code>
                  </div>
                </div>

                {/* Interactive Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <button
                    onClick={() => handleDismiss(rec.id)}
                    disabled={isActing}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    Dismiss
                  </button>

                  {rec.is_auto_fixable && rec.auto_fix_action && (
                    <button
                      onClick={() => handleExecuteAction(rec)}
                      disabled={isActing}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Play size={13} />
                      {dryRun ? 'Simulate Reclaim' : 'Reclaim Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
