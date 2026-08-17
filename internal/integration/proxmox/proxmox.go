package proxmox

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

type ProxmoxConfig struct {
	BaseURL     string // e.g. "https://192.168.1.100:8006"
	TokenID     string // e.g. "root@pam!kizuna"
	TokenSecret string // UUID secret
	SkipVerify  bool
}

type ProxmoxDriver struct {
	cfg    ProxmoxConfig
	client *http.Client
}

type pveNodesResponse struct {
	Data []pveNodeSummary `json:"data"`
}

type pveNodeSummary struct {
	Node   string  `json:"node"`
	Status string  `json:"status"` // "online"
	CPU    float64 `json:"cpu"`
	MaxCPU int     `json:"maxcpu"`
	Mem    int64   `json:"mem"`
	MaxMem int64   `json:"maxmem"`
	Disk   int64   `json:"disk"`
	MaxDisk int64  `json:"maxdisk"`
	Uptime int64   `json:"uptime"`
	Level  string  `json:"level"`
}

type pveVMResponse struct {
	Data []pveVMSummary `json:"data"`
}

type pveVMSummary struct {
	VMID      int     `json:"vmid"`
	Name      string  `json:"name"`
	Status    string  `json:"status"` // "running", "stopped"
	CPU       float64 `json:"cpu"`
	MaxCPU    int     `json:"maxcpu"`
	Mem       int64   `json:"mem"`
	MaxMem    int64   `json:"maxmem"`
	Disk      int64   `json:"disk"`
	MaxDisk   int64   `json:"maxdisk"`
	Uptime    int64   `json:"uptime"`
	Type      string  `json:"type"` // "qemu" or "lxc"
}

func New(cfg ProxmoxConfig) *ProxmoxDriver {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: cfg.SkipVerify,
		},
		DisableKeepAlives: true,
	}

	return &ProxmoxDriver{
		cfg: cfg,
		client: &http.Client{
			Transport: tr,
			Timeout:   10 * time.Second,
		},
	}
}

func (p *ProxmoxDriver) Name() string { return "Proxmox VE" }
func (p *ProxmoxDriver) Type() string { return "proxmox" }

func (p *ProxmoxDriver) IsConfigured() bool {
	return p.cfg.BaseURL != "" && p.cfg.TokenID != "" && p.cfg.TokenSecret != ""
}

func (p *ProxmoxDriver) HealthCheck(ctx context.Context) (bool, error) {
	if !p.IsConfigured() {
		return false, fmt.Errorf("proxmox not configured")
	}

	req, err := p.newRequest(ctx, "GET", "/api2/json/version")
	if err != nil {
		return false, err
	}

	resp, err := p.client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK, nil
}

func (p *ProxmoxDriver) SyncServices(ctx context.Context) ([]domain.Service, error) {
	return []domain.Service{}, nil
}

func (p *ProxmoxDriver) SyncHosts(ctx context.Context) ([]domain.Host, error) {
	if !p.IsConfigured() {
		return []domain.Host{}, nil
	}

	req, err := p.newRequest(ctx, "GET", "/api2/json/nodes")
	if err != nil {
		return nil, err
	}

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var nodesResp pveNodesResponse
	if err := json.NewDecoder(resp.Body).Decode(&nodesResp); err != nil {
		return nil, err
	}

	var hosts []domain.Host
	now := time.Now()

	for _, n := range nodesResp.Data {
		memPct := 0.0
		if n.MaxMem > 0 {
			memPct = (float64(n.Mem) / float64(n.MaxMem)) * 100.0
		}
		diskPct := 0.0
		if n.MaxDisk > 0 {
			diskPct = (float64(n.Disk) / float64(n.MaxDisk)) * 100.0
		}

		status := "online"
		if n.Status != "online" {
			status = "offline"
		} else if memPct > 85.0 || diskPct > 85.0 {
			status = "warning"
		}

		hosts = append(hosts, domain.Host{
			ID:                "pve-node-" + n.Node,
			Hostname:          n.Node,
			DisplayName:       fmt.Sprintf("%s (Proxmox VE Node)", n.Node),
			OSName:            "Debian / Proxmox VE",
			KernelVersion:     "PVE Hypervisor Kernel",
			IPAddress:         strings.TrimPrefix(strings.TrimPrefix(p.cfg.BaseURL, "https://"), "http://"),
			Status:            status,
			CPUCores:          n.MaxCPU,
			CPUUsagePercent:   n.CPU * 100.0,
			MemoryTotalBytes:  n.MaxMem,
			MemoryUsedBytes:   n.Mem,
			MemoryUsagePct:    memPct,
			DiskTotalBytes:    n.MaxDisk,
			DiskUsedBytes:     n.Disk,
			DiskUsagePct:      diskPct,
			UptimeSeconds:     n.Uptime,
			ContainerCount:    0,
			IntegrationID:     "proxmox",
			UpdatedAt:         now,
		})
	}

	return hosts, nil
}

