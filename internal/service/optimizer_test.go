package service

import (
	"context"
	"testing"
)

func TestOptimizerEngine(t *testing.T) {
	oe := NewOptimizerEngine()

	recs := oe.ListRecommendations()
	if len(recs) == 0 {
		t.Errorf("Expected seeded recommendations, got 0")
	}

	ctx := context.Background()

	// Test Execute Prune Action
	res, err := oe.ExecuteAction(ctx, "prune_images", false)
	if err != nil {
		t.Fatalf("Failed to execute prune_images: %v", err)
	}

	if res["status"] != "completed" {
		t.Errorf("Expected status 'completed', got %v", res["status"])
	}

	// Test Dismiss
	err = oe.DismissRecommendation("rec-002")
	if err != nil {
		t.Errorf("Failed to dismiss recommendation: %v", err)
	}

	// Verify Dismissed
	for _, r := range oe.ListRecommendations() {
		if r.ID == "rec-002" {
			t.Errorf("rec-002 should have been dismissed")
		}
	}
}
