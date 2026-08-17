import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Incident } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface IncidentsViewProps {
  incidents: Incident[] | null;
  loading: boolean;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ incidents, loading }) => {
  if (loading && !incidents) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading incidents...</div>;
  }

  const allIncidents = incidents || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Correlated Cascade Incidents ({allIncidents.length})
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Kizuna automatically correlates multi-container and downstream dependency failures into single incident timelines.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {allIncidents.map((inc) => (
          <div
            key={inc.id}
            className="card"
            style={{
              borderLeft: `4px solid ${inc.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)'}`,
            }}
          >
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
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Triggered at {new Date(inc.started_at).toLocaleTimeString()} · Root Cause: {inc.root_cause_type} ({inc.root_cause_id})
                  </div>
                </div>
              </div>
              <StatusBadge status={inc.status} />
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              {inc.summary}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Impacted Services:</span>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-online)' }}>
                <CheckCircle2 size={14} />
                <span>Monitoring telemetry</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
