import React, { useState } from 'react';
import { Layers, Server, Box, AlertTriangle, Cpu, HardDrive, BellRing, CheckCircle2 } from 'lucide-react';
import { HomelabHealthSummary, Alert, HomelabTrends } from '../../types';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AttentionBanner } from '../../components/ui/AttentionBanner';
import { StorageBar } from '../../components/ui/StorageBar';
import { GrafanaTimeSeriesPanel } from '../../components/charts/GrafanaTimeSeriesPanel';
import { useAppStore } from '../../stores/useAppStore';
import { useFetchData } from '../../hooks/useFetchData';

interface DashboardViewProps {
  summary: HomelabHealthSummary | null;
  loading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ summary, loading }) => {
  const { setActiveTab } = useAppStore();
  const { data: alerts, refetch: refetchAlerts } = useFetchData<Alert[]>('/api/v1/alerts', 10000);
  const { data: trends } = useFetchData<HomelabTrends>('/api/v1/metrics/trends', 30000);
  const [actingAlertId, setActingAlertId] = useState<string | null>(null);

  if (loading && !summary) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent-primary)', marginBottom: '12px' }} />
        <div>Connecting to Kizuna Control Plane...</div>
      </div>
    );
  }

  if (!summary) return null;

  const handleAlertAction = async (id: string, action: 'ack' | 'resolve') => {
    setActingAlertId(id);
    try {
      await fetch(`/api/v1/alerts/${id}/${action}`, { method: 'POST' });
      refetchAlerts();
    } finally {
      setActingAlertId(null);
    }
  };

  const firingAlerts = (alerts || []).filter((a) => a.state === 'firing');

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
          title="Active Alerts"
          value={firingAlerts.length}
          subValue={firingAlerts.length === 0 ? 'All systems nominal' : `${firingAlerts.length} firing`}
          icon={AlertTriangle}
          badge={<StatusBadge status={firingAlerts.length === 0 ? 'online' : 'critical'} label={firingAlerts.length === 0 ? 'Clear' : 'Firing'} />}
        />
      </div>

      {/* Grafana-Style Live Infrastructure Telemetry Panels */}
      {trends && (
        <div className="grid-2">
          <GrafanaTimeSeriesPanel
            title="Fleet Compute Load & Memory Pressure"
            subtitle="Real-time multi-core CPU utilization and RAM allocation curves"
            icon={Cpu}
            height={160}
            unit="%"
            series={[
              {
                name: 'Fleet CPU Load',
                color: 'var(--accent-primary)',
                data: trends.cpu_trend.points.map((p) => ({ timestamp: p.timestamp, value: p.value })),
                unit: '%',
              },
              {
                name: 'Fleet Memory Pressure',
                color: '#38bdf8',
                data: trends.memory_trend.points.map((p) => ({ timestamp: p.timestamp, value: p.value })),
                unit: '%',
              },
            ]}
          />

          <GrafanaTimeSeriesPanel
            title="Storage Occupancy & Latency Trends"
            subtitle="ZFS storage pool capacity and service reverse proxy latency"
            icon={HardDrive}
            height={160}
            unit="%"
            series={[
              {
                name: 'Storage Pool Allocation',
                color: 'var(--status-warning)',
                data: trends.storage_trend.points.map((p) => ({ timestamp: p.timestamp, value: p.value })),
                unit: '%',
              },
              {
                name: 'Response Latency',
                color: 'var(--status-online)',
                data: trends.latency_trend.points.map((p) => ({ timestamp: p.timestamp, value: p.value })),
                unit: 'ms',
              },
            ]}
          />
        </div>
      )}

      {/* Storage Intelligence Breakdown */}
      <StorageBar storage={summary.storage} />

      {/* Active Unified Alert Stream */}
      {firingAlerts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <BellRing size={16} style={{ color: 'var(--status-critical)' }} />
              Active Firing Alerts ({firingAlerts.length})
            </span>
            <button onClick={() => setActiveTab('incidents')} style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              View All Incidents →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {firingAlerts.map((alt) => (
              <div
                key={alt.id}
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusBadge status={alt.severity} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{alt.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Source: <span className="mono">{alt.source}</span> · {alt.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleAlertAction(alt.id, 'ack')}
                    disabled={actingAlertId === alt.id}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-active)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    Ack
                  </button>
                  <button
                    onClick={() => handleAlertAction(alt.id, 'resolve')}
                    disabled={actingAlertId === alt.id}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--status-online-bg)',
                      color: 'var(--status-online)',
                      border: '1px solid var(--status-online-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={12} />
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Enable WAL Mode on PostgreSQL</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Improve write throughput and query latency</div>
              </div>
              <StatusBadge status="info" label="Database Tip" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
