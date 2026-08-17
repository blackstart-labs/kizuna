import React, { useState, useRef } from 'react';

export interface SeriesData {
  name: string;
  color: string;
  data: { timestamp: number; value: number }[];
  unit?: string;
}

interface GrafanaTimeSeriesPanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  series: SeriesData[];
  height?: number;
  unit?: string;
  badge?: React.ReactNode;
}

export const GrafanaTimeSeriesPanel: React.FC<GrafanaTimeSeriesPanelProps> = ({
  title,
  subtitle,
  icon: Icon,
  series,
  height = 180,
  unit = '',
  badge,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract all values to calculate Y-domain
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const rawMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const rawMax = allValues.length > 0 ? Math.max(...allValues) : 100;

  const yMin = Math.max(0, Math.floor(rawMin * 0.9));
  const yMax = Math.ceil(rawMax * 1.15) || 100;
  const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

  const viewBoxWidth = 600;
  const viewBoxHeight = height;
  const padding = { top: 15, right: 15, bottom: 25, left: 45 };

  const plotWidth = viewBoxWidth - padding.left - padding.right;
  const plotHeight = viewBoxHeight - padding.top - padding.bottom;

  const maxPoints = Math.max(...series.map((s) => s.data.length), 2);

  const getCoordinates = (index: number, value: number, totalPoints: number) => {
    const x = padding.left + (index / (totalPoints - 1 || 1)) * plotWidth;
    const y = padding.top + plotHeight - ((value - yMin) / yRange) * plotHeight;
    return { x, y };
  };

  // Generate SVG path strings
  const paths = series.map((s) => {
    if (!s.data || s.data.length < 2) return { line: '', area: '', color: s.color };

    const coords = s.data.map((d, i) => getCoordinates(i, d.value, s.data.length));
    const linePath = `M ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' L ')}`;
    const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)},${(padding.top + plotHeight).toFixed(1)} L ${coords[0].x.toFixed(1)},${(padding.top + plotHeight).toFixed(1)} Z`;

    return { line: linePath, area: areaPath, color: s.color, name: s.name, series: s };
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || maxPoints < 2) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (mouseX - padding.left * (rect.width / viewBoxWidth)) / (plotWidth * (rect.width / viewBoxWidth))));
    const index = Math.round(ratio * (maxPoints - 1));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Calculate statistics for the legend
  const stats = series.map((s) => {
    const vals = s.data.map((d) => d.value);
    const last = vals.length > 0 ? vals[vals.length - 1] : 0;
    const max = vals.length > 0 ? Math.max(...vals) : 0;
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { name: s.name, color: s.color, last, max, avg, unit: s.unit || unit };
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Panel Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && (
            <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', display: 'flex' }}>
              <Icon size={16} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {title}
            </div>
            {subtitle && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subtitle}</div>}
          </div>
        </div>
        {badge && <div>{badge}</div>}
      </div>

      {/* SVG Time Series Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative', width: '100%', cursor: 'crosshair', userSelect: 'none' }}
      >
        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          <defs>
            {series.map((s, idx) => (
              <linearGradient key={`grad-${idx}`} id={`grafana-grad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines & Y-Axis Labels */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = padding.top + plotHeight * pct;
            const val = yMax - pct * yRange;
            return (
              <g key={`grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="var(--text-muted)"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
                  {unit}
                </text>
              </g>
            );
          })}

          {/* Area Fills & Lines */}
          {paths.map((p, idx) => (
            <g key={`series-${idx}`}>
              <path d={p.area} fill={`url(#grafana-grad-${idx})`} />
              <path d={p.line} fill="none" stroke={p.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={padding.left + (hoverIndex / (maxPoints - 1 || 1)) * plotWidth}
                y1={padding.top}
                x2={padding.left + (hoverIndex / (maxPoints - 1 || 1)) * plotWidth}
                y2={padding.top + plotHeight}
                stroke="var(--text-secondary)"
                strokeDasharray="2 2"
                strokeWidth="1.2"
              />
              {series.map((s, idx) => {
                if (hoverIndex >= s.data.length) return null;
                const pt = s.data[hoverIndex];
                const coord = getCoordinates(hoverIndex, pt.value, s.data.length);
                return (
                  <g key={`hover-pt-${idx}`}>
                    <circle cx={coord.x} cy={coord.y} r="4" fill={s.color} stroke="var(--bg-surface)" strokeWidth="2" />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Grafana-Style Legend & Min/Max/Avg Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px' }}>
        {stats.map((st, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: st.color }} />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{st.name}</span>
            <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {st.last.toFixed(1)} {st.unit}
            </span>
            <span className="mono" style={{ color: 'var(--text-muted)' }}>
              (avg: {st.avg.toFixed(1)} / max: {st.max.toFixed(1)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
