import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Recommendation } from '../../types';
import { useAppStore } from '../../stores/useAppStore';

interface AttentionBannerProps {
  items: Recommendation[];
}

export const AttentionBanner: React.FC<AttentionBannerProps> = ({ items }) => {
  const { setActiveTab } = useAppStore();

  if (!items || items.length === 0) return null;

  const topItem = items[0];

  return (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: 'var(--status-warning-bg)',
        border: '1px solid var(--status-warning-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            padding: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>ATTENTION REQUIRED:</span>
            <span>{topItem.title}</span>
            {items.length > 1 && (
              <span style={{ fontSize: '11px', backgroundColor: 'var(--bg-surface)', padding: '2px 6px', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}>
                +{items.length - 1} more
              </span>
            )}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {topItem.why_it_matters}
          </div>
        </div>
      </div>

      <button
        onClick={() => setActiveTab('optimizer')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
      >
        <span>View Recommendations</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
