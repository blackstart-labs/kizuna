export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
  tags: string[];
  host_id?: string;
  host_name?: string;
  status: 'online' | 'degraded' | 'offline' | 'unknown';
  uptime_percentage: number;
  latency_ms: number;
  version?: string;
  health_endpoint?: string;
  is_favorite: boolean;
  dependencies?: string[];
  created_at: string;
  updated_at: string;
}

export interface Host {
  id: string;
  hostname: string;
  display_name: string;
  os_name: string;
  kernel_version: string;
  ip_address: string;
  status: 'online' | 'warning' | 'offline';
  cpu_cores: number;
  cpu_usage_percent: number;
  memory_total_bytes: number;
  memory_used_bytes: number;
  memory_usage_pct: number;
  disk_total_bytes: number;
  disk_used_bytes: number;
  disk_usage_pct: number;
  uptime_seconds: number;
  container_count: number;
  temperature_deg_c?: number;
  updated_at: string;
}

export interface Container {
  id: string;
  host_id: string;
  host_name: string;
  container_id: string;
  name: string;
  image: string;
  image_size_bytes: number;
  status: string;
  state: 'running' | 'paused' | 'exited' | 'restarting';
  restart_count: number;
  cpu_percent: number;
  memory_usage_bytes: number;
  memory_limit_bytes: number;
  memory_usage_pct: number;
  ports: string[];
  is_waste_candidate: boolean;
  waste_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  title: string;
  summary: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'mitigated' | 'resolved';
  root_cause_type?: string;
  root_cause_id?: string;
  impacted_services: string[];
  started_at: string;
  resolved_at?: string;
}

export interface Recommendation {
  id: string;
  category: 'storage' | 'performance' | 'reliability' | 'security';
  severity: 'critical' | 'warning' | 'tip';
  title: string;
  why_it_matters: string;
  action_suggestion: string;
  resource_type?: string;
  resource_id?: string;
  potential_savings_bytes?: number;
  estimated_savings?: string;
  is_auto_fixable?: boolean;
  auto_fix_action?: string;
  is_dismissed: boolean;
  created_at: string;
}

export interface StorageSummary {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  usage_percentage: number;
  unused_image_bytes: number;
  unused_volume_bytes: number;
  old_log_bytes: number;
  total_recoverable_bytes: number;
}

export interface SelfMetrics {
  version: string;
  uptime_seconds: number;
  memory_alloc_bytes: number;
  memory_alloc_mb: number;
  goroutines_count: number;
  db_size_bytes: number;
  avg_latency_ms: number;
}

export interface HomelabHealthSummary {
  global_status: 'healthy' | 'degraded' | 'critical';
  online_services: number;
  total_services: number;
  online_hosts: number;
  total_hosts: number;
  running_containers: number;
  total_containers: number;
  active_incidents: number;
  firing_alerts: number;
  pending_recommendations: number;
  attention_items: Recommendation[];
  storage: StorageSummary;
  kizuna_self_metrics: SelfMetrics;
}

export interface SearchResult {
  id: string;
  type: 'service' | 'host' | 'container' | 'incident';
  title: string;
  subtitle: string;
  url?: string;
  status?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'service' | 'database' | 'host' | 'storage';
  status: 'online' | 'warning' | 'critical' | 'degraded' | 'offline';
  category?: string;
  host_name?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  impact: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Alert {
  id: string;
  source: 'kizuna' | 'uptimekuma' | 'prometheus' | 'proxmox' | 'docker';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  state: 'firing' | 'acknowledged' | 'resolved';
  target_type: 'service' | 'host' | 'container';
  target_id: string;
  started_at: string;
  resolved_at?: string;
}

export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface MetricSeries {
  metric_name: string;
  unit: string;
  current: number;
  points: MetricPoint[];
}

export interface HomelabTrends {
  cpu_trend: MetricSeries;
  memory_trend: MetricSeries;
  storage_trend: MetricSeries;
  latency_trend: MetricSeries;
}
