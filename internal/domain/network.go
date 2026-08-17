package domain

import "time"

// NetworkClient represents an active or discovered device on the local network.
type NetworkClient struct {
	ID             string    `json:"id"`
	IP             string    `json:"ip"`
	MAC            string    `json:"mac"`
	Hostname       string    `json:"hostname"`
	Vendor         string    `json:"vendor"`
	Interface      string    `json:"interface"`
	DeviceType     string    `json:"device_type"` // router, host, container, workstation, iot, phone, unknown
	State          string    `json:"state"`       // active, reachable, stale
	IsLocalGateway bool      `json:"is_gateway"`
	LastSeen       time.Time `json:"last_seen"`
}

// NetworkInterfaceMetric represents live bandwidth rate for a network interface.
type NetworkInterfaceMetric struct {
	Interface     string    `json:"interface"`
	RxBytesPerSec float64   `json:"rx_bytes_sec"`
	TxBytesPerSec float64   `json:"tx_bytes_sec"`
	TotalRxBytes  uint64    `json:"total_rx_bytes"`
	TotalTxBytes  uint64    `json:"total_tx_bytes"`
	Timestamp     time.Time `json:"timestamp"`
}

// NetworkTelemetrySummary provides live overview of network fleet bandwidth and clients.
type NetworkTelemetrySummary struct {
	TotalClients      int                      `json:"total_clients"`
	ActiveClients     int                      `json:"active_clients"`
	GatewayIP         string                   `json:"gateway_ip"`
	PrimaryInterface  string                   `json:"primary_interface"`
	TotalRxRateKbps   float64                  `json:"total_rx_rate_kbps"`
	TotalTxRateKbps   float64                  `json:"total_tx_rate_kbps"`
	Interfaces        []NetworkInterfaceMetric `json:"interfaces"`
	BandwidthHistory  []NetworkThroughputPoint `json:"bandwidth_history"`
}

// NetworkThroughputPoint represents a historical bandwidth datapoint for Grafana charts.
type NetworkThroughputPoint struct {
	Timestamp  time.Time `json:"timestamp"`
	RxKbps     float64   `json:"rx_kbps"`
	TxKbps     float64   `json:"tx_kbps"`
}
