package network

import (
	"bufio"
	"context"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

// NetworkDriver scans the Linux ARP table, interface throughput, and executes internet speed tests.
type NetworkDriver struct {
	mu              sync.RWMutex
	prevNetStats    map[string]netDevSample
	prevSampleAt    time.Time
	dnsCache        map[string]string
	containerLookup func(ip, mac string) string
	speedEngine     *SpeedTestEngine
	latestSpeedTest *domain.SpeedTestResult
}

type netDevSample struct {
	rxBytes uint64
	txBytes uint64
}

// NewNetworkDriver initializes the network discovery and bandwidth driver.
func NewNetworkDriver() *NetworkDriver {
	return &NetworkDriver{
		prevNetStats: make(map[string]netDevSample),
		dnsCache:     make(map[string]string),
		speedEngine:  NewSpeedTestEngine(),
	}
}

func (d *NetworkDriver) SetContainerLookup(fn func(ip, mac string) string) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.containerLookup = fn
}

func (d *NetworkDriver) Name() string {
	return "network"
}

func (d *NetworkDriver) Type() string {
	return "network"
}

func (d *NetworkDriver) HealthCheck(ctx context.Context) (bool, error) {
	return true, nil
}

func (d *NetworkDriver) SyncServices(ctx context.Context) ([]domain.Service, error) {
	return []domain.Service{}, nil
}

func (d *NetworkDriver) SyncHosts(ctx context.Context) ([]domain.Host, error) {
	return []domain.Host{}, nil
}

func (d *NetworkDriver) SyncContainers(ctx context.Context) ([]domain.Container, error) {
	return []domain.Container{}, nil
}

func (d *NetworkDriver) SyncIncidents(ctx context.Context) ([]domain.Incident, error) {
	return []domain.Incident{}, nil
}

func (d *NetworkDriver) SyncRecommendations(ctx context.Context) ([]domain.Recommendation, error) {
	return []domain.Recommendation{}, nil
}

// ScanClients parses /proc/net/arp to return all discovered network devices.
func (d *NetworkDriver) ScanClients(ctx context.Context) ([]domain.NetworkClient, error) {
	file, err := os.Open("/proc/net/arp")
	if err != nil {
		// Fallback for non-Linux or restricted environments
		return d.getFallbackClients(), nil
	}
	defer file.Close()

	var clients []domain.NetworkClient
	scanner := bufio.NewScanner(file)

	// Skip header line
	if scanner.Scan() {
		_ = scanner.Text()
	}

	now := time.Now()

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		fields := strings.Fields(line)
		if len(fields) < 6 {
			continue
		}

		ip := fields[0]
		flags := fields[2]
		mac := strings.ToLower(fields[3])
		iface := fields[5]

		// Skip incomplete entries (flags 0x0 or 00:00:00:00:00:00)
		if flags == "0x0" || mac == "00:00:00:00:00:00" {
			continue
		}

		// Identify vendor from MAC OUI prefix
		vendor := d.identifyVendor(mac, iface)

		// Resolve device hostname with container lookup, local router DNS, and heuristics
		hostname := d.resolveHostname(ip, mac, iface, vendor)

		// Classify device type
		devType, isGateway := d.classifyDevice(ip, iface, vendor, hostname)

		clientID := fmt.Sprintf("net-%s", strings.ReplaceAll(mac, ":", ""))

		clients = append(clients, domain.NetworkClient{
			ID:             clientID,
			IP:             ip,
			MAC:            mac,
			Hostname:       hostname,
			Vendor:         vendor,
			Interface:      iface,
			DeviceType:     devType,
			State:          "active",
			IsLocalGateway: isGateway,
			LastSeen:       now,
		})
	}

	if len(clients) == 0 {
		return d.getFallbackClients(), nil
	}

	return clients, nil
}

