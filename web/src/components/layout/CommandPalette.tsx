import React, { useState, useEffect, useRef } from 'react';
import { Search, Layers, Server, Box, GitFork, AlertOctagon, ExternalLink, X, Wifi } from 'lucide-react';
import { useAppStore, ActiveTab } from '../../stores/useAppStore';
import { SearchResult } from '../../types';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveTab } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  // Fetch search results on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/v1/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setResults(data || []))
      .catch(() => {});

    return () => controller.abort();
  }, [query]);

  // Quick navigation shortcuts
  const defaultActions: { id: string; label: string; tab: ActiveTab; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'act-dash', label: 'Go to Homelab Dashboard', tab: 'dashboard', icon: Layers },
    { id: 'act-srv', label: 'Browse All Services', tab: 'services', icon: Layers },
    { id: 'act-hst', label: 'View Physical Hosts & Hypervisors', tab: 'hosts', icon: Server },
    { id: 'act-cnt', label: 'Inspect Container Workloads', tab: 'containers', icon: Box },
    { id: 'act-net', label: 'Inspect Connected Network Clients & Devices', tab: 'network', icon: Wifi },
    { id: 'act-top', label: 'Inspect Infrastructure Dependency Graph', tab: 'topology', icon: GitFork },
    { id: 'act-inc', label: 'Review Active Incidents', tab: 'incidents', icon: AlertOctagon },
  ];

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
      }}
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '560px',
          maxWidth: '92vw',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          padding: 0,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '10px',
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search services, hosts, containers..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            style={{ color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results / Suggestions Container */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {query.trim() === '' ? (
            <div>
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Navigation Shortcuts
              </div>
              {defaultActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    onClick={() => {
                      setActiveTab(action.tab);
                      setCommandPaletteOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icon size={16} />
                    <span>{action.label}</span>
                  </div>
                );
              })}
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No infrastructure items found matching "{query}"
            </div>
          ) : (
            <div>
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Matching Results ({results.length})
              </div>
              {results.map((res, idx) => (
                <div
                  key={res.id}
                  onClick={() => {
                    if (res.type === 'service' && res.url) {
                      window.open(res.url, '_blank');
                    } else if (res.type === 'host') {
                      setActiveTab('hosts');
                    } else if (res.type === 'container') {
                      setActiveTab('containers');
                    }
                    setCommandPaletteOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: selectedIndex === idx ? 'var(--bg-surface-hover)' : 'transparent',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '4px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
                      {res.type === 'service' ? <Layers size={14} /> : res.type === 'host' ? <Server size={14} /> : <Box size={14} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{res.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{res.subtitle}</div>
                    </div>
                  </div>
                  {res.url && <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Navigate with arrows, select with Enter</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
