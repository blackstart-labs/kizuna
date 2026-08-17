import React, { useState } from 'react';
import { ShieldAlert, Clock, GitCommit, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Incident } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppStore } from '../../stores/useAppStore';

interface IncidentsViewProps {
  incidents: Incident[] | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ incidents, loading, onRefresh }) => {
  const { setActiveTab } = useAppStore();
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (loading && !incidents) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing correlated incidents...</div>;
  }

  const allIncidents = (incidents || []).filter((inc) => !resolvedIds.includes(inc.id));

  const handleResolve = (id: string) => {
    setResolvedIds((prev) => [...prev, id]);
    setFeedback(`Incident ${id} marked as resolved.`);
    setTimeout(() => setFeedback(null), 4000);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {feedback && (
        <div
          className="animate-fade-in"
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: 'var(--status-online-bg)',
            color: 'var(--status-online)',
            border: '1px solid var(--status-online-border)',
          }}
        >
          {feedback}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Correlated Cascade Incidents ({allIncidents.length})
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Kizuna correlates cascading alerts into single root-cause incidents to prevent alert fatigue.
          </p>
        </div>
      </div>

      {allIncidents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={36} style={{ color: 'var(--status-online)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>All Incidents Resolved!</div>
          <div style={{ fontSize: '12px' }}>Zero active cascade failures across your homelab.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allIncidents.map((inc) => (
            <div
              key={inc.id}
              className="card"
              style={{
                borderLeft: `4px solid ${inc.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)'}`,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '8px',
                      backgroundColor: inc.severity === 'critical' ? 'var(--status-critical-bg)' : 'var(--status-warning-bg)',
                      borderRadius: 'var(--radius-md)',
                      color: inc.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)',
                    }}
                  >
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{inc.title}</h3>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Triggered {new Date(inc.started_at).toLocaleTimeString()} · Root Cause: {inc.root_cause_type} ({inc.root_cause_id})
                    </div>
                  </div>
                </div>
                <StatusBadge status={inc.status} />
              </div>

              {/* Summary Description */}
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                {inc.summary}
              </p>

              {/* Cascading Timeline Events */}
              {inc.events && inc.events.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} />
                    Cascade Failure Timeline
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {inc.events.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px' }}>
                        <GitCommit size={14} style={{ color: ev.type === 'trigger' ? 'var(--status-critical)' : 'var(--status-warning)', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.component}: </span>
                          <span style={{ color: 'var(--text-secondary)' }}>{ev.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer with Impacted Badges and Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Impacted:</span>
                  {inc.impacted_services.map((svc) => (
                    <span
                      key={svc}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {svc}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {inc.root_cause_type === 'container' && (
                    <button
                      onClick={() => setActiveTab('containers')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      <span>Inspect Container</span>
                      <ArrowRight size={12} />
                    </button>
                  )}

                  {inc.root_cause_type === 'host' && (
                    <button
                      onClick={() => setActiveTab('hosts')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      <span>Inspect Node</span>
                      <ArrowRight size={12} />
                    </button>
                  )}

                  <button
                    onClick={() => handleResolve(inc.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--status-online-bg)',
                      color: 'var(--status-online)',
                      border: '1px solid var(--status-online-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  >
                    <Check size={12} />
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
