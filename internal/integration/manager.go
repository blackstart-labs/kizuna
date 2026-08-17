package integration

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/blackstart-labs/kizuna/internal/domain"
	"github.com/blackstart-labs/kizuna/internal/integration/demo"
	"github.com/blackstart-labs/kizuna/internal/integration/docker"
	"github.com/blackstart-labs/kizuna/internal/integration/network"
	"github.com/blackstart-labs/kizuna/internal/integration/proxmox"
	"github.com/blackstart-labs/kizuna/internal/integration/sensors"
	"github.com/blackstart-labs/kizuna/internal/integration/uptimekuma"
)

type Manager struct {
	mu            sync.RWMutex
	drivers       []Driver
	dockerDriver  *docker.DockerDriver
	networkDriver *network.NetworkDriver

	// Cached state
	services        []domain.Service
	hosts           []domain.Host
	containers      []domain.Container
	incidents       []domain.Incident
	recommendations []domain.Recommendation
	lastSync        time.Time
}

type ManagerConfig struct {
	DemoMode           bool
	DockerSocket       string
	ProxmoxURL         string
	ProxmoxTokenID     string
	ProxmoxTokenSecret string
	ProxmoxSkipVerify  bool
	UptimeKumaURL      string
	UptimeKumaKey      string
}

func NewManager(cfg ManagerConfig) *Manager {
	m := &Manager{
		drivers: make([]Driver, 0),
	}

	if cfg.DemoMode {
		m.RegisterDriver(demo.New())
	}

	// Register Docker and host hardware sensors driver if socket is accessible and not explicitly disabled
	if cfg.DockerSocket != "disabled" {
		docDriver := docker.New(cfg.DockerSocket)
		if docDriver.IsAvailable() {
			m.dockerDriver = docDriver
			m.RegisterDriver(docDriver)
		}
		if !cfg.DemoMode {
			m.RegisterDriver(sensors.New())
		}
	}

	// Always initialize real network driver for ARP client discovery, bandwidth telemetry, and speed testing
	m.networkDriver = network.NewNetworkDriver()
	if m.dockerDriver != nil {
		m.networkDriver.SetContainerLookup(func(ip, mac string) string {
			cntMap := m.dockerDriver.GetContainerNetworkMap(context.Background())
			if name, ok := cntMap[ip]; ok {
				return name
			}
			if name, ok := cntMap[strings.ToLower(mac)]; ok {
				return name
			}
			return ""
		})
	}
	m.RegisterDriver(m.networkDriver)

	// Register Proxmox VE driver if configured
	if cfg.ProxmoxURL != "" && cfg.ProxmoxTokenID != "" && cfg.ProxmoxTokenSecret != "" {
		pveDriver := proxmox.New(proxmox.ProxmoxConfig{
			BaseURL:     cfg.ProxmoxURL,
			TokenID:     cfg.ProxmoxTokenID,
			TokenSecret: cfg.ProxmoxTokenSecret,
			SkipVerify:  cfg.ProxmoxSkipVerify,
		})
		m.RegisterDriver(pveDriver)
	}

	// Register Uptime Kuma driver if configured
	if cfg.UptimeKumaURL != "" {
		kumaDriver := uptimekuma.New(uptimekuma.UptimeKumaConfig{
			BaseURL: cfg.UptimeKumaURL,
			APIKey:  cfg.UptimeKumaKey,
		})
		m.RegisterDriver(kumaDriver)
	}

	// Trigger initial sync
	_ = m.SyncAll(context.Background())
	return m
}

func (m *Manager) RegisterDriver(d Driver) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.drivers = append(m.drivers, d)
}

func (m *Manager) SyncAll(ctx context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	var allServices []domain.Service
	var allHosts []domain.Host
	var allContainers []domain.Container
	var allIncidents []domain.Incident
	var allRecommendations []domain.Recommendation

	for _, d := range m.drivers {
		if srvs, err := d.SyncServices(ctx); err == nil {
			allServices = append(allServices, srvs...)
		}
		if hsts, err := d.SyncHosts(ctx); err == nil {
			allHosts = append(allHosts, hsts...)
		}
		if cnts, err := d.SyncContainers(ctx); err == nil {
			allContainers = append(allContainers, cnts...)
		}
		if incs, err := d.SyncIncidents(ctx); err == nil {
			allIncidents = append(allIncidents, incs...)
		}
		if recs, err := d.SyncRecommendations(ctx); err == nil {
			allRecommendations = append(allRecommendations, recs...)
		}
	}

	m.services = allServices
	m.hosts = allHosts
	m.containers = allContainers
	m.incidents = allIncidents
	m.recommendations = allRecommendations
	m.lastSync = time.Now()

	return nil
}

func (m *Manager) GetServices() []domain.Service {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.services
}

func (m *Manager) GetHosts() []domain.Host {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.hosts
}

func (m *Manager) GetContainers() []domain.Container {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.containers
}

func (m *Manager) GetIncidents() []domain.Incident {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.incidents
}

func (m *Manager) GetRecommendations() []domain.Recommendation {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.recommendations
}

func (m *Manager) RestartContainer(ctx context.Context, id string) error {
	if m.dockerDriver != nil {
		return m.dockerDriver.RestartContainer(ctx, id)
	}
	return nil // Graceful no-op in pure demo mode
}

func (m *Manager) StopContainer(ctx context.Context, id string) error {
	if m.dockerDriver != nil {
		return m.dockerDriver.StopContainer(ctx, id)
	}
	return nil
}

func (m *Manager) StartContainer(ctx context.Context, id string) error {
	if m.dockerDriver != nil {
		return m.dockerDriver.StartContainer(ctx, id)
	}
	return nil
}

func (m *Manager) ScanNetworkClients(ctx context.Context) ([]domain.NetworkClient, error) {
	if m.networkDriver != nil {
		return m.networkDriver.ScanClients(ctx)
	}
	return []domain.NetworkClient{}, nil
}

func (m *Manager) GetNetworkThroughput(ctx context.Context) ([]domain.NetworkInterfaceMetric, error) {
	if m.networkDriver != nil {
		return m.networkDriver.GetThroughput(ctx)
	}
	return []domain.NetworkInterfaceMetric{}, nil
}

func (m *Manager) RunSpeedTest(ctx context.Context) (*domain.SpeedTestResult, error) {
	if m.networkDriver != nil {
		return m.networkDriver.RunSpeedTest(ctx)
	}
	return nil, fmt.Errorf("network driver not initialized")
}

func (m *Manager) GetLatestSpeedTest() *domain.SpeedTestResult {
	if m.networkDriver != nil {
		return m.networkDriver.GetLatestSpeedTest()
	}
	return nil
}
