import React, { useState } from 'react';
import {
  Wifi,
  Search,
  Server,
  Smartphone,
  Cpu,
  Router as RouterIcon,
  Monitor,
  Box,
  HelpCircle,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Gauge,
  Zap,
  Play,
  RotateCw,
  Clock,
  Globe,
  Database,
} from 'lucide-react';
import { NetworkClient, NetworkTelemetrySummary, SpeedTestResult } from '../../types';
import { GrafanaTimeSeriesPanel } from '../../components/charts/GrafanaTimeSeriesPanel';

interface NetworkClientsViewProps {
  clients: NetworkClient[] | null;
  telemetry: NetworkTelemetrySummary | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const NetworkClientsView: React.FC<NetworkClientsViewProps> = ({
  clients,
  telemetry,
  loading,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [activeSpeedResult, setActiveSpeedResult] = useState<SpeedTestResult | null>(
    telemetry?.latest_speed_test || null
  );

  const runSpeedTest = async () => {
    setSpeedTestRunning(true);
    try {
      const res = await fetch('/api/v1/network/speedtest/run', { method: 'POST' });
      if (res.ok) {
        const data: SpeedTestResult = await res.json();
        setActiveSpeedResult(data);
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error('Speed test failed:', e);
    } finally {
      setSpeedTestRunning(false);
    }
  };

  if (loading && !clients) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent-primary)', marginBottom: '12px' }} />
        <div>Discovering connected network clients & kernel telemetry...</div>
      </div>
    );
  }

  const clientList = clients || [];
  const types = ['all', 'router', 'server', 'container', 'workstation', 'phone', 'iot'];

  const filteredClients = clientList.filter((c) => {
    const matchesType = selectedType === 'all' || c.device_type === selectedType;
    const query = search.toLowerCase();
    const matchesSearch =
      c.ip.toLowerCase().includes(query) ||
      c.mac.toLowerCase().includes(query) ||
      c.hostname.toLowerCase().includes(query) ||
      c.vendor.toLowerCase().includes(query) ||
      c.interface.toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'router':
        return <RouterIcon size={16} />;
      case 'server':
      case 'host':
        return <Server size={16} />;
      case 'container':
        return <Box size={16} />;
      case 'phone':
        return <Smartphone size={16} />;
      case 'iot':
        return <Cpu size={16} />;
      case 'workstation':
        return <Monitor size={16} />;
      default:
        return <HelpCircle size={16} />;
    }
  };

  const getDeviceBadgeColor = (type: string) => {
    switch (type) {
      case 'router':
        return 'var(--status-critical)';
      case 'server':
        return 'var(--accent-primary)';
      case 'container':
        return '#38bdf8';
      case 'phone':
        return '#ec4899';
      case 'iot':
        return '#eab308';
      default:
        return 'var(--text-secondary)';
    }
  };

  // Convert bandwidth history to Grafana series format
  const throughputHistory = telemetry?.bandwidth_history || [];
  const rxSeries = throughputHistory.map((p, idx) => ({
    timestamp: new Date(p.timestamp).getTime() || idx,
    value: p.rx_kbps,
  }));
  const txSeries = throughputHistory.map((p, idx) => ({
    timestamp: new Date(p.timestamp).getTime() || idx,
    value: p.tx_kbps,
  }));

