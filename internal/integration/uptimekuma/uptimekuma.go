package uptimekuma

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

type UptimeKumaConfig struct {
	BaseURL string // e.g. "https://kuma.baaankai.dpdns.org"
	APIKey  string
}

type UptimeKumaDriver struct {
	cfg    UptimeKumaConfig
	client *http.Client
}

type kumaHeartbeatResponse struct {
	HeartbeatList map[string][]kumaHeartbeat `json:"heartbeatList"`
	UptimeList    map[string]float64         `json:"uptimeList"`
}

type kumaHeartbeat struct {
	Status int    `json:"status"` // 1 = UP, 0 = DOWN, 2 = PENDING
	Time   string `json:"time"`
	Ping   int64  `json:"ping"`
	Msg    string `json:"msg"`
}

type kumaMonitorsResponse struct {
	Monitors []kumaMonitor `json:"monitors"`
}

type kumaMonitor struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	URL      string `json:"url"`
	Type     string `json:"type"`
	Interval int    `json:"interval"`
	Active   bool   `json:"active"`
}

func New(cfg UptimeKumaConfig) *UptimeKumaDriver {
	return &UptimeKumaDriver{
		cfg: cfg,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (k *UptimeKumaDriver) Name() string { return "Uptime Kuma" }
func (k *UptimeKumaDriver) Type() string { return "uptimekuma" }

func (k *UptimeKumaDriver) IsConfigured() bool {
	return k.cfg.BaseURL != ""
}

func (k *UptimeKumaDriver) HealthCheck(ctx context.Context) (bool, error) {
	if !k.IsConfigured() {
		return false, fmt.Errorf("uptime kuma not configured")
	}

	url := strings.TrimSuffix(k.cfg.BaseURL, "/") + "/api/entrypoint"
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return false, err
	}

	resp, err := k.client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK, nil
}

func (k *UptimeKumaDriver) SyncServices(ctx context.Context) ([]domain.Service, error) {
	if !k.IsConfigured() {
		return []domain.Service{}, nil
	}

	url := strings.TrimSuffix(k.cfg.BaseURL, "/") + "/api/status-page/heartbeat/default"
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := k.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var hbResp kumaHeartbeatResponse
	if err := json.NewDecoder(resp.Body).Decode(&hbResp); err != nil {
		return nil, err
	}

	var services []domain.Service
	now := time.Now()

	for monID, beats := range hbResp.HeartbeatList {
		status := "online"
		latency := int64(10)
		if len(beats) > 0 {
			latest := beats[len(beats)-1]
			if latest.Status == 0 {
				status = "offline"
			} else if latest.Status == 2 {
				status = "degraded"
			}
			if latest.Ping > 0 {
				latency = latest.Ping
			}
		}

		uptimePct := 100.0
		for kStr, pct := range hbResp.UptimeList {
			if strings.HasPrefix(kStr, monID+"_") {
				uptimePct = pct * 100.0
				break
			}
		}

		services = append(services, domain.Service{
			ID:               "kuma-mon-" + monID,
			Name:             "Monitor " + monID,
			Description:      "Uptime Kuma synchronized endpoint",
			URL:              k.cfg.BaseURL,
			Icon:             "activity",
			Category:         "Monitors",
			Tags:             []string{"monitor", "uptimekuma"},
			Status:           status,
			UptimePercentage: uptimePct,
			LatencyMs:        latency,
			IntegrationID:    "uptimekuma",
			IsFavorite:       false,
			CreatedAt:        now,
			UpdatedAt:        now,
		})
	}

	return services, nil
}

func (k *UptimeKumaDriver) SyncHosts(ctx context.Context) ([]domain.Host, error) {
	return []domain.Host{}, nil
}

func (k *UptimeKumaDriver) SyncContainers(ctx context.Context) ([]domain.Container, error) {
	return []domain.Container{}, nil
}

func (k *UptimeKumaDriver) SyncIncidents(ctx context.Context) ([]domain.Incident, error) {
	return []domain.Incident{}, nil
}

func (k *UptimeKumaDriver) SyncRecommendations(ctx context.Context) ([]domain.Recommendation, error) {
	return []domain.Recommendation{}, nil
}
