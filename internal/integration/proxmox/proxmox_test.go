package proxmox

import (
	"context"
	"testing"
)

func TestProxmoxDriverConfig(t *testing.T) {
	driver := New(ProxmoxConfig{
		BaseURL:     "https://192.168.1.100:8006",
		TokenID:     "root@pam!kizuna",
		TokenSecret: "test-secret-uuid",
		SkipVerify:  true,
	})

	if driver.Name() != "Proxmox VE" {
		t.Errorf("Expected driver name 'Proxmox VE', got %s", driver.Name())
	}

	if driver.Type() != "proxmox" {
		t.Errorf("Expected driver type 'proxmox', got %s", driver.Type())
	}

	if !driver.IsConfigured() {
		t.Errorf("Expected driver to be configured")
	}

	unconfigured := New(ProxmoxConfig{})
	if unconfigured.IsConfigured() {
		t.Errorf("Expected empty driver to NOT be configured")
	}

	ctx := context.Background()
	_, err := unconfigured.HealthCheck(ctx)
	if err == nil {
		t.Errorf("Expected unconfigured healthcheck to fail")
	}
}
