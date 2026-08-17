import React from 'react';
import { Server, Cpu, HardDrive, Thermometer, ShieldCheck } from 'lucide-react';
import { Host } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface HostsViewProps {
  hosts: Host[] | null;
  loading: boolean;
}

export const HostsView: React.FC<HostsViewProps> = ({ hosts, loading }) => {
  if (loading && !hosts) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading host nodes...</div>;
  }

  const allHosts = hosts || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="grid-2">
        {allHosts.map((host) => {
          const memUsedGB = (host.memory_used_bytes / (1024 * 1024 * 1024)).toFixed(1);
          const memTotalGB = (host.memory_total_bytes / (1024 * 1024 * 1024)).toFixed(1);
          const diskUsedGB = (host.disk_used_bytes / (1024 * 1024 * 1024)).toFixed(0);
          const diskTotalGB = (host.disk_total_bytes / (1024 * 1024 * 1024)).toFixed(0);

          return (
            <div key={host.id} className="card">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                    <Server size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{host.display_name}</h3>
                    <div className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {host.ip_address} · {host.os_name}
                    </div>
                  </div>
                </div>
                <StatusBadge status={host.status} />
              </div>

              {/* Resource Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                {/* CPU */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Cpu size={14} /> CPU Utilization ({host.cpu_cores} Cores)
                    </span>
                    <span className="mono" style={{ fontWeight: 600 }}>{host.cpu_usage_percent.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${host.cpu_usage_percent}%`, backgroundColor: 'var(--accent-primary)', height: '100%' }} />
                  </div>
                </div>

                {/* Memory */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <ShieldCheck size={14} /> Memory Pressure ({memUsedGB} / {memTotalGB} GB)
                    </span>
                    <span className="mono" style={{ fontWeight: 600 }}>{host.memory_usage_pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${host.memory_usage_pct}%`, backgroundColor: host.memory_usage_pct > 80 ? 'var(--status-warning)' : 'var(--accent-secondary)', height: '100%' }} />
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <HardDrive size={14} /> Primary Storage ({diskUsedGB} / {diskTotalGB} GB)
                    </span>
                    <span className="mono" style={{ fontWeight: 600 }}>{host.disk_usage_pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${host.disk_usage_pct}%`, backgroundColor: host.disk_usage_pct > 85 ? 'var(--status-critical)' : 'var(--status-online)', height: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Node Footer */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Workloads: {host.container_count} Containers</span>
                {host.temperature_deg_c && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Thermometer size={14} /> {host.temperature_deg_c}°C
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
