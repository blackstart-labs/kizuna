package service

import (
	"context"
	"testing"

	"github.com/blackstart-labs/kizuna/internal/database"
	"github.com/blackstart-labs/kizuna/internal/integration"
)

func TestDependencyGraphGeneration(t *testing.T) {
	db, err := database.Connect(":memory:")
	if err != nil {
		t.Fatalf("Failed to create in-memory db: %v", err)
	}
	defer db.Close()

	mgr := integration.NewManager(integration.ManagerConfig{DemoMode: true, DockerSocket: "disabled"})
	svc := NewControlService(db, mgr, "0.1.0-test")

	ctx := context.Background()
	graph := svc.GetDependencyGraph(ctx)

	if len(graph.Nodes) == 0 {
		t.Errorf("Expected dependency graph nodes, got 0")
	}

	if len(graph.Edges) == 0 {
		t.Errorf("Expected dependency graph edges, got 0")
	}

	// Verify database backbone nodes are present
	foundPostgres := false
	for _, n := range graph.Nodes {
		if n.ID == "srv-postgres" {
			foundPostgres = true
			break
		}
	}

	if !foundPostgres {
		t.Errorf("Expected PostgreSQL backbone node in graph")
	}
}