// GetThroughput reads /proc/net/dev and calculates live RX/TX transfer rates.
func (d *NetworkDriver) GetThroughput(ctx context.Context) ([]domain.NetworkInterfaceMetric, error) {
	file, err := os.Open("/proc/net/dev")
	if err != nil {
		return []domain.NetworkInterfaceMetric{}, nil
	}
	defer file.Close()

	d.mu.Lock()
	defer d.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(d.prevSampleAt).Seconds()
	if elapsed <= 0 {
		elapsed = 1.0
	}

	currentStats := make(map[string]netDevSample)
	var metrics []domain.NetworkInterfaceMetric

	scanner := bufio.NewScanner(file)
	// Skip the 2 header lines
	for i := 0; i < 2 && scanner.Scan(); i++ {
		_ = scanner.Text()
	}

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		parts := strings.Split(line, ":")
		if len(parts) != 2 {
			continue
		}

		iface := strings.TrimSpace(parts[0])
		if iface == "lo" {
			continue // Skip loopback
		}

		fields := strings.Fields(parts[1])
		if len(fields) < 16 {
			continue
		}

		rxBytes, _ := strconv.ParseUint(fields[0], 10, 64)
		txBytes, _ := strconv.ParseUint(fields[8], 10, 64)

		currentStats[iface] = netDevSample{rxBytes: rxBytes, txBytes: txBytes}

		var rxRate, txRate float64
		if prev, ok := d.prevNetStats[iface]; ok && d.prevSampleAt.Unix() > 0 {
			if rxBytes >= prev.rxBytes {
				rxRate = float64(rxBytes-prev.rxBytes) / elapsed
			}
			if txBytes >= prev.txBytes {
				txRate = float64(txBytes-prev.txBytes) / elapsed
			}
		}

		metrics = append(metrics, domain.NetworkInterfaceMetric{
			Interface:     iface,
			RxBytesPerSec: rxRate,
			TxBytesPerSec: txRate,
			TotalRxBytes:  rxBytes,
			TotalTxBytes:  txBytes,
			TotalRxGB:     float64(rxBytes) / (1024 * 1024 * 1024),
			TotalTxGB:     float64(txBytes) / (1024 * 1024 * 1024),
			Timestamp:     now,
		})
	}

	d.prevNetStats = currentStats
	d.prevSampleAt = now

	return metrics, nil
}

// RunSpeedTest runs a benchmark speed test and caches the result.
func (d *NetworkDriver) RunSpeedTest(ctx context.Context) (*domain.SpeedTestResult, error) {
	res, err := d.speedEngine.Run(ctx)
	if err != nil {
		return nil, err
	}
	d.mu.Lock()
	d.latestSpeedTest = res
	d.mu.Unlock()
	return res, nil
}

func (d *NetworkDriver) GetLatestSpeedTest() *domain.SpeedTestResult {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.latestSpeedTest
}

func (d *NetworkDriver) resolveHostname(ip, mac, iface, vendor string) string {
	d.mu.Lock()
	defer d.mu.Unlock()

	// 1. Check if it is a running Docker container name
	if d.containerLookup != nil {
		if cntName := d.containerLookup(ip, mac); cntName != "" {
			d.dnsCache[ip] = cntName
			return cntName
		}
	}

	// 2. Check DNS cache
	if name, found := d.dnsCache[ip]; found {
		return name
	}

	// 3. Gateway Router recognition
	if ip == "192.168.1.1" || ip == "10.0.0.1" || ip == "192.168.0.1" {
		name := "router.asus.com"
		if !strings.Contains(vendor, "ASUS") {
			name = fmt.Sprintf("%s Gateway", vendor)
		}
		d.dnsCache[ip] = name
		return name
	}

	// 4. Reverse DNS PTR lookup via local router resolver (Option 12 DHCP hostname)
	resolver := &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
			d := net.Dialer{Timeout: 300 * time.Millisecond}
			return d.DialContext(ctx, "udp", "192.168.1.1:53")
		},
	}
	names, err := resolver.LookupAddr(context.Background(), ip)
	if err == nil && len(names) > 0 {
		cleanName := strings.TrimSuffix(names[0], ".")
		d.dnsCache[ip] = cleanName
		return cleanName
	}

	// 5. Standard net.LookupAddr fallback
	stdNames, err := net.LookupAddr(ip)
	if err == nil && len(stdNames) > 0 {
		cleanName := strings.TrimSuffix(stdNames[0], ".")
		d.dnsCache[ip] = cleanName
		return cleanName
	}

	// 6. Friendly descriptive device name using Vendor and IP
	var name string
	if strings.HasPrefix(iface, "br-") || strings.HasPrefix(iface, "docker") {
		name = fmt.Sprintf("container-%s", strings.ReplaceAll(ip, ".", "-"))
	} else {
		name = fmt.Sprintf("%s (%s)", vendor, ip)
	}

	d.dnsCache[ip] = name
	return name
}

