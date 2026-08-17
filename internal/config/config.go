package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port         int
	Host         string
	DBPath       string
	DemoMode     bool
	LogLevel     string
	DataDir      string
	DockerSocket string
	MetricsTTL   int // hours

	// Proxmox VE
	ProxmoxURL         string
	ProxmoxTokenID     string
	ProxmoxTokenSecret string
	ProxmoxSkipVerify  bool

	// Uptime Kuma
	UptimeKumaURL string
	UptimeKumaKey string
}

func Load() *Config {
	port := getEnvInt("KIZUNA_PORT", 8080)
	host := getEnv("KIZUNA_HOST", "0.0.0.0")
	dbPath := getEnv("KIZUNA_DB_PATH", "kizuna.db")
	demoMode := getEnvBool("KIZUNA_DEMO_MODE", false)
	logLevel := getEnv("KIZUNA_LOG_LEVEL", "INFO")
	dataDir := getEnv("KIZUNA_DATA_DIR", "./data")
	dockerSocket := getEnv("KIZUNA_DOCKER_SOCKET", "/var/run/docker.sock")
	metricsTTL := getEnvInt("KIZUNA_METRICS_TTL_HOURS", 48)

	pveURL := getEnv("KIZUNA_PROXMOX_URL", "")
	pveTokenID := getEnv("KIZUNA_PROXMOX_TOKEN_ID", "")
	pveTokenSecret := getEnv("KIZUNA_PROXMOX_TOKEN_SECRET", "")
	pveSkipVerify := getEnvBool("KIZUNA_PROXMOX_SKIP_VERIFY", true)

	kumaURL := getEnv("KIZUNA_UPTIME_KUMA_URL", "")
	kumaKey := getEnv("KIZUNA_UPTIME_KUMA_KEY", "")

	return &Config{
		Port:                port,
		Host:                host,
		DBPath:              dbPath,
		DemoMode:            demoMode,
		LogLevel:            logLevel,
		DataDir:             dataDir,
		DockerSocket:        dockerSocket,
		MetricsTTL:          metricsTTL,
		ProxmoxURL:          pveURL,
		ProxmoxTokenID:      pveTokenID,
		ProxmoxTokenSecret:  pveTokenSecret,
		ProxmoxSkipVerify:   pveSkipVerify,
		UptimeKumaURL:       kumaURL,
		UptimeKumaKey:       kumaKey,
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val, ok := os.LookupEnv(key); ok {
		if intVal, err := strconv.Atoi(val); err == nil {
			return intVal
		}
	}
	return defaultVal
}

func getEnvBool(key string, defaultVal bool) bool {
	if val, ok := os.LookupEnv(key); ok {
		if boolVal, err := strconv.ParseBool(val); err == nil {
			return boolVal
		}
	}
	return defaultVal
}
