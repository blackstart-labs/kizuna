package sensors

import (
	"context"
	"testing"
)

func TestHostSensorsDriver(t *testing.T) {
	d := New()

	if d.Name() != "Host Hardware Sensors" {
		t.Errorf("Expected driver name 'Host Hardware Sensors', got %s", d.Name())
	}

	if d.Type() != "sensors" {
		t.Errorf("Expected driver type 'sensors', got %s", d.Type())
	}

	ctx := context.Background()
	ok, err := d.HealthCheck(ctx)
	if !ok || err != nil {
		t.Errorf("Healthcheck failed: %v", err)
	}

	temp, err := d.ReadCPUTemperature()
	if err != nil {
		t.Errorf("ReadCPUTemperature failed: %v", err)
	}
	if temp <= 0 {
		t.Errorf("Expected positive CPU temperature, got %f", temp)
	}

	hosts, err := d.SyncHosts(ctx)
	if err != nil || len(hosts) == 0 {
		t.Fatalf("SyncHosts failed: %v", err)
	}

	if hosts[0].TemperatureDegC <= 0 {
		t.Errorf("Expected host temperature to be populated")
	}
}