func (d *NetworkDriver) identifyVendor(mac string, iface string) string {
	if strings.HasPrefix(iface, "br-") || strings.HasPrefix(iface, "docker") {
		return "Docker Virtual Bridge"
	}
	if strings.HasPrefix(iface, "virbr") {
		return "KVM / QEMU Bridge"
	}

	cleanMAC := strings.ToUpper(strings.ReplaceAll(mac, ":", ""))
	if len(cleanMAC) < 6 {
		return "Generic Network Device"
	}
	prefix := cleanMAC[:6]

	switch {
	case strings.HasPrefix(prefix, "04D4C4"), strings.HasPrefix(prefix, "3822D6"), strings.HasPrefix(prefix, "001A2B"):
		return "ASUS Router / Networking"
	case strings.HasPrefix(prefix, "E45F01"), strings.HasPrefix(prefix, "B827EB"), strings.HasPrefix(prefix, "DCA632"):
		return "Raspberry Pi Foundation"
	case strings.HasPrefix(prefix, "00155D"):
		return "Microsoft Hyper-V"
	case strings.HasPrefix(prefix, "525400"):
		return "QEMU Virtual Network"
	case strings.HasPrefix(prefix, "080027"):
		return "Oracle VirtualBox"
	case strings.HasPrefix(prefix, "000C29"), strings.HasPrefix(prefix, "005056"):
		return "VMware Virtual Device"
	case strings.HasPrefix(prefix, "240AC4"), strings.HasPrefix(prefix, "30AEA4"), strings.HasPrefix(prefix, "84F3EB"):
		return "Espressif IoT (ESP32/ESP8266)"
	case strings.HasPrefix(prefix, "A483E7"), strings.HasPrefix(prefix, "3C22FB"), strings.HasPrefix(prefix, "F01898"), strings.HasPrefix(prefix, "ACDE48"):
		return "Apple Inc."
	case strings.HasPrefix(prefix, "001E67"), strings.HasPrefix(prefix, "00216A"), strings.HasPrefix(prefix, "6805CA"):
		return "Intel Corporation"
	case strings.HasPrefix(prefix, "00E04C"), strings.HasPrefix(prefix, "525400"):
		return "Realtek Semiconductor"
	case strings.HasPrefix(prefix, "001132"), strings.HasPrefix(prefix, "00089B"):
		return "Synology NAS / Storage"
	case strings.HasPrefix(prefix, "B4FB95"), strings.HasPrefix(prefix, "D858D7"):
		return "TP-Link Networking"
	default:
		if strings.HasPrefix(iface, "wlan") || strings.HasPrefix(iface, "wlx") {
			return "Wireless Client Device"
		}
		return "LAN Ethernet Device"
	}
}

func (d *NetworkDriver) classifyDevice(ip string, iface string, vendor string, hostname string) (string, bool) {
	if ip == "192.168.1.1" || ip == "10.0.0.1" || ip == "192.168.0.1" || strings.HasSuffix(ip, ".1") {
		return "router", true
	}
	if strings.HasPrefix(iface, "br-") || strings.HasPrefix(iface, "docker") {
		return "container", false
	}
	if strings.Contains(strings.ToLower(vendor), "espressif") || strings.Contains(strings.ToLower(hostname), "esp") {
		return "iot", false
	}
	if strings.Contains(strings.ToLower(vendor), "apple") {
		return "phone", false
	}
	if strings.Contains(strings.ToLower(vendor), "raspberry") || strings.Contains(strings.ToLower(vendor), "synology") {
		return "server", false
	}
	return "workstation", false
}

func (d *NetworkDriver) getFallbackClients() []domain.NetworkClient {
	now := time.Now()
	return []domain.NetworkClient{
		{
			ID:             "net-gw-router",
			IP:             "192.168.1.1",
			MAC:            "04:d4:c4:2f:60:34",
			Hostname:       "router.asus.com",
			Vendor:         "ASUS Router / Networking",
			Interface:      "eth0",
			DeviceType:     "router",
			State:          "active",
			IsLocalGateway: true,
			LastSeen:       now,
		},
		{
			ID:             "net-local-host",
			IP:             "127.0.0.1",
			MAC:            "00:00:00:00:00:01",
			Hostname:       "localhost",
			Vendor:         "Local Loopback",
			Interface:      "lo",
			DeviceType:     "server",
			State:          "active",
			IsLocalGateway: false,
			LastSeen:       now,
		},
	}
}
