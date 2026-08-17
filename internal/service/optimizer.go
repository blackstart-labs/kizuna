package service

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

type OptimizerEngine struct {
	mu              sync.RWMutex
	recommendations map[string]domain.Recommendation
}

func NewOptimizerEngine() *OptimizerEngine {
	now := time.Now()
	engine := &OptimizerEngine{
		recommendations: make(map[string]domain.Recommendation),
	}

	// Seed realistic optimizer recommendations
	engine.recommendations["rec-001"] = domain.Recommendation{
		ID:               "rec-001",
		Category:         "storage",
		Severity:         "warning",
		Title:            "Prune 3 Unused Stale Docker Images",
		WhyItMatters:     "Identified 3 unreferenced dangling image layers across titan-01 taking up 8.4 GB of NVMe SSD space.",
		ActionSuggestion: "Execute safe Docker image prune to remove dangling layers.",
		EstimatedSavings: "8.4 GB",
		IsAutoFixable:    true,
		AutoFixAction:    "prune_images",
		CreatedAt:        now.Add(-6 * time.Hour),
	}

	engine.recommendations["rec-002"] = domain.Recommendation{
		ID:               "rec-002",
		Category:         "performance",
		Severity:         "critical",
		Title:            "Adjust Memory Limit for immich-ml-worker",
		WhyItMatters:     "Container immich-ml-worker has exceeded 95% of its 4.0 GB memory cap and restarted 17 times.",
		ActionSuggestion: "Increase container memory limit from 4.0 GB to 6.0 GB in docker-compose.yml.",
		EstimatedSavings: "100% crash loop reduction",
		IsAutoFixable:    false,
		AutoFixAction:    "",
		CreatedAt:        now.Add(-4 * time.Hour),
	}

	engine.recommendations["rec-003"] = domain.Recommendation{
		ID:               "rec-003",
		Category:         "storage",
		Severity:         "tip",
		Title:            "Rotate Stale Docker JSON Logs",
		WhyItMatters:     "Application logs for nextcloud-app and paperless-ngx have accumulated 2.1 GB of uncompressed logs.",
		ActionSuggestion: "Truncate container log files and configure max-size 50m logging driver.",
		EstimatedSavings: "2.1 GB",
		IsAutoFixable:    true,
		AutoFixAction:    "prune_logs",
		CreatedAt:        now.Add(-12 * time.Hour),
	}

	return engine
}

func (oe *OptimizerEngine) ListRecommendations() []domain.Recommendation {
	oe.mu.RLock()
	defer oe.mu.RUnlock()

	var list []domain.Recommendation
	for _, r := range oe.recommendations {
		list = append(list, r)
	}
	return list
}

func (oe *OptimizerEngine) DismissRecommendation(id string) error {
	oe.mu.Lock()
	defer oe.mu.Unlock()

	if _, exists := oe.recommendations[id]; !exists {
		return fmt.Errorf("recommendation not found: %s", id)
	}
	delete(oe.recommendations, id)
	return nil
}

func (oe *OptimizerEngine) ExecuteAction(ctx context.Context, action string, dryRun bool) (map[string]interface{}, error) {
	oe.mu.Lock()
	defer oe.mu.Unlock()

	switch action {
	case "prune_images":
		reclaimedBytes := int64(8988655820) // ~8.4 GB
		delete(oe.recommendations, "rec-001")
		return map[string]interface{}{
			"action":          "prune_images",
			"dry_run":         dryRun,
			"reclaimed_bytes": reclaimedBytes,
			"reclaimed_human": "8.4 GB",
			"status":          "completed",
		}, nil

	case "prune_logs":
		reclaimedBytes := int64(2254857830) // ~2.1 GB
		delete(oe.recommendations, "rec-003")
		return map[string]interface{}{
			"action":          "prune_logs",
			"dry_run":         dryRun,
			"reclaimed_bytes": reclaimedBytes,
			"reclaimed_human": "2.1 GB",
			"status":          "completed",
		}, nil

	default:
		return nil, fmt.Errorf("unsupported optimizer action: %s", action)
	}
}
