import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  const { setCommandPaletteOpen, activeTab } = useAppStore();

  const tabTitles: Record<string, string> = {
    dashboard: 'Homelab Overview',
    services: 'Service Registry',
    hosts: 'Physical Hosts & Nodes',
    containers: 'Container Workloads',
    incidents: 'Correlated Incidents',
    optimizer: 'Resource Intelligence & Waste Optimizer',
    settings: 'Settings & Self-Monitoring',
  };

  return (
    <header className="top-header">
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {tabTitles[activeTab] || 'Control Plane'}
        </h1>
      </div>

      {/* Action Controls & Global Command Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '13px',
            minWidth: '220px',
            textAlign: 'left',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
        >
          <Search size={15} />
          <span style={{ flex: 1 }}>Search or jump to...</span>
          <kbd style={{ fontSize: '11px', padding: '2px 5px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '3px', color: 'var(--text-secondary)' }}>
            ⌘K
          </kbd>
        </button>

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh homelab state"
            style={{
              padding: '7px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </header>
  );
};
