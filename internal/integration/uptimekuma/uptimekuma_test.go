package uptimekuma

import (
	"context"
	"testing"
)

func TestUptimeKumaDriverConfig(t *testing.T) {
	driver := New(UptimeKumaConfig{
		BaseURL: "https://kuma.baaankai.dpdns.org",
	})

	if driver.Name() != "Uptime Kuma" {
		t.Errorf("Expected driver name 'Uptime Kuma', got %s", driver.Name())
	}

	if driver.Type() != "uptimekuma" {
		t.Errorf("Expected driver type 'uptimekuma', got %s", driver.Type())
	}

	if !driver.IsConfigured() {
		t.Errorf("Expected driver to be configured")
	}

	unconfigured := New(UptimeKumaConfig{})
	if unconfigured.IsConfigured() {
		t.Errorf("Expected empty driver to NOT be configured")
	}

	ctx := context.Background()
	_, err := unconfigured.HealthCheck(ctx)
	if err == nil {
		t.Errorf("Expected unconfigured healthcheck to fail")
	}
}
