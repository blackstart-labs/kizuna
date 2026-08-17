package domain

import (
	"time"
)

// Service represents an aggregated service in the homelab catalog.
type Service struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Description      string    `json:"description"`
	URL              string    `json:"url"`
	Icon             string    `json:"icon"`
	Category         string    `json:"category"`
	Tags             []string  `json:"tags"`
	HostID           string    `json:"host_id,omitempty"`
	HostName         string    `json:"host_name,omitempty"`
	Status           string    `json:"status"` // "online", "degraded", "offline", "unknown"
	UptimePercentage float64   `json:"uptime_percentage"`
	LatencyMs        int64     `json:"latency_ms"`
	Version          string    `json:"version,omitempty"`
	HealthEndpoint   string    `json:"health_endpoint,omitempty"`
	IntegrationID    string    `json:"integration_id,omitempty"`
	IsFavorite       bool      `json:"is_favorite"`
	Dependencies     []string  `json:"dependencies,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// Host represents a physical server, node, or virtualization hypervisor.
type Host struct {
	ID                string    `json:"id"`
	Hostname          string    `json:"hostname"`
	DisplayName       string    `json:"display_name"`
	OSName            string    `json:"os_name"`
	KernelVersion     string    `json:"kernel_version"`
	IPAddress         string    `json:"ip_address"`
	Status            string    `json:"status"` // "online", "warning", "offline"
	CPUCores          int       `json:"cpu_cores"`
	CPUUsagePercent   float64   `json:"cpu_usage_percent"`
	MemoryTotalBytes  int64     `json:"memory_total_bytes"`
	MemoryUsedBytes   int64     `json:"memory_used_bytes"`
	MemoryUsagePct    float64   `json:"memory_usage_pct"`
	DiskTotalBytes    int64     `json:"disk_total_bytes"`
	DiskUsedBytes     int64     `json:"disk_used_bytes"`
	DiskUsagePct      float64   `json:"disk_usage_pct"`
	UptimeSeconds     int64     `json:"uptime_seconds"`
	ContainerCount    int       `json:"container_count"`
	IntegrationID     string    `json:"integration_id,omitempty"`
	TemperatureDegC   float64   `json:"temperature_deg_c,omitempty"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// Container represents a running or stopped Docker / LXC container.
