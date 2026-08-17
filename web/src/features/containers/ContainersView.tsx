import React, { useState } from 'react';
import { Box, Search, AlertCircle } from 'lucide-react';
import { Container } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface ContainersViewProps {
  containers: Container[] | null;
  loading: boolean;
}

export const ContainersView: React.FC<ContainersViewProps> = ({ containers, loading }) => {
  const [query, setQuery] = useState('');

  if (loading && !containers) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading containers...</div>;
  }

  const allContainers = containers || [];
  const filtered = allContainers.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.image.toLowerCase().includes(query.toLowerCase()) ||
    c.host_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

      {/* Containers Table / Card Matrix */}
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((cnt) => {
              const memMB = (cnt.memory_usage_bytes / (1024 * 1024)).toFixed(0);

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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
