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
} from 'lucide-react';
import { NetworkClient, NetworkTelemetrySummary } from '../../types';
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
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  if (loading && !clients) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Discovering connected network clients & ARP table...</div>;
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Summary Cards */}
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
            Live ARP & Neighbor Table
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
            Primary Subnet Router
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Network Ingress (RX)
            </span>
            <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--status-online)' }}>
              <ArrowDownCircle size={16} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-online)' }}>
            {totalRxKbps > 1000 ? `${(totalRxKbps / 1000).toFixed(2)} MB/s` : `${totalRxKbps.toFixed(1)} KB/s`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Host Interface: <span className="mono">{telemetry?.primary_interface || 'eth0'}</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Network Egress (TX)
            </span>
            <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: '#38bdf8' }}>
              <ArrowUpCircle size={16} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8' }}>
            {totalTxKbps > 1000 ? `${(totalTxKbps / 1000).toFixed(2)} MB/s` : `${totalTxKbps.toFixed(1)} KB/s`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Outgoing Traffic Rate
          </div>
        </div>
      </div>

      {/* Grafana Live Bandwidth Panel */}
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

      {/* Connected Clients Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 16px' }}>Device / Hostname</th>
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
