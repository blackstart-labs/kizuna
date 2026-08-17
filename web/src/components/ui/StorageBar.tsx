import React from 'react';
import { StorageSummary } from '../../types';

interface StorageBarProps {
  storage: StorageSummary;
}

export const StorageBar: React.FC<StorageBarProps> = ({ storage }) => {
  const usedGB = (storage.used_bytes / (1024 * 1024 * 1024)).toFixed(1);
  const totalGB = (storage.total_bytes / (1024 * 1024 * 1024)).toFixed(1);
  const recoverableGB = (storage.total_recoverable_bytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Storage Intelligence
          </span>
          <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>
            {usedGB} GB <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {totalGB} GB ({storage.usage_percentage.toFixed(1)}%)</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Potential Reclamation</span>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--status-online)' }}>
            ~{recoverableGB} GB Recoverable
          </div>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div
        style={{
          height: '10px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          display: 'flex',
          gap: '2px',
        }}
      >
        <div
          style={{
            width: `${Math.min(storage.usage_percentage, 100)}%`,
            backgroundColor: storage.usage_percentage > 85 ? 'var(--status-critical)' : 'var(--accent-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
          <span>Active Datasets</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-online)' }} />
          <span>Unreferenced Layers (~{(storage.unused_image_bytes / (1024 * 1024 * 1024)).toFixed(1)} GB)</span>
        </div>
      </div>
    </div>
  );
};
