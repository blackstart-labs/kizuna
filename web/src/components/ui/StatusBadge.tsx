import React from 'react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: 'online' | 'warning' | 'critical' | 'degraded' | 'offline' | 'info' | 'unknown' | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const normalized = status.toLowerCase();
  
  let badgeClass = 'badge-info';
  let dotColor = 'var(--status-info)';

  if (normalized === 'online' || normalized === 'healthy' || normalized === 'running' || normalized === 'resolved') {
    badgeClass = 'badge-online';
    dotColor = 'var(--status-online)';
  } else if (normalized === 'warning' || normalized === 'degraded' || normalized === 'restarting' || normalized === 'paused') {
    badgeClass = 'badge-warning';
    dotColor = 'var(--status-warning)';
  } else if (normalized === 'critical' || normalized === 'offline' || normalized === 'exited' || normalized === 'active') {
    badgeClass = 'badge-critical';
    dotColor = 'var(--status-critical)';
  }

  return (
    <span className={clsx('badge', badgeClass, size === 'md' && 'px-3 py-1.5 text-sm')} role="status">
      <span className="pulse-dot" style={{ backgroundColor: dotColor }} aria-hidden="true" />
      <span style={{ textTransform: 'capitalize' }}>{label || status}</span>
    </span>
  );
};
