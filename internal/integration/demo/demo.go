package demo

import (
	"context"
	"time"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

type DemoDriver struct{}

func New() *DemoDriver {
	return &DemoDriver{}
}

func (d *DemoDriver) Name() string { return "Demo Provider" }
func (d *DemoDriver) Type() string { return "demo" }

func (d *DemoDriver) HealthCheck(ctx context.Context) (bool, error) {
	return true, nil
}

func (d *DemoDriver) SyncServices(ctx context.Context) ([]domain.Service, error) {
	now := time.Now()
	return []domain.Service{
		{
			ID:               "srv-forgejo",
			Name:             "Forgejo Git Server",
			Description:      "Lightweight self-hosted Git forge and software collaboration suite",
			URL:              "https://forgejo.baaankai.dpdns.org",
			Icon:             "git-branch",
			Category:         "Sysadmin & DevOps",
			Tags:             []string{"git", "vcs", "code", "devops"},
			HostID:           "host-titan-01",
			HostName:         "titan-primary (Ubuntu 24.04)",
			Status:           "online",
			UptimePercentage: 99.98,
			LatencyMs:        14,
			Version:          "v9.0.2",
			HealthEndpoint:   "/api/v1/version",
			IsFavorite:       true,
			Dependencies:     []string{"srv-postgres"},
			CreatedAt:        now.Add(-720 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "srv-leantime",
			Name:             "Leantime",
			Description:      "Lean, AI-assisted project management and sprint planner",
			URL:              "https://leantime.baaankai.dpdns.org",
			Icon:             "kanban",
			Category:         "Productivity",
			Tags:             []string{"pms", "agile", "tickets"},
			HostID:           "host-titan-01",
			HostName:         "titan-primary (Ubuntu 24.04)",
			Status:           "online",
			UptimePercentage: 99.95,
			LatencyMs:        22,
			Version:          "v3.9.8",
			IsFavorite:       true,
			Dependencies:     []string{"srv-mariadb"},
			CreatedAt:        now.Add(-600 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "srv-jellyfin",
			Name:             "Jellyfin Media",
			Description:      "Hardware-accelerated media streaming server for 4K Movies and TV",
			URL:              "https://jellyfin.baaankai.dpdns.org",
			Icon:             "film",
			Category:         "Media & Entertainment",
			Tags:             []string{"media", "streaming", "video"},
			HostID:           "host-titan-01",
			HostName:         "titan-primary (Ubuntu 24.04)",
			Status:           "online",
			UptimePercentage: 99.99,
			LatencyMs:        9,
			Version:          "v10.9.11",
			IsFavorite:       true,
			Dependencies:     []string{"srv-nas-storage"},
			CreatedAt:        now.Add(-900 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "srv-grafana",
			Name:             "Grafana Observability",
			Description:      "Operational metrics visualization, Prometheus dashboarding & alerting",
			URL:              "https://grafana.baaankai.dpdns.org",
			Icon:             "line-chart",
			Category:         "Monitoring",
			Tags:             []string{"monitoring", "metrics", "alerts"},
			HostID:           "host-titan-01",
			HostName:         "titan-primary (Ubuntu 24.04)",
			Status:           "online",
			UptimePercentage: 100.0,
			LatencyMs:        11,
			Version:          "v11.1.0",
			IsFavorite:       true,
			Dependencies:     []string{"srv-prometheus"},
			CreatedAt:        now.Add(-1000 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "srv-maybe",
			Name:             "Maybe Finance",
			Description:      "Privacy-first net worth and personal investment accounting",
			URL:              "https://finance.baaankai.dpdns.org",
			Icon:             "wallet",
			Category:         "Finance",
			Tags:             []string{"finance", "budget", "crypto"},
			HostID:           "host-titan-01",
			HostName:         "titan-primary (Ubuntu 24.04)",
			Status:           "online",
			UptimePercentage: 99.82,
			LatencyMs:        35,
			Version:          "v0.2.1",
			IsFavorite:       false,
			Dependencies:     []string{"srv-postgres", "srv-redis"},
			CreatedAt:        now.Add(-300 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "srv-ntfy",
			Name:             "ntfy Push Notification Broker",
			Description:      "Unified push alert dispatcher for homelab notifications",
			URL:              "https://ntfy.baaankai.dpdns.org",
			Icon:             "bell",
			Category:         "Sysadmin & Alerts",
			Tags:             []string{"alerts", "push", "pubsub"},
			HostID:           "host-titan-01",
			HostName:         "titan-primary (Ubuntu 24.04)",
			Status:           "online",
			UptimePercentage: 100.0,
			LatencyMs:        8,
			Version:          "v2.11.0",
			IsFavorite:       false,
			CreatedAt:        now.Add(-400 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "srv-scrutiny",
			Name:             "Scrutiny S.M.A.R.T. Monitor",
			Description:      "Automated drive health telemetry and HDD failure prediction",
			URL:              "https://scrutiny.baaankai.dpdns.org",
			Icon:             "hard-drive",
			Category:         "Monitoring",
			Tags:             []string{"smart", "storage", "drives"},
			HostID:           "host-titan-01",
			HostName:         "titan-primary (Ubuntu 24.04)",
			Status:           "online",
			UptimePercentage: 100.0,
			LatencyMs:        12,
			Version:          "v0.8.1",
			IsFavorite:       false,
			CreatedAt:        now.Add(-200 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "srv-immich",
			Name:             "Immich Photo Cloud",
			Description:      "Self-hosted Google Photos alternative with ML vector search",
			URL:              "https://photos.baaankai.dpdns.org",
			Icon:             "image",
			Category:         "Storage & Backup",
			Tags:             []string{"photos", "ai", "backup"},
			HostID:           "host-atlas-02",
			HostName:         "atlas-storage (Proxmox VE)",
			Status:           "degraded",
			UptimePercentage: 96.40,
			LatencyMs:        180,
			Version:          "v1.118.0",
			IsFavorite:       true,
			Dependencies:     []string{"srv-postgres", "srv-redis", "srv-ml-engine"},
			CreatedAt:        now.Add(-500 * time.Hour),
			UpdatedAt:        now,
		},
	}, nil
}

func (d *DemoDriver) SyncHosts(ctx context.Context) ([]domain.Host, error) {
	now := time.Now()
	return []domain.Host{
		{
			ID:               "host-titan-01",
			Hostname:         "titan-primary",
			DisplayName:      "Titan Primary (Main Docker Host)",
			OSName:           "Ubuntu 24.04 LTS (x86_64)",
			KernelVersion:    "6.8.0-45-generic",
			IPAddress:        "192.168.1.75",
			Status:           "online",
			CPUCores:         8,
			CPUUsagePercent:  18.4,
			MemoryTotalBytes: 34359738368, // 32 GB
			MemoryUsedBytes:  14817632256, // 13.8 GB
			MemoryUsagePct:   43.1,
			DiskTotalBytes:   1000204886016, // 1 TB
			DiskUsedBytes:    472446402560,  // 440 GB
			DiskUsagePct:     47.2,
			UptimeSeconds:    864000,        // 10 days
			ContainerCount:   11,
			TemperatureDegC:  42.5,
			UpdatedAt:        now,
		},
		{
			ID:               "host-atlas-02",
			Hostname:         "atlas-proxmox",
			DisplayName:      "Atlas Hypervisor (Proxmox VE 8.2)",
			OSName:           "Debian 12 / Proxmox VE",
			KernelVersion:    "6.8.8-2-pve",
			IPAddress:        "192.168.1.100",
			Status:           "warning",
			CPUCores:         16,
			CPUUsagePercent:  48.2,
			MemoryTotalBytes: 68719476736, // 64 GB
			MemoryUsedBytes:  58411487232, // 54.4 GB (High Memory Pressure)
			MemoryUsagePct:   85.0,
			DiskTotalBytes:   4000787030016, // 4 TB ZFS
			DiskUsedBytes:    3640716197314, // 3.64 TB (91% Full)
			DiskUsagePct:     91.0,
			UptimeSeconds:    2419200,       // 28 days
			ContainerCount:   6,
			TemperatureDegC:  51.0,
			UpdatedAt:        now,
		},
		{
			ID:               "host-helios-03",
			Hostname:         "helios-gateway",
			DisplayName:      "Helios Edge & DNS Router",
			OSName:           "Alpine Linux 3.20 (ARM64)",
			KernelVersion:    "6.6.31-linux-arm64",
			IPAddress:        "192.168.1.1",
			Status:           "online",
			CPUCores:         4,
			CPUUsagePercent:  4.5,
			MemoryTotalBytes: 4294967296, // 4 GB
			MemoryUsedBytes:  751619276,  // 716 MB
			MemoryUsagePct:   17.5,
			DiskTotalBytes:   64424509440, // 64 GB eMMC
			DiskUsedBytes:    8589934592,  // 8 GB
			DiskUsagePct:     13.3,
			UptimeSeconds:    5184000,     // 60 days
			ContainerCount:   3,
			TemperatureDegC:  38.0,
			UpdatedAt:        now,
		},
		{
			ID:               "host-hyperion-04",
			Hostname:         "hyperion-backup",
			DisplayName:      "Hyperion Cold Backup Node",
			OSName:           "TrueNAS SCALE 24.04",
			KernelVersion:    "6.6.29-production",
			IPAddress:        "192.168.1.200",
			Status:           "online",
			CPUCores:         4,
			CPUUsagePercent:  6.2,
			MemoryTotalBytes: 17179869184, // 16 GB ECC
			MemoryUsedBytes:  6871947673,  // 6.4 GB
			MemoryUsagePct:   40.0,
			DiskTotalBytes:   16000000000000, // 16 TB RAID-Z2
			DiskUsedBytes:    5600000000000,  // 5.6 TB
			DiskUsagePct:     35.0,
			UptimeSeconds:    1209600,        // 14 days
			ContainerCount:   2,
			TemperatureDegC:  36.5,
			UpdatedAt:        now,
		},
	}, nil
}

func (d *DemoDriver) SyncContainers(ctx context.Context) ([]domain.Container, error) {
	now := time.Now()
	return []domain.Container{
		{
			ID:               "cnt-forgejo",
			HostID:           "host-titan-01",
			HostName:         "titan-primary",
			ContainerID:      "d89f7a1c0234",
			Name:             "forgejo",
			Image:            "codeberg.org/forgejo/forgejo:9",
			ImageSizeBytes:   75161927, // 71.6 MB
			Status:           "Up 8 hours",
			State:            "running",
			RestartCount:     0,
			CPUPercent:       0.8,
			MemoryUsageBytes: 146800640,  // 140 MB
			MemoryLimitBytes: 1073741824, // 1 GB
			MemoryUsagePct:   14.0,
			Ports:            []string{"3000:3000", "2222:22"},
			IsWasteCandidate: false,
			CreatedAt:        now.Add(-48 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "cnt-leantime",
			HostID:           "host-titan-01",
			HostName:         "titan-primary",
			ContainerID:      "e41b99cc812a",
			Name:             "leantime",
			Image:            "leantime/leantime:latest",
			ImageSizeBytes:   419430400, // 400 MB
			Status:           "Up 8 hours (healthy)",
			State:            "running",
			RestartCount:     0,
			CPUPercent:       1.4,
			MemoryUsageBytes: 241172480, // 230 MB
			MemoryLimitBytes: 2147483648,
			MemoryUsagePct:   11.2,
			Ports:            []string{"8090:8080"},
			IsWasteCandidate: false,
			CreatedAt:        now.Add(-72 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "cnt-leantime-db",
			HostID:           "host-titan-01",
			HostName:         "titan-primary",
			ContainerID:      "a118e90f23cd",
			Name:             "leantime-db",
			Image:            "mariadb:11",
			ImageSizeBytes:   387973120, // 370 MB
			Status:           "Up 8 hours (healthy)",
			State:            "running",
			RestartCount:     0,
			CPUPercent:       0.6,
			MemoryUsageBytes: 367001600, // 350 MB
			MemoryLimitBytes: 4294967296,
			MemoryUsagePct:   8.5,
			Ports:            []string{"3306/tcp"},
			IsWasteCandidate: false,
			CreatedAt:        now.Add(-72 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "cnt-jellyfin",
			HostID:           "host-titan-01",
			HostName:         "titan-primary",
			ContainerID:      "f90241ba6601",
			Name:             "jellyfin",
			Image:            "jellyfin/jellyfin:latest",
			ImageSizeBytes:   891289600, // 850 MB
			Status:           "Up 8 hours (healthy)",
			State:            "running",
			RestartCount:     0,
			CPUPercent:       3.2,
			MemoryUsageBytes: 838860800, // 800 MB
			MemoryLimitBytes: 8589934592,
			MemoryUsagePct:   9.8,
			Ports:            []string{"8096:8096"},
			IsWasteCandidate: false,
			CreatedAt:        now.Add(-120 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "cnt-ntfy",
			HostID:           "host-titan-01",
			HostName:         "titan-primary",
			ContainerID:      "c22718ef0099",
			Name:             "ntfy",
			Image:            "binwiederhier/ntfy:latest",
			ImageSizeBytes:   33554432, // 32 MB
			Status:           "Up 8 hours",
			State:            "running",
			RestartCount:     0,
			CPUPercent:       0.1,
			MemoryUsageBytes: 25165824, // 24 MB
			MemoryLimitBytes: 536870912,
			MemoryUsagePct:   4.7,
			Ports:            []string{"8088:80"},
			IsWasteCandidate: false,
			CreatedAt:        now.Add(-48 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "cnt-scrutiny",
			HostID:           "host-titan-01",
			HostName:         "titan-primary",
			ContainerID:      "b891823ca871",
			Name:             "scrutiny",
			Image:            "ghcr.io/analogj/scrutiny:master-omnibus",
			ImageSizeBytes:   188743680, // 180 MB
			Status:           "Up 6 hours",
			State:            "running",
			RestartCount:     0,
			CPUPercent:       0.4,
			MemoryUsageBytes: 94371840, // 90 MB
			MemoryLimitBytes: 1073741824,
			MemoryUsagePct:   8.8,
			Ports:            []string{"8089:8080"},
			IsWasteCandidate: false,
			CreatedAt:        now.Add(-48 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "cnt-maybe",
			HostID:           "host-titan-01",
			HostName:         "titan-primary",
			ContainerID:      "7162839401bf",
			Name:             "maybe",
			Image:            "ghcr.io/maybe-finance/maybe:latest",
			ImageSizeBytes:   524288000, // 500 MB
			Status:           "Up 8 hours",
			State:            "running",
			RestartCount:     0,
			CPUPercent:       1.8,
			MemoryUsageBytes: 681574400, // 650 MB
			MemoryLimitBytes: 4294967296,
			MemoryUsagePct:   15.9,
			Ports:            []string{"8092:3000"},
			IsWasteCandidate: false,
			CreatedAt:        now.Add(-96 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "cnt-dashy-stale",
			HostID:           "host-titan-01",
			HostName:         "titan-primary",
			ContainerID:      "6123498701aa",
			Name:             "dashy-old-backup",
			Image:            "lissy93/dashy:v2.1.1",
			ImageSizeBytes:   838860800, // 800 MB
			Status:           "Exited (0) 5 days ago",
			State:            "exited",
			RestartCount:     0,
			CPUPercent:       0.0,
			MemoryUsageBytes: 0,
			MemoryLimitBytes: 0,
			MemoryUsagePct:   0.0,
			Ports:            []string{},
			IsWasteCandidate: true,
			WasteReason:      "Stopped container occupying 800 MB of image layer storage",
			CreatedAt:        now.Add(-240 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "cnt-flapping-worker",
			HostID:           "host-atlas-02",
			HostName:         "atlas-proxmox",
			ContainerID:      "1928374650bb",
			Name:             "immich-ml-worker",
			Image:            "ghcr.io/immich-app/immich-machine-learning:release",
			ImageSizeBytes:   2147483648, // 2 GB
			Status:           "Restarting (1) 12 seconds ago",
			State:            "restarting",
			RestartCount:     17,
			CPUPercent:       94.2,
			MemoryUsageBytes: 4194304000, // 4 GB (OOM Killing)
			MemoryLimitBytes: 4294967296,
			MemoryUsagePct:   98.5,
			Ports:            []string{"3003/tcp"},
			IsWasteCandidate: false,
			WasteReason:      "High restart frequency: 17 crashes today due to memory ceiling",
			CreatedAt:        now.Add(-24 * time.Hour),
			UpdatedAt:        now,
		},
	}, nil
}

func (d *DemoDriver) SyncIncidents(ctx context.Context) ([]domain.Incident, error) {
	now := time.Now()
	return []domain.Incident{
		{
			ID:               "inc-2026-0817-01",
			Title:            "High Storage Pressure on Hypervisor Node",
			Summary:          "Primary ZFS pool on atlas-proxmox reached 91% capacity. Automatic deduplication and snapshot retention recommended.",
			Severity:         "warning",
			Status:           "active",
			RootCauseType:    "host",
			RootCauseID:      "host-atlas-02",
			ImpactedServices: []string{"Immich Photo Cloud", "VM-HomeAssistant"},
			StartedAt:        now.Add(-2 * time.Hour),
		},
		{
			ID:               "inc-2026-0817-02",
			Title:            "Memory Exhaustion Loop on Machine Learning Worker",
			Summary:          "Container immich-ml-worker has crashed and restarted 17 times in the last 6 hours due to memory limit saturation (98.5%).",
			Severity:         "critical",
			Status:           "active",
			RootCauseType:    "container",
			RootCauseID:      "cnt-flapping-worker",
			ImpactedServices: []string{"Immich Photo Cloud"},
			StartedAt:        now.Add(-4 * time.Hour),
		},
	}, nil
}

func (d *DemoDriver) SyncRecommendations(ctx context.Context) ([]domain.Recommendation, error) {
	now := time.Now()
	return []domain.Recommendation{
		{
			ID:                    "rec-001",
			Category:              "storage",
			Severity:              "warning",
			Title:                 "Prune 3 Unused Stale Docker Images",
			WhyItMatters:          "Old untagged image layers from retired dashboard containers are consuming 8.4 GB of NVMe SSD space.",
			ActionSuggestion:      "Execute 'docker image prune -a' or purge unreferenced images from sysadmin stack.",
			ResourceType:          "docker_image",
			PotentialSavingsBytes: 9019431321, // 8.4 GB
			IsDismissed:           false,
			CreatedAt:             now.Add(-1 * time.Hour),
		},
		{
			ID:                    "rec-002",
			Category:              "reliability",
			Severity:              "critical",
			Title:                 "Increase Memory Limit on immich-ml-worker",
			WhyItMatters:          "Container is stuck in a crash loop (17 restarts) because facial recognition models exceed the 4 GB allocation ceiling.",
			ActionSuggestion:      "Raise memory limit to 6 GB in apps/storage/docker-compose.yml or assign host swap.",
			ResourceType:          "container",
			ResourceID:            "cnt-flapping-worker",
			IsDismissed:           false,
			CreatedAt:             now.Add(-2 * time.Hour),
		},
		{
			ID:                    "rec-003",
			Category:              "performance",
			Severity:              "tip",
			Title:                 "Enable WAL Mode & Shared Buffer on Postgres",
			WhyItMatters:          "Maybe Finance queries are experiencing 35ms latency during nightly background portfolio reconciliation.",
			ActionSuggestion:      "Tune shared_buffers to 512MB and max_worker_processes to 4 in postgresql.conf.",
			ResourceType:          "database",
			IsDismissed:           false,
			CreatedAt:             now.Add(-6 * time.Hour),
		},
	}, nil
}
