package service

import (
	"context"
	"testing"
	"time"

	"github.com/blackstart-labs/kizuna/internal/database"
	"github.com/blackstart-labs/kizuna/internal/domain"
	"github.com/blackstart-labs/kizuna/internal/integration"
)

func TestAlertManagerOperations(t *testing.T) {
	am := NewAlertManager()

	all := am.ListAlerts("")
	if len(all) == 0 {
		t.Errorf("Expected seeded initial alerts, got 0")
	}

	firing := am.ListAlerts("firing")
	if len(firing) == 0 {
		t.Errorf("Expected firing alerts, got 0")
	}

	// Test Acknowledge
	err := am.AcknowledgeAlert("alt-001")
	if err != nil {
		t.Errorf("Failed to ack alert: %v", err)
	}

	// Test Resolve
	err = am.ResolveAlert("alt-001")
	if err != nil {
		t.Errorf("Failed to resolve alert: %v", err)
	}

	// Test Ingest
	am.IngestAlert(domain.Alert{
		Source:      "prometheus",
		Title:       "Test Webhook Alert",
		Description: "Memory threshold breached",
		Severity:    "critical",
		State:       "firing",
		TargetType:  "host",
		TargetID:    "host-test",
		StartedAt:   time.Now(),
	})

	firingAfter := am.ListAlerts("firing")
	if len(firingAfter) == 0 {
		t.Errorf("Expected firing alerts after ingest")
	}
}

func TestHomelabTrendsCalculation(t *testing.T) {
	db, err := database.Connect(":memory:")
	if err != nil {
		t.Fatalf("Failed to connect db: %v", err)
	}
	defer db.Close()

	mgr := integration.NewManager(integration.ManagerConfig{DemoMode: true, DockerSocket: "disabled"})
	svc := NewControlService(db, mgr, "0.1.0-test")

	ctx := context.Background()
	trends := svc.GetHomelabTrends(ctx, 24)

	if len(trends.CPUTrend.Points) == 0 {
		t.Errorf("Expected CPU trend points, got 0")
	}

	if len(trends.MemoryTrend.Points) == 0 {
		t.Errorf("Expected Memory trend points, got 0")
	}

	if len(trends.StorageTrend.Points) == 0 {
		t.Errorf("Expected Storage trend points, got 0")
	}

	if len(trends.LatencyTrend.Points) == 0 {
		t.Errorf("Expected Latency trend points, got 0")
	}
}