func (p *ProxmoxDriver) SyncContainers(ctx context.Context) ([]domain.Container, error) {
	if !p.IsConfigured() {
		return []domain.Container{}, nil
	}

	// Fetch LXC containers across nodes
	nodes, err := p.SyncHosts(ctx)
	if err != nil {
		return nil, err
	}

	var containers []domain.Container
	now := time.Now()

	for _, node := range nodes {
		nodeName := node.Hostname
		req, err := p.newRequest(ctx, "GET", fmt.Sprintf("/api2/json/nodes/%s/lxc", nodeName))
		if err != nil {
			continue
		}

		resp, err := p.client.Do(req)
		if err != nil {
			continue
		}

		var vmResp pveVMResponse
		_ = json.NewDecoder(resp.Body).Decode(&vmResp)
		resp.Body.Close()

		for _, ct := range vmResp.Data {
			memPct := 0.0
			if ct.MaxMem > 0 {
				memPct = (float64(ct.Mem) / float64(ct.MaxMem)) * 100.0
			}

			state := "running"
			if ct.Status != "running" {
				state = "exited"
			}

			containers = append(containers, domain.Container{
				ID:               fmt.Sprintf("pve-lxc-%d", ct.VMID),
				HostID:           node.ID,
				HostName:         node.DisplayName,
				ContainerID:      fmt.Sprintf("lxc-%d", ct.VMID),
				Name:             ct.Name,
				Image:            fmt.Sprintf("LXC CT %d", ct.VMID),
				ImageSizeBytes:   ct.Disk,
				Status:           fmt.Sprintf("Up %d hrs", ct.Uptime/3600),
				State:            state,
				RestartCount:     0,
				CPUPercent:       ct.CPU * 100.0,
				MemoryUsageBytes: ct.Mem,
				MemoryLimitBytes: ct.MaxMem,
				MemoryUsagePct:   memPct,
				Ports:            []string{},
				IsWasteCandidate: state == "exited",
				WasteReason:      "",
				CreatedAt:        now,
				UpdatedAt:        now,
			})
		}
	}

	return containers, nil
}

func (p *ProxmoxDriver) SyncIncidents(ctx context.Context) ([]domain.Incident, error) {
	return []domain.Incident{}, nil
}

func (p *ProxmoxDriver) SyncRecommendations(ctx context.Context) ([]domain.Recommendation, error) {
	return []domain.Recommendation{}, nil
}

func (p *ProxmoxDriver) newRequest(ctx context.Context, method, path string) (*http.Request, error) {
	url := strings.TrimSuffix(p.cfg.BaseURL, "/") + path
	req, err := http.NewRequestWithContext(ctx, method, url, nil)
	if err != nil {
		return nil, err
	}

	authHeader := fmt.Sprintf("PVEAPIToken=%s=%s", p.cfg.TokenID, p.cfg.TokenSecret)
	req.Header.Set("Authorization", authHeader)
	req.Header.Set("Accept", "application/json")
	return req, nil
}
