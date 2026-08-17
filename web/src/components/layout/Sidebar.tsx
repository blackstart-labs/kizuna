import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Server,
  Box,
  GitFork,
  AlertOctagon,
  Sparkles,
  Settings,
  Flame,
} from 'lucide-react';
import { useAppStore, ActiveTab } from '../../stores/useAppStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'hosts', label: 'Hosts & Nodes', icon: Server },
    { id: 'containers', label: 'Containers', icon: Box },
    { id: 'topology', label: 'Topology', icon: GitFork },
    { id: 'incidents', label: 'Incidents', icon: AlertOctagon },
    { id: 'optimizer', label: 'Optimizer', icon: Sparkles },
    { id: 'settings', label: 'Settings & Vitals', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--border-subtle)', gap: '10px' }}>
        <div style={{ padding: '6px', backgroundColor: 'var(--accent-primary-glow)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={20} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            Kizuna <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-secondary)' }}>絆</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Homelab Control Plane</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Vitals Info */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Kizuna Core</span>
          <span className="mono">v0.1.0-alpha</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span className="pulse-dot" style={{ backgroundColor: 'var(--status-online)', width: '6px', height: '6px' }} />
          <span>Control plane active</span>
        </div>
      </div>
    </aside>
  );
};