type Container struct {
	ID               string    `json:"id"`
	HostID           string    `json:"host_id"`
	HostName         string    `json:"host_name"`
	ContainerID      string    `json:"container_id"`
	Name             string    `json:"name"`
	Image            string    `json:"image"`
	ImageSizeBytes   int64     `json:"image_size_bytes"`
	Status           string    `json:"status"` // "running", "paused", "exited", "restarting"
	State            string    `json:"state"`
	RestartCount     int       `json:"restart_count"`
	CPUPercent       float64   `json:"cpu_percent"`
	MemoryUsageBytes int64     `json:"memory_usage_bytes"`
	MemoryLimitBytes int64     `json:"memory_limit_bytes"`
	MemoryUsagePct   float64   `json:"memory_usage_pct"`
	Ports            []string  `json:"ports"`
	IsWasteCandidate bool      `json:"is_waste_candidate"`
	WasteReason      string    `json:"waste_reason,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// Incident represents a correlated multi-service or infrastructure event.
type Incident struct {
	ID               string    `json:"id"`
	Title            string    `json:"title"`
	Summary          string    `json:"summary"`
	Severity         string    `json:"severity"` // "critical", "warning", "info"
	Status           string    `json:"status"`   // "active", "mitigated", "resolved"
	RootCauseType    string    `json:"root_cause_type,omitempty"` // "host", "network", "dependency", "container"
	RootCauseID      string    `json:"root_cause_id,omitempty"`
	ImpactedServices []string  `json:"impacted_services"`
	StartedAt        time.Time `json:"started_at"`
	ResolvedAt       *time.Time`json:"resolved_at,omitempty"`
}

// Event represents an immutable timestamped event entry.
type Event struct {
	ID           string    `json:"id"`
	IncidentID   string    `json:"incident_id,omitempty"`
	Source       string    `json:"source"` // "docker", "proxmox", "uptimekuma", "kizuna"
	EventType    string    `json:"event_type"`
	Severity     string    `json:"severity"` // "critical", "warning", "info", "success"
	Message      string    `json:"message"`
	MetadataJSON string    `json:"metadata_json,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

// Recommendation represents an actionable intelligence item.
type Recommendation struct {
	ID                    string    `json:"id"`
	Category              string    `json:"category"` // "storage", "performance", "reliability", "security"
	Severity              string    `json:"severity"` // "critical", "warning", "tip"
	Title                 string    `json:"title"`
	WhyItMatters          string    `json:"why_it_matters"`
	ActionSuggestion      string    `json:"action_suggestion"`
	ResourceType          string    `json:"resource_type,omitempty"`
	ResourceID            string    `json:"resource_id,omitempty"`
	PotentialSavingsBytes int64     `json:"potential_savings_bytes,omitempty"`
	IsDismissed           bool      `json:"is_dismissed"`
	CreatedAt             time.Time `json:"created_at"`
}

// StorageSummary aggregates global homelab storage metrics.
type StorageSummary struct {
	TotalBytes            int64 `json:"total_bytes"`
	UsedBytes             int64 `json:"used_bytes"`
	FreeBytes             int64 `json:"free_bytes"`
	UsagePercentage       float64 `json:"usage_percentage"`
	UnusedImageBytes      int64 `json:"unused_image_bytes"`
	UnusedVolumeBytes     int64 `json:"unused_volume_bytes"`
	OldLogBytes           int64 `json:"old_log_bytes"`
	TotalRecoverableBytes int64 `json:"total_recoverable_bytes"`
}

// HomelabHealthSummary is the top-level payload answering "Is my homelab okay?".
type HomelabHealthSummary struct {
	GlobalStatus         string           `json:"global_status"` // "healthy", "degraded", "critical"
	OnlineServices       int              `json:"online_services"`
	TotalServices        int              `json:"total_services"`
	OnlineHosts          int              `json:"online_hosts"`
	TotalHosts           int              `json:"total_hosts"`
	RunningContainers    int              `json:"running_containers"`
	TotalContainers      int              `json:"total_containers"`
	ActiveIncidents      int              `json:"active_incidents"`
	FiringAlerts         int              `json:"firing_alerts"`
	PendingRecomms       int              `json:"pending_recommendations"`
	AttentionItems       []Recommendation `json:"attention_items"`
	Storage              StorageSummary   `json:"storage"`
	KizunaSelfMetrics    SelfMetrics      `json:"kizuna_self_metrics"`
}

// SelfMetrics captures Kizuna's own operational footprint.
type SelfMetrics struct {
	Version          string  `json:"version"`
	UptimeSeconds    int64   `json:"uptime_seconds"`
	MemoryAllocBytes int64   `json:"memory_alloc_bytes"`
	MemoryAllocMB    float64 `json:"memory_alloc_mb"`
	GoroutinesCount  int     `json:"goroutines_count"`
	DBSizeBytes      int64   `json:"db_size_bytes"`
	AvgLatencyMs     float64 `json:"avg_latency_ms"`
}

// GraphNode represents an infrastructure node (service, database, host, storage).
type GraphNode struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Type     string `json:"type"` // "service", "database", "host", "storage"
	Status   string `json:"status"` // "online", "warning", "critical"
	Category string `json:"category,omitempty"`
	HostName string `json:"host_name,omitempty"`
}

// GraphEdge represents a directional dependency between nodes.
type GraphEdge struct {
	Source   string `json:"source"`
	Target   string `json:"target"`
	Relation string `json:"relation"` // "depends_on", "runs_on", "stores_on"
	Impact   string `json:"impact"`   // "critical", "optional"
}

// DependencyGraph encapsulates nodes and edges for topology visualization.
type DependencyGraph struct {
	Nodes []GraphNode `json:"nodes"`
	Edges []GraphEdge `json:"edges"`
}

// Alert represents an aggregated operational alert entry.
type Alert struct {
	ID          string    `json:"id"`
	Source      string    `json:"source"` // "kizuna", "uptimekuma", "prometheus", "proxmox"
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Severity    string    `json:"severity"` // "critical", "warning", "info"
	State       string    `json:"state"`    // "firing", "acknowledged", "resolved"
	TargetType  string    `json:"target_type"` // "service", "host", "container"
	TargetID    string    `json:"target_id"`
	StartedAt   time.Time `json:"started_at"`
	ResolvedAt  *time.Time`json:"resolved_at,omitempty"`
}

// MetricPoint represents a timestamped numeric data point.
type MetricPoint struct {
	Timestamp int64   `json:"timestamp"`
	Value     float64 `json:"value"`
}

// MetricSeries represents time-series data for a KPI metric.
type MetricSeries struct {
	MetricName string        `json:"metric_name"`
	Unit       string        `json:"unit"` // "%", "MB", "ms", "GB"
	Current    float64       `json:"current"`
	Points     []MetricPoint `json:"points"`
}

// HomelabTrends represents multi-dimensional historical metrics across the fleet.
type HomelabTrends struct {
	CPUTrend     MetricSeries `json:"cpu_trend"`
	MemoryTrend  MetricSeries `json:"memory_trend"`
	StorageTrend MetricSeries `json:"storage_trend"`
	LatencyTrend MetricSeries `json:"latency_trend"`
}
