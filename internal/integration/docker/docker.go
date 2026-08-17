package docker

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

type DockerDriver struct {
	socketPath string
	client     *http.Client
}

type dockerContainerSummary struct {
	ID      string            `json:"Id"`
	Names   []string          `json:"Names"`
	Image   string            `json:"Image"`
	ImageID string            `json:"ImageID"`
	State   string            `json:"State"`
	Status  string            `json:"Status"`
	Created int64             `json:"Created"`
	Ports   []dockerPort      `json:"Ports"`
	Labels  map[string]string `json:"Labels"`
	SizeRw  int64             `json:"SizeRw"`
}

type dockerPort struct {
	IP          string `json:"IP"`
	PrivatePort int    `json:"PrivatePort"`
	PublicPort  int    `json:"PublicPort"`
	Type        string `json:"Type"`
}

type dockerImageSummary struct {
	ID          string   `json:"Id"`
	RepoTags    []string `json:"RepoTags"`
	Size        int64    `json:"Size"`
	Containers  int64    `json:"Containers"`
	Created     int64    `json:"Created"`
}

type dockerVolumesResponse struct {
	Volumes []dockerVolume `json:"Volumes"`
}

type dockerVolume struct {
	Name       string            `json:"Name"`
	Driver     string            `json:"Driver"`
	Mountpoint string            `json:"Mountpoint"`
	Labels     map[string]string `json:"Labels"`
}

func New(socketPath string) *DockerDriver {
	if socketPath == "" {
		socketPath = "/var/run/docker.sock"
	}

	transport := &http.Transport{
		DialContext: func(ctx context.Context, _, _ string) (net.Conn, error) {
			return net.Dial("unix", socketPath)
		},
		DisableKeepAlives: true,
	}

	client := &http.Client{
		Transport: transport,
		Timeout:   10 * time.Second,
	}

	return &DockerDriver{
		socketPath: socketPath,
		client:     client,
	}
}

func (d *DockerDriver) Name() string { return "Docker Engine" }
func (d *DockerDriver) Type() string { return "docker" }

func (d *DockerDriver) IsAvailable() bool {
	info, err := os.Stat(d.socketPath)
	if err != nil {
		return false
	}
	return (info.Mode() & os.ModeSocket) != 0
}

func (d *DockerDriver) HealthCheck(ctx context.Context) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "http://localhost/_ping", nil)
	if err != nil {
		return false, err
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK, nil
}

func (d *DockerDriver) SyncServices(ctx context.Context) ([]domain.Service, error) {
	// Docker containers with web labels/ports can be auto-discovered as services
	containers, err := d.getContainers(ctx)
	if err != nil {
		return nil, err
	}

	var services []domain.Service
	now := time.Now()

	for _, c := range containers {
		name := strings.TrimPrefix(c.Names[0], "/")
		var publicPort int
		for _, p := range c.Ports {
			if p.PublicPort > 0 {
				publicPort = p.PublicPort
				break
			}
		}

		if publicPort > 0 {
			url := fmt.Sprintf("http://localhost:%d", publicPort)
			status := "online"
			if c.State != "running" {
				status = "offline"
			}

			services = append(services, domain.Service{
				ID:               "docker-srv-" + c.ID[:12],
				Name:             strings.ToUpper(string(name[0])) + name[1:],
				Description:      fmt.Sprintf("Docker container workload (%s)", c.Image),
				URL:              url,
				Icon:             "box",
				Category:         "Containers",
				Tags:             []string{"docker", "container"},
				HostID:           "host-docker-local",
				HostName:         "Local Docker Host",
				Status:           status,
				UptimePercentage: 100.0,
				LatencyMs:        2,
				Version:          c.Image,
				IsFavorite:       false,
				CreatedAt:        time.Unix(c.Created, 0),
				UpdatedAt:        now,
			})
		}
	}

	return services, nil
}

func (d *DockerDriver) SyncHosts(ctx context.Context) ([]domain.Host, error) {
	hostname, _ := os.Hostname()
	now := time.Now()

	containers, err := d.getContainers(ctx)
	cntCount := len(containers)
	if err != nil {
		cntCount = 0
	}

	return []domain.Host{
		{
			ID:                "host-docker-local",
			Hostname:          hostname,
			DisplayName:       "Local Docker Engine Host",
			OSName:            "Linux (Docker Socket)",
			KernelVersion:     "Native Unix Socket",
			IPAddress:         "127.0.0.1",
			Status:            "online",
			CPUCores:          8,
			CPUUsagePercent:   12.5,
			MemoryTotalBytes:  34359738368,
			MemoryUsedBytes:   8589934592,
			MemoryUsagePct:    25.0,
			DiskTotalBytes:    1000204886016,
			DiskUsedBytes:     322122547200,
			DiskUsagePct:      32.2,
			UptimeSeconds:     86400,
			ContainerCount:    cntCount,
			UpdatedAt:         now,
		},
	}, nil
}

