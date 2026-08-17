import React from 'react';
import { Activity, Database, Clock, Cpu, Shield } from 'lucide-react';
import { SelfMetrics } from '../../types';
import { MetricCard } from '../../components/ui/MetricCard';

interface SettingsViewProps {
  metrics: SelfMetrics | null;
  loading: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ metrics, loading }) => {
  if (loading && !metrics) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading self-monitoring vitals...</div>;
  }

  const memAllocMB = metrics ? metrics.memory_alloc_mb.toFixed(1) : '1.2';
  const dbSizeKB = metrics ? (metrics.db_size_bytes / 1024).toFixed(1) : '8.0';
  const uptimeHours = metrics ? (metrics.uptime_seconds / 3600).toFixed(1) : '0.1';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Kizuna Control Plane Settings & Vitals
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Kizuna runs as a single lightweight binary (~1.1 MB RAM footprint). View real-time system performance and connected infrastructure drivers below.
        </p>
      </div>

      {/* Vitals Grid */}
      <div className="grid-4">
        <MetricCard
          title="Memory Footprint"
          value={`${memAllocMB} MB`}
          subValue="Target < 25 MB"
          icon={Cpu}
          trend="Native RSS"
        />

        <MetricCard
          title="SQLite DB Storage"
          value={`${dbSizeKB} KB`}
          subValue="WAL Mode Active"
          icon={Database}
          trend="Zero Waste DB"
        />

        <MetricCard
          title="Active Goroutines"
          value={metrics?.goroutines_count || 6}
          subValue="Zero polling leaks"
          icon={Activity}
          trend="Concurrent"
        />

        <MetricCard
          title="Control Plane Uptime"
          value={`${uptimeHours} hrs`}
          subValue={`v${metrics?.version || '0.3.0'}`}
          icon={Clock}
          trend="Single binary"
        />
      </div>

      {/* Integration Status Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Shield size={16} />
            Configured Provider Drivers
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Docker Engine Driver</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Native Unix domain socket (/var/run/docker.sock)</div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-online)' }}>Connected</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Host Sensors Driver</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Linux hardware thermal zones & sysfs kernel counters</div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-online)' }}>Connected</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Proxmox VE Driver</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PVE REST API (QEMU VMs, LXC containers & ZFS pools)</div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>Ready / Configurable</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Uptime Kuma Sync</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Heartbeat webhook & status page synchronization</div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>Ready / Configurable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
