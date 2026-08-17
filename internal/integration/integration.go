package integration

import (
	"context"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

// Driver defines the lifecycle and synchronization contract for external infrastructure providers.
type Driver interface {
	Name() string
	Type() string
	HealthCheck(ctx context.Context) (bool, error)
	SyncServices(ctx context.Context) ([]domain.Service, error)
	SyncHosts(ctx context.Context) ([]domain.Host, error)
	SyncContainers(ctx context.Context) ([]domain.Container, error)
	SyncIncidents(ctx context.Context) ([]domain.Incident, error)
	SyncRecommendations(ctx context.Context) ([]domain.Recommendation, error)
}