  const totalRxKbps = telemetry?.total_rx_rate_kbps || 0;
  const totalTxKbps = telemetry?.total_tx_rate_kbps || 0;
  const totalDownloadGB = telemetry?.total_download_gb || 0;
  const totalUploadGB = telemetry?.total_upload_gb || 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top 4 Vitals Bar: Connected, Gateway, Live Throughput */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Connected Devices
            </span>
            <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Wifi size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {clientList.length} Clients
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            LAN Subnet & Containers
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Default Gateway
            </span>
            <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--status-critical)' }}>
              <RouterIcon size={16} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {telemetry?.gateway_ip || '192.168.1.1'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Primary Router Gateway
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Transferred (RX/TX)
            </span>
            <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--status-warning)' }}>
              <Database size={16} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(totalDownloadGB + totalUploadGB).toFixed(2)} GB
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ↓ {totalDownloadGB.toFixed(1)} GB &nbsp;•&nbsp; ↑ {totalUploadGB.toFixed(1)} GB
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Live Speed (RX / TX)
            </span>
            <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--status-online)' }}>
              <Zap size={16} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--status-online)' }}>
            ↓ {totalRxKbps > 1000 ? `${(totalRxKbps / 1000).toFixed(1)} MB/s` : `${totalRxKbps.toFixed(0)} KB/s`}
            <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>•</span>
            <span style={{ color: '#38bdf8' }}>↑ {totalTxKbps > 1000 ? `${(totalTxKbps / 1000).toFixed(1)} MB/s` : `${totalTxKbps.toFixed(0)} KB/s`}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Active NIC: <span className="mono">{telemetry?.primary_interface || 'enp4s0'}</span>
          </div>
        </div>
      </div>

      {/* Internet Speed Checker Section */}
      <div className="card" style={{ border: '1px solid var(--border-default)', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: 'var(--accent-primary-glow)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
              <Gauge size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Internet Speed Benchmark & Latency Analyzer
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Measure real broadband download, upload, ping, and jitter via low-latency CDN edge
              </div>
            </div>
          </div>

          <button
            onClick={runSpeedTest}
            disabled={speedTestRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: speedTestRunning ? 'var(--bg-surface-hover)' : 'var(--accent-primary)',
              color: speedTestRunning ? 'var(--text-muted)' : 'var(--text-inverse)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              border: 'none',
              cursor: speedTestRunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {speedTestRunning ? (
              <>
                <RotateCw size={14} className="spin" />
                Testing Speed...
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                Run Speed Test
              </>
            )}
          </button>
        </div>

        {/* Speedometer Metrics Grid */}
        <div className="grid-4">
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-online)', marginBottom: '8px' }}>
              <ArrowDownCircle size={18} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Download Speed</span>
            </div>
            <div className="mono" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {activeSpeedResult ? activeSpeedResult.download_mbps.toFixed(1) : '--'}
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>Mbps</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {activeSpeedResult ? 'Direct HTTP stream throughput' : 'Ready to benchmark'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
              <ArrowUpCircle size={18} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Upload Speed</span>
            </div>
            <div className="mono" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {activeSpeedResult ? activeSpeedResult.upload_mbps.toFixed(1) : '--'}
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>Mbps</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {activeSpeedResult ? 'Upstream POST bandwidth' : 'Ready to benchmark'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', marginBottom: '8px' }}>
              <Clock size={18} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Ping Latency</span>
            </div>
            <div className="mono" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {activeSpeedResult ? activeSpeedResult.ping_ms.toFixed(0) : '--'}
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>ms</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Jitter: <span className="mono">{activeSpeedResult ? `${activeSpeedResult.jitter_ms.toFixed(1)} ms` : '--'}</span>
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Globe size={18} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Target Edge</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeSpeedResult ? activeSpeedResult.server_location : 'Cloudflare Edge'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Provider: <span style={{ fontWeight: 600 }}>{activeSpeedResult?.isp || 'Broadband'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grafana-Style Live Bandwidth Panel */}
      <GrafanaTimeSeriesPanel
        title="Fleet Real-Time Network Bandwidth (Ingress vs Egress)"
        subtitle="Aggregated interface transfer throughput rates across host physical NICs and virtual bridge adapters"
        icon={Activity}
        height={170}
        unit="KB/s"
        series={[
          { name: 'Download / Ingress (RX)', color: 'var(--status-online)', data: rxSeries, unit: 'KB/s' },
          { name: 'Upload / Egress (TX)', color: '#38bdf8', data: txSeries, unit: 'KB/s' },
        ]}
      />

      {/* Controls & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: selectedType === type ? 600 : 500,
                backgroundColor: selectedType === type ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                color: selectedType === type ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '6px 12px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by IP, MAC, hostname, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '240px' }}
          />
        </div>
      </div>

      {/* Discovered Connected Clients Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 16px' }}>Device Name / Hostname</th>
              <th style={{ padding: '12px 16px' }}>IP Address</th>
              <th style={{ padding: '12px 16px' }}>MAC Address</th>
              <th style={{ padding: '12px 16px' }}>Hardware Manufacturer</th>
              <th style={{ padding: '12px 16px' }}>Interface</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => {
              const badgeColor = getDeviceBadgeColor(client.device_type);
              return (
                <tr
                  key={client.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: badgeColor }}>
                        {getDeviceIcon(client.device_type)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {client.hostname}
                        </div>
                        {client.is_gateway && (
                          <span style={{ fontSize: '10px', color: 'var(--status-critical)', fontWeight: 700, textTransform: 'uppercase' }}>
                            Default Gateway
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {client.ip}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {client.mac}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {client.vendor}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'var(--bg-surface-elevated)' }}>
                      {client.interface}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        color: badgeColor,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {client.device_type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--status-online)' }}>
                      <span className="pulse-dot" style={{ backgroundColor: 'var(--status-online)', width: '6px', height: '6px' }} />
                      Active
                    </span>
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
