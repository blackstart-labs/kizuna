# Kizuna (絆) User Manual

Welcome to **Kizuna**, your unified homelab control plane. This manual guides you through using all built-in features.

---

## 📑 Table of Contents
1. [Overview & Dashboard](#1-overview--dashboard)
2. [Command Palette (⌘K)](#2-command-palette-k)
3. [Service Catalog](#3-service-catalog)
4. [Hosts & Physical Nodes](#4-hosts--physical-nodes)
5. [Container Workloads & Actions](#5-container-workloads--actions)
6. [Topology Graph & Blast Radius](#6-topology-graph--blast-radius)
7. [Alerts & Incidents Management](#7-alerts--incidents-management)
8. [Resource Optimizer & Dry-Run Mode](#8-resource-optimizer--dry-run-mode)
9. [Reverse Proxy & Cloudflare Tunnel Setup](#9-reverse-proxy--cloudflare-tunnel-setup)

---

## 1. Overview & Dashboard
The **Homelab Overview** provides an instant answer to *"Is my homelab okay?"*:
- **Online Services Metric**: Availability of all registered reverse proxy targets.
- **Physical Nodes**: Hypervisor health and memory pressure.
- **Active Firing Alerts**: Real-time alerts with one-click **Ack** and **Resolve** controls.
- **24-Hour Telemetry Sparklines**: Historical CPU, RAM, Storage, and Response Latency curves.
- **Storage Intelligence Bar**: Total, used, and recoverable storage across disks and Docker image layers.

---

## 2. Command Palette (⌘K)
Press `⌘K` (macOS) or `Ctrl+K` (Linux/Windows) anywhere in the application to open the global search palette:
- Search services by name, category, or URL.
- Jump directly to physical hosts, containers, or active incidents.
- Navigate between tabs instantly without taking your hands off the keyboard.

---

## 3. Service Catalog
The **Services** view aggregates applications into curated categories (*Media, Cloud, Automation, Productivity, Monitoring, Infrastructure*).
- Click any service card to open its web interface directly in a new tab.
- Live status indicators show real-time uptime percentage and response latency.

---

## 4. Hosts & Physical Nodes
Track physical hardware, bare-metal servers, and Proxmox VE hypervisors:
- Real-time CPU cores and utilization.
- Resident memory pressure vs total allocated RAM.
- CPU hardware thermal readings (°C).
- Host IP addresses and OS kernel versions.

---

## 5. Container Workloads & Actions
Inspect all Docker containers and Proxmox LXC containers:
- **Restart Container**: Triggers safe restart with immediate visual loading feedback.
- **Stop Container**: Includes an explicit **Confirm Stop** safety guard to prevent accidental service disruption.
- **Start Container**: Initiates stopped or idle containers.
- **Restarts Counter**: Highlights flapping containers that restart continuously.

---

## 6. Topology Graph & Blast Radius
Understand multi-tiered relationships between physical nodes, database clusters, and user applications:
- Click on any **Host**, **Database** (e.g. PostgreSQL, Redis), or **Storage Pool** (ZFS).
- Kizuna automatically calculates and displays the **Outage Blast Radius**, highlighting all downstream services that would fail if that component went down.

---

## 7. Alerts & Incidents Management
- **Alert Stream**: Ingests alerts from Prometheus, Docker, Proxmox, and Uptime Kuma.
- **Cascade Timeline**: View the exact chronological trigger of cascading failures (e.g., cgroup memory limit ➔ OOM kill ➔ Docker restart loop).
- Mark incidents as mitigated or resolved once addressed.

---

## 8. Resource Optimizer & Dry-Run Mode
The **Resource Intelligence & Waste Optimizer** identifies reclaimable space:
- **Dangling Docker Images**: Identifies unreferenced image layers and calculates reclaimable SSD storage.
- **Dry-Run Simulation Toggle**: Check the *Dry-Run Simulation Mode* box to safely simulate a cleanup before executing any disk operations.
- **Zero Overhead**: Runs purely in-memory (< 1.2 MB RAM) with zero disk database footprint.
- **Dismiss**: Ignore intentional configurations with a single click.

---

## 9. Reverse Proxy & Cloudflare Tunnel Setup

### Deterministic Port Configuration
Kizuna strictly binds to the exact port configured, ensuring reliable integration with **Cloudflare Tunnels (`cloudflared`)**, **Nginx**, **Caddy**, **Traefik**, or **Tailscale**:
- Default port: `8080` (or configured via `-port <number>` or `KIZUNA_PORT=<number>`).
- If the port is already occupied, Kizuna fails fast with clear diagnostic instructions rather than silently shifting to a different port, preventing broken reverse proxy connections.

```bash
# Custom port configuration for Cloudflare Tunnel / Reverse Proxy
./bin/kizuna --port 3030

# Or via environment variable:
KIZUNA_PORT=3030 ./bin/kizuna
```
