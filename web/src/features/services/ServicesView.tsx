import React, { useState } from 'react';
import { ExternalLink, Search, Star } from 'lucide-react';
import { Service } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface ServicesViewProps {
  services: Service[] | null;
  loading: boolean;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ services, loading }) => {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (loading && !services) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading services...</div>;
  }

  const allServices = services || [];
  const categories = ['All', ...Array.from(new Set(allServices.map((s) => s.category)))];

  const filtered = allServices.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesQuery = s.name.toLowerCase().includes(filter.toLowerCase()) ||
                         s.description.toLowerCase().includes(filter.toLowerCase()) ||
                         s.tags.some((t) => t.toLowerCase().includes(filter.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: selectedCategory === cat ? 600 : 500,
                backgroundColor: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                color: selectedCategory === cat ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '6px 12px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filter services..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid-3">
        {filtered.map((srv) => (
          <div key={srv.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                    <Star size={16} fill={srv.is_favorite ? 'var(--accent-primary)' : 'none'} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{srv.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{srv.category}</span>
                  </div>
                </div>
                <StatusBadge status={srv.status} />
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                {srv.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {srv.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {srv.latency_ms}ms · {srv.uptime_percentage}% up
              </div>
              <a
                href={srv.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                }}
              >
                <span>Open</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
