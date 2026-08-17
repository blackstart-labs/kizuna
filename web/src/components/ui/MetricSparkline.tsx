import React from 'react';
import { MetricPoint } from '../../types';

interface MetricSparklineProps {
  points: MetricPoint[];
  color?: string;
  height?: number;
  width?: number | string;
  fill?: boolean;
}

export const MetricSparkline: React.FC<MetricSparklineProps> = ({
  points,
  color = 'var(--accent-primary)',
  height = 40,
  fill = true,
}) => {
  if (!points || points.length < 2) {
    return <div style={{ height, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }} />;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const width = 200;
  const paddingY = 4;
  const availableHeight = height - paddingY * 2;

  const coordinates = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - paddingY - ((p.value - min) / range) * availableHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${coordinates.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height, overflow: 'visible', display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaD} fill={`url(#grad-${color})`} />}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
