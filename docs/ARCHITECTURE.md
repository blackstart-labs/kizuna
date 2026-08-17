# Kizuna (絆) Technical Architecture Specification

This document details the internal engineering design, execution flow, data model, and memory isolation guarantees of the Kizuna Control Plane.

---

## 1. System Topology & Core Architecture

```
                  +-----------------------------------+
                  |         Kizuna Web UI             |
                  |  (React 19 + TypeScript + Vite)   |
                  +-----------------+-----------------+
                                    | (REST API / SSE)
                                    v
+-----------------------------------------------------------------------+
|                       Kizuna Core Control Plane                       |
|                                                                       |
|   [ Command Palette (⌘K) ]   [ Alert Aggregator ]   [ Optimizer ]     |
|   [ Dependency Graph Engine ] [ Resource Intelligence Engine ]        |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                  Embedded SQLite Database (WAL)               |   |
|   +---------------------------------------------------------------+   |
+--------+--------------------------+--------------------------+--------+
         |                          |                          |
         v                          v                          v
  [ Native Docker ]         [ Proxmox VE API ]         [ Uptime Kuma ]
  /var/run/docker.sock      https://pve-host:8006      Status Telemetry
```

### Core Tenets
1. **Single Binary & Single Container**: Frontend assets are compiled into static distributions and embedded into the Go binary via `embed.FS`.
2. **Pure Go (Zero CGO)**: SQLite is powered by `modernc.org/sqlite` in WAL (Write-Ahead Logging) mode, enabling fully static compilation for AMD64 and ARM64 with `CGO_ENABLED=0`.
3. **Zero Polling Leaks**: Concurrency is managed via bounded goroutine worker pools and channels.

---

## 2. Integration Driver Interface

All external infrastructure providers implement the standard `Driver` interface:

```go
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
```

### Built-in Providers
- **`docker`**: Direct `/var/run/docker.sock` communication over Unix domain sockets using standard library `net/http` (no 3rd-party Docker client baggage).
- **`proxmox`**: HTTPS REST API integration using Proxmox API Tokens (`PVEAPIToken=USER@REALM!TOKENID=SECRET`).
- **`uptimekuma`**: Heartbeat and status-page telemetry ingest.
- **`sensors`**: Linux `/sys/class/thermal` and `/proc/meminfo` ingestion.
- **`demo`**: High-fidelity out-of-the-box demonstration dataset.

---

## 3. Storage & Concurrency Model

- **Database Engine**: Embedded SQLite 3.
- **Journal Mode**: `PRAGMA journal_mode=WAL;`
- **Busy Timeout**: `PRAGMA busy_timeout=5000;`
- **Memory Limit**: Kizuna operates under **< 25 MB resident RAM** across all active goroutines.
