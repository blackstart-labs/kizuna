import React, { useState } from 'react';
import { Box, Search, AlertCircle, RotateCw, Square, Play } from 'lucide-react';
import { Container } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface ContainersViewProps {
  containers: Container[] | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const ContainersView: React.FC<ContainersViewProps> = ({ containers, loading, onRefresh }) => {
  const [query, setQuery] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirmStopId, setConfirmStopId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (loading && !containers) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading containers...</div>;
  }

  const allContainers = containers || [];
  const filtered = allContainers.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.image.toLowerCase().includes(query.toLowerCase()) ||
    c.host_name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAction = async (id: string, action: 'restart' | 'stop' | 'start') => {
    setActingId(id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/v1/containers/${id}/${action}`, { method: 'POST' });
      if (!res.ok) {
        throw new Error(`Failed to ${action} container`);
      }
      setActionMessage({ text: `Container ${action} initiated successfully`, type: 'success' });
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setActionMessage({ text: msg, type: 'error' });
    } finally {
      setActingId(null);
      setConfirmStopId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Toast Feedback */}
      {actionMessage && (
        <div
          className="animate-fade-in"
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: actionMessage.type === 'success' ? 'var(--status-online-bg)' : 'var(--status-critical-bg)',
            color: actionMessage.type === 'success' ? 'var(--status-online)' : 'var(--status-critical)',
            border: `1px solid ${actionMessage.type === 'success' ? 'var(--status-online-border)' : 'var(--status-critical-border)'}`,
          }}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Top Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing {filtered.length} of {allContainers.length} containers across fleet
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '6px 12px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search containers or images..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Containers Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 16px' }}>Container</th>
              <th style={{ padding: '12px 16px' }}>Host</th>
              <th style={{ padding: '12px 16px' }}>Image</th>
              <th style={{ padding: '12px 16px' }}>State / Uptime</th>
              <th style={{ padding: '12px 16px' }}>Memory</th>
              <th style={{ padding: '12px 16px' }}>Restarts</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cnt) => {
              const memMB = (cnt.memory_usage_bytes / (1024 * 1024)).toFixed(0);
              const isActing = actingId === cnt.container_id;

              return (
                <tr
                  key={cnt.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Box size={16} style={{ color: 'var(--accent-primary)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cnt.name}</div>
                        {cnt.ports && cnt.ports.length > 0 && (
                          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cnt.ports.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {cnt.host_name}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {cnt.image}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusBadge status={cnt.state} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cnt.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                      {memMB} MB ({cnt.memory_usage_pct.toFixed(0)}%)
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {cnt.restart_count > 5 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-critical)', fontWeight: 600 }}>
                        <AlertCircle size={14} /> {cnt.restart_count}
                      </span>
                    ) : (
                      <span className="mono" style={{ color: 'var(--text-muted)' }}>{cnt.restart_count}</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {/* Restart Button */}
                      <button
                        onClick={() => handleAction(cnt.container_id, 'restart')}
                        disabled={isActing}
                        title="Restart Container"
                        style={{
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <RotateCw size={13} className={isActing ? 'animate-spin' : ''} />
                        <span>Restart</span>
                      </button>

                      {/* Start / Stop Toggle */}
                      {cnt.state === 'running' ? (
                        confirmStopId === cnt.container_id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleAction(cnt.container_id, 'stop')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--status-critical)',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                            >
                              Confirm Stop
                            </button>
                            <button
                              onClick={() => setConfirmStopId(null)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg-surface-elevated)',
                                color: 'var(--text-muted)',
                                fontSize: '11px',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmStopId(cnt.container_id)}
                            title="Stop Container"
                            style={{
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--status-warning)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                            }}
                          >
                            <Square size={13} />
                            <span>Stop</span>
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleAction(cnt.container_id, 'start')}
                          disabled={isActing}
                          title="Start Container"
                          style={{
                            padding: '6px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--status-online)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                          }}
                        >
                          <Play size={13} />
                          <span>Start</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
