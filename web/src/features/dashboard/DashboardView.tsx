import React from 'react';
import { Layers, Server, Box, AlertTriangle, Cpu, HardDrive } from 'lucide-react';
import { HomelabHealthSummary } from '../../types';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AttentionBanner } from '../../components/ui/AttentionBanner';
import { StorageBar } from '../../components/ui/StorageBar';
import { useAppStore } from '../../stores/useAppStore';

interface DashboardViewProps {
  summary: HomelabHealthSummary | null;
  loading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ summary, loading }) => {
  const { setActiveTab } = useAppStore();

  if (loading && !summary) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent-primary)', marginBottom: '12px' }} />
        <div>Connecting to Kizuna Control Plane...</div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Dynamic Attention Required Banner */}
      <AttentionBanner items={summary.attention_items} />

      {/* Top Vital Metric Cards */}
      <div className="grid-4">
        <MetricCard
          title="Online Services"
          value={`${summary.online_services} / ${summary.total_services}`}
          subValue={`${((summary.online_services / (summary.total_services || 1)) * 100).toFixed(0)}% available`}
          icon={Layers}
          badge={<StatusBadge status={summary.online_services === summary.total_services ? 'online' : 'warning'} label={summary.global_status} />}
        />

        <MetricCard
          title="Physical Hosts & Nodes"
          value={`${summary.online_hosts} / ${summary.total_hosts}`}
          subValue="Hypervisors active"
          icon={Server}
          badge={<StatusBadge status={summary.online_hosts === summary.total_hosts ? 'online' : 'warning'} label={`${summary.online_hosts} Active`} />}
        />

        <MetricCard
          title="Container Workloads"
          value={`${summary.running_containers} / ${summary.total_containers}`}
          subValue={`${summary.total_containers - summary.running_containers} stopped/idle`}
          icon={Box}
          badge={<span className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Docker & LXC</span>}
        />

        <MetricCard
          title="Active Incidents"
          value={summary.active_incidents}
          subValue={summary.active_incidents === 0 ? 'All systems normal' : 'Requires attention'}
          icon={AlertTriangle}
          badge={<StatusBadge status={summary.active_incidents === 0 ? 'online' : 'critical'} label={summary.active_incidents === 0 ? 'Clear' : 'Firing'} />}
        />
      </div>

      {/* Storage Intelligence Breakdown */}
      <StorageBar storage={summary.storage} />

      {/* Quick Navigation Cards */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Cpu size={16} />
              Host Fleet Overview
            </span>
            <button
              onClick={() => setActiveTab('hosts')}
              style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}
            >
              View All Hosts →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>titan-primary (192.168.1.75)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ubuntu 24.04 LTS · 11 Containers</div>
              </div>
              <StatusBadge status="online" label="43% RAM" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>atlas-proxmox (192.168.1.100)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Proxmox VE 8.2 · ZFS 91% Full</div>
              </div>
              <StatusBadge status="warning" label="High Storage" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <HardDrive size={16} />
              Optimizer Quick Wins
            </span>
            <button
              onClick={() => setActiveTab('optimizer')}
              style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}
            >
              Open Optimizer →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Prune 3 Unused Stale Docker Images</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Recover up to 8.4 GB NVMe SSD storage</div>
              </div>
              <span className="mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-online)' }}>+8.4 GB</span>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Raise immich-ml-worker Memory Limit</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Prevent OOM restart crash loops</div>
              </div>
              <StatusBadge status="critical" label="Crash Loop" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
