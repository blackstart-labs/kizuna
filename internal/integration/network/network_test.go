package network

import (
	"context"
	"testing"
)

func TestNetworkDriverScanning(t *testing.T) {
	driver := NewNetworkDriver()
	if driver.Name() != "network" {
		t.Errorf("Expected driver name 'network', got '%s'", driver.Name())
	}

	ctx := context.Background()
	clients, err := driver.ScanClients(ctx)
	if err != nil {
		t.Fatalf("ScanClients failed: %v", err)
	}

	if len(clients) == 0 {
		t.Errorf("Expected at least 1 network client (either ARP or fallback), got 0")
	}

	for _, c := range clients {
		if c.IP == "" {
			t.Errorf("Client ID %s has empty IP", c.ID)
		}
		if c.MAC == "" {
			t.Errorf("Client IP %s has empty MAC", c.IP)
		}
	}
}

func TestNetworkThroughputCalculation(t *testing.T) {
	driver := NewNetworkDriver()
	ctx := context.Background()

	// Initial reading
	_, err := driver.GetThroughput(ctx)
	if err != nil {
		t.Fatalf("GetThroughput initial reading failed: %v", err)
	}

	// Second reading
	metrics, err := driver.GetThroughput(ctx)
	if err != nil {
		t.Fatalf("GetThroughput second reading failed: %v", err)
	}

	// On Linux environments with active interfaces, metrics should contain items
	t.Logf("Calculated throughput across %d network interfaces", len(metrics))
}

func TestVendorIdentification(t *testing.T) {
	driver := NewNetworkDriver()

	vendor := driver.identifyVendor("04:d4:c4:2f:60:34", "enp4s0")
	if vendor != "ASUS Router / Networking" {
		t.Errorf("Expected ASUS vendor, got '%s'", vendor)
	}

	rpiVendor := driver.identifyVendor("b8:27:eb:12:34:56", "eth0")
	if rpiVendor != "Raspberry Pi Foundation" {
		t.Errorf("Expected Raspberry Pi vendor, got '%s'", rpiVendor)
	}

	dockerVendor := driver.identifyVendor("02:42:ac:11:00:02", "br-c699a0f9cfea")
	if dockerVendor != "Docker Virtual Bridge" {
		t.Errorf("Expected Docker Virtual Bridge, got '%s'", dockerVendor)
	}
}
