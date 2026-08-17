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
	DeviceType     string    `json:"device_type"` // router, host, server, container, workstation, iot, phone, unknown
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
	TotalRxGB     float64   `json:"total_rx_gb"`
	TotalTxGB     float64   `json:"total_tx_gb"`
	Timestamp     time.Time `json:"timestamp"`
}

// NetworkTelemetrySummary provides live overview of network fleet bandwidth, statistics, and clients.
type NetworkTelemetrySummary struct {
	TotalClients      int                      `json:"total_clients"`
	ActiveClients     int                      `json:"active_clients"`
	GatewayIP         string                   `json:"gateway_ip"`
	PrimaryInterface  string                   `json:"primary_interface"`
	TotalRxRateKbps   float64                  `json:"total_rx_rate_kbps"`
	TotalTxRateKbps   float64                  `json:"total_tx_rate_kbps"`
	TotalRxRateMbps   float64                  `json:"total_rx_rate_mbps"`
	TotalTxRateMbps   float64                  `json:"total_tx_rate_mbps"`
	TotalDownloadGB   float64                  `json:"total_download_gb"`
	TotalUploadGB     float64                  `json:"total_upload_gb"`
	Interfaces        []NetworkInterfaceMetric `json:"interfaces"`
	BandwidthHistory  []NetworkThroughputPoint `json:"bandwidth_history"`
	LatestSpeedTest   *SpeedTestResult         `json:"latest_speed_test,omitempty"`
}

// NetworkThroughputPoint represents a historical bandwidth datapoint for Grafana charts.
type NetworkThroughputPoint struct {
	Timestamp  time.Time `json:"timestamp"`
	RxKbps     float64   `json:"rx_kbps"`
	TxKbps     float64   `json:"tx_kbps"`
}

// SpeedTestResult holds the benchmark metrics of an Internet speed test.
type SpeedTestResult struct {
	ID             string    `json:"id"`
	Timestamp      time.Time `json:"timestamp"`
	PingMs         float64   `json:"ping_ms"`
	JitterMs       float64   `json:"jitter_ms"`
	DownloadMbps   float64   `json:"download_mbps"`
	UploadMbps     float64   `json:"upload_mbps"`
	ServerLocation string    `json:"server_location"`
	ISP            string    `json:"isp"`
	Status         string    `json:"status"` // completed, running, failed
}
