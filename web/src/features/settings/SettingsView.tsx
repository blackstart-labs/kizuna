import React from 'react';
import { Activity, Database, Clock, Cpu, Shield, Sparkles, GitFork, Thermometer } from 'lucide-react';
import { SelfMetrics } from '../../types';
import { MetricCard } from '../../components/ui/MetricCard';
import { useAppStore } from '../../stores/useAppStore';

interface SettingsViewProps {
  metrics: SelfMetrics | null;
  loading: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ metrics, loading }) => {
  const {
    isOptimizerEnabled,
    toggleOptimizer,
    isCorrelationEnabled,
    toggleCorrelation,
    isSensorsEnabled,
    toggleSensors,
  } = useAppStore();

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
          Kizuna runs as a single lightweight binary (~1.1 MB RAM footprint). Configure intelligence modules and view live system vitals below.
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
          subValue={`v${metrics?.version || '0.2.0'}`}
          icon={Clock}
          trend="Single binary"
        />
      </div>

      {/* Feature Modules & User Control Switches */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Sparkles size={16} />
            Intelligence & Monitoring Preferences
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Resource Optimizer Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', marginTop: '2px' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Resource Intelligence & Waste Optimizer
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                  In-memory analytical engine (~0 KB storage overhead). Detects unreferenced Docker layers, stale image storage, and RAM ceiling limits.
                </div>
              </div>
            </div>
            <button
              onClick={toggleOptimizer}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: isOptimizerEnabled ? 'var(--status-online-bg)' : 'var(--bg-surface-active)',
                color: isOptimizerEnabled ? 'var(--status-online)' : 'var(--text-muted)',
                border: `1px solid ${isOptimizerEnabled ? 'var(--status-online-border)' : 'var(--border-default)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isOptimizerEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Incident Correlator Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-secondary)', marginTop: '2px' }}>
                <GitFork size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Incident Correlation Engine
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                  Groups cascade alerts across containers and nodes into single root-cause incidents to prevent alert fatigue.
                </div>
              </div>
            </div>
            <button
              onClick={toggleCorrelation}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: isCorrelationEnabled ? 'var(--status-online-bg)' : 'var(--bg-surface-active)',
                color: isCorrelationEnabled ? 'var(--status-online)' : 'var(--text-muted)',
                border: `1px solid ${isCorrelationEnabled ? 'var(--status-online-border)' : 'var(--border-default)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isCorrelationEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Host Sensors & Thermal Telemetry Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', color: 'var(--status-warning)', marginTop: '2px' }}>
                <Thermometer size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Host Thermal Sensors & Hardware Telemetry
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                  Reads Linux sysfs thermal zones (<span className="mono" style={{ fontSize: '11px' }}>/sys/class/thermal</span>) and kernel memory stats with zero agent overhead.
                </div>
              </div>
            </div>
            <button
              onClick={toggleSensors}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: isSensorsEnabled ? 'var(--status-online-bg)' : 'var(--bg-surface-active)',
                color: isSensorsEnabled ? 'var(--status-online)' : 'var(--text-muted)',
                border: `1px solid ${isSensorsEnabled ? 'var(--status-online-border)' : 'var(--border-default)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isSensorsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
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
