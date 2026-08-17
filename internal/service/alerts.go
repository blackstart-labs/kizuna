package service

import (
	"fmt"
	"sync"
	"time"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

type AlertManager struct {
	mu     sync.RWMutex
	alerts map[string]domain.Alert
}

func NewAlertManager() *AlertManager {
	now := time.Now()
	am := &AlertManager{
		alerts: make(map[string]domain.Alert),
	}

	// Seed initial active alerts for demo/default monitoring
	am.alerts["alt-001"] = domain.Alert{
		ID:          "alt-001",
		Source:      "proxmox",
		Title:       "High Storage Usage on atlas-proxmox",
		Description: "ZFS root pool capacity exceeded 90% threshold (currently 91.0%).",
		Severity:    "warning",
		State:       "firing",
		TargetType:  "host",
		TargetID:    "host-atlas-02",
		StartedAt:   now.Add(-2 * time.Hour),
	}

	am.alerts["alt-002"] = domain.Alert{
		ID:          "alt-002",
		Source:      "docker",
		Title:       "Crash Loop on Container immich-ml-worker",
		Description: "Container restarted 17 times in the last 6 hours due to memory limit saturation.",
		Severity:    "critical",
		State:       "firing",
		TargetType:  "container",
		TargetID:    "cnt-flapping-worker",
		StartedAt:   now.Add(-4 * time.Hour),
	}

	return am
}

func (am *AlertManager) ListAlerts(state string) []domain.Alert {
	am.mu.RLock()
	defer am.mu.RUnlock()

	var results []domain.Alert
	for _, a := range am.alerts {
		if state == "" || a.State == state {
			results = append(results, a)
		}
	}
	return results
}

func (am *AlertManager) AcknowledgeAlert(id string) error {
	am.mu.Lock()
	defer am.mu.Unlock()

	alert, exists := am.alerts[id]
	if !exists {
		return fmt.Errorf("alert not found: %s", id)
	}

	alert.State = "acknowledged"
	am.alerts[id] = alert
	return nil
}

func (am *AlertManager) ResolveAlert(id string) error {
	am.mu.Lock()
	defer am.mu.Unlock()

	alert, exists := am.alerts[id]
	if !exists {
		return fmt.Errorf("alert not found: %s", id)
	}

	now := time.Now()
	alert.State = "resolved"
	alert.ResolvedAt = &now
	am.alerts[id] = alert
	return nil
}

func (am *AlertManager) IngestAlert(alert domain.Alert) {
	am.mu.Lock()
	defer am.mu.Unlock()

	if alert.ID == "" {
		alert.ID = fmt.Sprintf("alt-ext-%d", time.Now().UnixNano())
	}
	if alert.StartedAt.IsZero() {
		alert.StartedAt = time.Now()
	}
	if alert.State == "" {
		alert.State = "firing"
	}
	am.alerts[alert.ID] = alert
}