func (d *DockerDriver) SyncContainers(ctx context.Context) ([]domain.Container, error) {
	rawContainers, err := d.getContainers(ctx)
	if err != nil {
		return nil, err
	}

	var containers []domain.Container
	now := time.Now()

	for _, c := range rawContainers {
		name := strings.TrimPrefix(c.Names[0], "/")
		var ports []string
		for _, p := range c.Ports {
			if p.PublicPort > 0 {
				ports = append(ports, fmt.Sprintf("%d:%d", p.PublicPort, p.PrivatePort))
			} else {
				ports = append(ports, fmt.Sprintf("%d/%s", p.PrivatePort, p.Type))
			}
		}

		isWaste := false
		wasteReason := ""
		if c.State == "exited" {
			isWaste = true
			wasteReason = "Stopped container occupying disk layer space"
		}

		containers = append(containers, domain.Container{
			ID:               "cnt-" + c.ID[:12],
			HostID:           "host-docker-local",
			HostName:         "Local Docker Host",
			ContainerID:      c.ID[:12],
			Name:             name,
			Image:            c.Image,
			ImageSizeBytes:   c.SizeRw,
			Status:           c.Status,
			State:            c.State,
			RestartCount:     0,
			CPUPercent:       1.0,
			MemoryUsageBytes: 150000000,
			MemoryLimitBytes: 2000000000,
			MemoryUsagePct:   7.5,
			Ports:            ports,
			IsWasteCandidate: isWaste,
			WasteReason:      wasteReason,
			CreatedAt:        time.Unix(c.Created, 0),
			UpdatedAt:        now,
		})
	}

	return containers, nil
}

func (d *DockerDriver) SyncIncidents(ctx context.Context) ([]domain.Incident, error) {
	return []domain.Incident{}, nil
}

func (d *DockerDriver) SyncRecommendations(ctx context.Context) ([]domain.Recommendation, error) {
	images, err := d.getImages(ctx)
	if err != nil {
		return []domain.Recommendation{}, nil
	}

	var unusedBytes int64
	unusedCount := 0
	for _, img := range images {
		if img.Containers == 0 {
			unusedCount++
			unusedBytes += img.Size
		}
	}

	var recs []domain.Recommendation
	if unusedCount > 0 {
		recs = append(recs, domain.Recommendation{
			ID:                    "rec-docker-dangling-images",
			Category:              "storage",
			Severity:              "warning",
			Title:                 fmt.Sprintf("Prune %d Unused Docker Images", unusedCount),
			WhyItMatters:          fmt.Sprintf("%d unreferenced image layers are consuming %.1f GB of host disk space.", unusedCount, float64(unusedBytes)/(1024*1024*1024)),
			ActionSuggestion:      "Execute 'docker image prune -a' on the host.",
			ResourceType:          "docker_image",
			PotentialSavingsBytes: unusedBytes,
			IsDismissed:           false,
			CreatedAt:             time.Now(),
		})
	}

	return recs, nil
}

// Lifecycle Actions: Restart, Stop, Start
func (d *DockerDriver) RestartContainer(ctx context.Context, containerID string) error {
	url := fmt.Sprintf("http://localhost/containers/%s/restart?t=10", containerID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, nil)
	if err != nil {
		return err
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("docker returned status code: %d", resp.StatusCode)
	}
	return nil
}

func (d *DockerDriver) StopContainer(ctx context.Context, containerID string) error {
	url := fmt.Sprintf("http://localhost/containers/%s/stop?t=10", containerID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, nil)
	if err != nil {
		return err
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("docker returned status code: %d", resp.StatusCode)
	}
	return nil
}

func (d *DockerDriver) StartContainer(ctx context.Context, containerID string) error {
	url := fmt.Sprintf("http://localhost/containers/%s/start", containerID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, nil)
	if err != nil {
		return err
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotModified {
		return fmt.Errorf("docker returned status code: %d", resp.StatusCode)
	}
	return nil
}

func (d *DockerDriver) getContainers(ctx context.Context) ([]dockerContainerSummary, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "http://localhost/containers/json?all=1", nil)
	if err != nil {
		return nil, err
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var summaries []dockerContainerSummary
	if err := json.NewDecoder(resp.Body).Decode(&summaries); err != nil {
		return nil, err
	}
	return summaries, nil
}

func (d *DockerDriver) getImages(ctx context.Context) ([]dockerImageSummary, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "http://localhost/images/json", nil)
	if err != nil {
		return nil, err
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var images []dockerImageSummary
	if err := json.NewDecoder(resp.Body).Decode(&images); err != nil {
		return nil, err
	}
	return images, nil
}
