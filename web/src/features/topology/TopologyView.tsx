import React, { useState } from 'react';
import { GitFork, Database, Server, Box, Layers, HardDrive, ShieldAlert } from 'lucide-react';
import { DependencyGraph, GraphNode } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface TopologyViewProps {
  graph: DependencyGraph | null;
  loading: boolean;
}

export const TopologyView: React.FC<TopologyViewProps> = ({ graph, loading }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  if (loading && !graph) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing dependency topologies...</div>;
  }

  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];

  // Categorize nodes
  const hostNodes = nodes.filter((n) => n.type === 'host');
  const dbNodes = nodes.filter((n) => n.type === 'database' || n.type === 'storage');
  const serviceNodes = nodes.filter((n) => n.type === 'service');

  // Compute blast radius for selected node
  const downstreamImpacts = selectedNode
    ? edges.filter((e) => e.target === selectedNode.id).map((e) => nodes.find((n) => n.id === e.source)).filter(Boolean)
    : [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitFork size={18} style={{ color: 'var(--accent-primary)' }} />
          Infrastructure Dependency Graph & Blast Radius
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Select any node (host, database, storage) to inspect dependencies and calculate cascade outage blast radius.
        </p>
      </div>

      {/* Selected Node Blast Radius Alert Banner */}
      {selectedNode && (
        <div
          className="card animate-fade-in"
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--accent-primary)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-primary-glow)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Target: {selectedNode.label} ({selectedNode.type})
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {downstreamImpacts.length > 0
                  ? `Failure of this component will cascade to ${downstreamImpacts.length} downstream services.`
                  : 'No critical downstream dependencies currently attached.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {downstreamImpacts.map((imp) => (
              <span
                key={imp?.id}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  backgroundColor: 'var(--status-critical-bg)',
                  color: 'var(--status-critical)',
                  border: '1px solid var(--status-critical-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {imp?.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Layered Topology Columns */}
      <div className="grid-3">
        {/* Layer 1: Hosts & Hypervisors */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title">
            <Server size={16} /> Physical Nodes & Hypervisors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hostNodes.map((h) => {
              const isSelected = selectedNode?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedNode(h)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{h.label}</span>
                    <StatusBadge status={h.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer 2: Databases & Shared Storage */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title">
            <Database size={16} /> Backbones, DBs & Storage
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dbNodes.map((db) => {
              const isSelected = selectedNode?.id === db.id;
              return (
                <div
                  key={db.id}
                  onClick={() => setSelectedNode(db)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {db.type === 'storage' ? <HardDrive size={14} /> : <Database size={14} />}
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{db.label}</span>
                    </div>
                    <StatusBadge status={db.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer 3: Web & User Applications */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title">
            <Layers size={16} /> User Services & Applications
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {serviceNodes.map((srv) => {
              const isSelected = selectedNode?.id === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedNode(srv)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Box size={14} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{srv.label}</span>
                    </div>
                    <StatusBadge status={srv.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
