# Kizuna (絆) User Manual

Welcome to **Kizuna**, your unified homelab control plane. This manual guides you through using all built-in features.

---

## 📑 Table of Contents
1. [Overview & Grafana-Style Live Dashboards](#1-overview--grafana-style-live-dashboards)
2. [Command Palette (⌘K)](#2-command-palette-k)
3. [Service Catalog](#3-service-catalog)
4. [Hosts & Physical Nodes](#4-hosts--physical-nodes)
5. [Container Workloads & Actions](#5-container-workloads--actions)
6. [Connected Network Clients & ARP Discovery](#6-connected-network-clients--arp-discovery)
7. [Topology Graph & Blast Radius](#7-topology-graph--blast-radius)
8. [Alerts & Incidents Management](#8-alerts--incidents-management)
9. [Resource Optimizer & Dry-Run Mode](#9-resource-optimizer--dry-run-mode)
10. [Reverse Proxy & Cloudflare Tunnel Setup](#10-reverse-proxy--cloudflare-tunnel-setup)

---

## 1. Overview & Grafana-Style Live Dashboards
The **Homelab Overview** provides an instant answer to *"Is my homelab okay?"*:
- **Online Services Metric**: Availability of all registered reverse proxy targets.
- **Physical Nodes**: Hypervisor health and memory pressure.
- **Active Firing Alerts**: Real-time alerts with one-click **Ack** and **Resolve** controls.
- **Grafana-Style Live Telemetry Panels**: Multi-series SVG area charts with live gradients, crosshairs, hover tooltips, and Min/Max/Avg statistical telemetry panels for Fleet CPU, RAM Pressure, Storage Occupancy, and Real-Time Network Bandwidth.
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

## 6. Connected Network Clients & ARP Discovery
Discover and inspect all active devices across your local subnet and Docker virtual networks:
- **Real Kernel Discovery**: Parses Linux `/proc/net/arp` and `/proc/net/dev` without artificial mock datasets.
- **Client Metadata**: Discovers Device Hostname, LAN IP address, MAC address, Hardware Manufacturer (Apple, Raspberry Pi, ASUS, Espressif IoT, Intel, Realtek), and Network Interface.
- **Device Classification**: Automatic categorizing into **Router**, **Server / Host**, **Container**, **Workstation**, **Phone**, and **IoT Devices**.
- **Real-Time Bandwidth**: Live Ingress (RX) and Egress (TX) bandwidth telemetry visualized in a Grafana-style dual-series area panel.
- **Search & Filters**: Instant search by IP, MAC, hostname, or vendor prefix.

---

## 7. Topology Graph & Blast Radius
Understand multi-tiered relationships between physical nodes, database clusters, and user applications:
- Click on any **Host**, **Database** (e.g. PostgreSQL, Redis), or **Storage Pool** (ZFS).
- Kizuna automatically calculates and displays the **Outage Blast Radius**, highlighting all downstream services that would fail if that component went down.

---

## 8. Alerts & Incidents Management
- **Alert Stream**: Ingests alerts from Prometheus, Docker, Proxmox, and Uptime Kuma.
- **Cascade Timeline**: View the exact chronological trigger of cascading failures (e.g., cgroup memory limit ➔ OOM kill ➔ Docker restart loop).
- Mark incidents as mitigated or resolved once addressed.

---

## 9. Resource Optimizer & Dry-Run Mode
The **Resource Intelligence & Waste Optimizer** identifies reclaimable space:
- **Dangling Docker Images**: Identifies unreferenced image layers and calculates reclaimable SSD storage.
- **Dry-Run Simulation Toggle**: Check the *Dry-Run Simulation Mode* box to safely simulate a cleanup before executing any disk operations.
- **Zero Overhead**: Runs purely in-memory (< 1.2 MB RAM) with zero disk database footprint.
- **Dismiss**: Ignore intentional configurations with a single click.

---

## 10. Reverse Proxy & Cloudflare Tunnel Setup

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
