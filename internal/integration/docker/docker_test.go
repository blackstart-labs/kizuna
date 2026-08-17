package docker

import (
	"context"
	"testing"
)

func TestDockerDriverAvailability(t *testing.T) {
	driver := New("/non/existent/docker.sock")
	if driver.Name() != "Docker Engine" {
		t.Errorf("Expected driver name 'Docker Engine', got %s", driver.Name())
	}
	if driver.Type() != "docker" {
		t.Errorf("Expected driver type 'docker', got %s", driver.Type())
	}

	if driver.IsAvailable() {
		t.Errorf("Non-existent socket should not be reported as available")
	}

	ctx := context.Background()
	_, err := driver.HealthCheck(ctx)
	if err == nil {
		t.Errorf("Expected healthcheck error on non-existent socket")
	}
}
