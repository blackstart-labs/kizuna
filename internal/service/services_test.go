package service

import (
	"context"
	"testing"

	"github.com/blackstart-labs/kizuna/internal/database"
	"github.com/blackstart-labs/kizuna/internal/integration"
)

func TestGetHealthSummary(t *testing.T) {
	// Create in-memory SQLite database
	db, err := database.Connect(":memory:")
	if err != nil {
		t.Fatalf("Failed to create in-memory db: %v", err)
	}
	defer db.Close()

	mgr := integration.NewManager(true, "disabled") // Demo mode active
	svc := NewControlService(db, mgr, "0.1.0-test")

	ctx := context.Background()
	summary := svc.GetHealthSummary(ctx)

	if summary.TotalServices != 8 {
		t.Errorf("Expected 8 total services in demo mode, got %d", summary.TotalServices)
	}

	if summary.TotalHosts != 4 {
		t.Errorf("Expected 4 total hosts in demo mode, got %d", summary.TotalHosts)
	}

	if summary.RunningContainers == 0 {
		t.Errorf("Expected running containers > 0, got %d", summary.RunningContainers)
	}

	if summary.ActiveIncidents != 2 {
		t.Errorf("Expected 2 active incidents in demo mode, got %d", summary.ActiveIncidents)
	}

	if len(summary.AttentionItems) == 0 {
		t.Errorf("Expected attention items > 0, got %d", len(summary.AttentionItems))
	}

	if summary.Storage.TotalBytes <= 0 {
		t.Errorf("Expected positive storage total bytes, got %d", summary.Storage.TotalBytes)
	}

	metrics := svc.GetSelfMetrics()
	if metrics.Version != "0.1.0-test" {
		t.Errorf("Expected version 0.1.0-test, got %s", metrics.Version)
	}
}

func TestListServicesFiltering(t *testing.T) {
	db, err := database.Connect(":memory:")
	if err != nil {
		t.Fatalf("Failed to create in-memory db: %v", err)
	}
	defer db.Close()

	mgr := integration.NewManager(true, "disabled")
	svc := NewControlService(db, mgr, "0.1.0-test")

	all := svc.ListServices("")
	if len(all) != 8 {
		t.Errorf("Expected 8 services, got %d", len(all))
	}

	monitoring := svc.ListServices("Monitoring")
	if len(monitoring) != 2 {
		t.Errorf("Expected 2 Monitoring services, got %d", len(monitoring))
	}
}
