# 絆 Kizuna

<div align="center">

**"Your homelab. One control plane."**

[![CI](https://github.com/blackstart-labs/kizuna/actions/workflows/ci.yml/badge.svg)](https://github.com/blackstart-labs/kizuna/actions/workflows/ci.yml)
[![Go Report Card](https://goreportcard.com/badge/github.com/blackstart-labs/kizuna)](https://goreportcard.com/report/github.com/blackstart-labs/kizuna)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/blackstart-labs/kizuna?include_prereleases)](https://github.com/blackstart-labs/kizuna/releases)

*A lightweight, single-binary self-hosted control center for the modern homelab.*

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Docker Deployment](#-docker-deployment) • [Documentation](#-documentation)

</div>

---

## 🌟 Vision

**Kizuna (絆)** represents the connection and bond across your homelab infrastructure.

Rather than attempting to replace specialized tools (Grafana, Uptime Kuma, Portainer, Proxmox, TrueNAS), Kizuna acts as the **primary intelligent front door**:
- 🔗 **Integrate** with your existing Docker sockets, hypervisors, and monitors.
- 📊 **Aggregate** service health, storage growth, and resource pressures.
- ⚡ **Correlate** cascading outages into unified, actionable incident timelines.
- 🧹 **Identify Waste** with unreferenced Docker layers, excessive container crash loops, and storage reclaim opportunities.
- 🚀 **Perform Safe Actions** without opening high-privilege raw shell risks.

---

## ⚡ Core Philosophy: Low Footprint, Zero Bloat

- **Single Executable Binary**: React 19 SPA compiled directly into the pure Go binary using `embed.FS`.
- **Ultra-Low Memory**: `< 20 MB` idle RAM footprint.
- **Embedded Database**: Pure Go SQLite with WAL mode (`modernc.org/sqlite` — zero CGO dependencies for seamless cross-compilation on AMD64 & ARM64).
- **No External Message Queues**: Zero Redis, Kafka, or Elasticsearch baggage.

---

## 🚀 Quick Start

### 1. Instant Run with Built-in Demo Mode

Download and test Kizuna immediately without configuring any infrastructure:

```bash
# Run with realistic mock homelab datasets (4 hosts, 16 containers, active incidents)
./kizuna --demo --port 8080
```

Open **http://localhost:8080** in your browser.

---

## 🐳 Docker Deployment

Run with Docker Compose in your homelab:

```yaml
services:
  kizuna:
    image: blackstart-labs/kizuna:latest
    container_name: kizuna
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - KIZUNA_PORT=8080
      - KIZUNA_DB_PATH=/data/kizuna.db
      - KIZUNA_DEMO_MODE=false
      - TZ=Asia/Dhaka
    volumes:
      - ./data:/data
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - homelab

networks:
  homelab:
    name: homelab
    external: true
```

```bash
docker compose up -d
```

---

## ⌨️ Command Palette (`⌘K` / `Ctrl+K`)

Kizuna features a global, keyboard-first command palette. Press `⌘K` or `Ctrl+K` from anywhere in the interface to:
- Jump directly to services, hosts, and container workloads.
- Filter by tags (`#git`, `#media`, `#monitoring`).
- Execute safe management commands.

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│             Kizuna Web SPA (React 19 + Vite)           │
│        (Command Palette · Real-Time Vitals · Dark UI)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP API (/api/v1/*)
┌───────────────────────────▼────────────────────────────┐
│               Kizuna Core Engine (Go Chi)              │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Service Registry · Incident Correlator · Optimizer  │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Integration Manager (Adaptive Polling + Caching)   │ │
│ └──────┬─────────────────┬───────────────────┬───────┘ │
└────────┼─────────────────┼───────────────────┼─────────┘
         ▼                 ▼                   ▼
   Docker Socket       Proxmox VE         Uptime Kuma
```

---

## 🛠️ Development & Building from Source

### Prerequisites
- **Go 1.23+**
- **Node.js 22+** and **pnpm**

```bash
# Clone the repository
git clone https://github.com/blackstart-labs/kizuna.git
cd kizuna

# Run tests
make test

# Build frontend and binary
make build

# Run in dev demo mode
make dev
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening pull requests.

## 🛡️ Security

For vulnerability reporting and Docker socket security guidelines, please see [SECURITY.md](SECURITY.md).

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
