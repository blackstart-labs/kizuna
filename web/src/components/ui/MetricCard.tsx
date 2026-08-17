import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: string;
  status?: 'normal' | 'warning' | 'critical' | 'good';
  badge?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  badge,
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
          <Icon size={18} />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {value}
        </span>
        {subValue && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {subValue}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
        {trend && <span style={{ color: 'var(--text-secondary)' }}>{trend}</span>}
        {badge && <div>{badge}</div>}
      </div>
    </div>
  );
};
