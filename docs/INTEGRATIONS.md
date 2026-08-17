# Kizuna (絆) Integrations Setup Guide

This guide covers connecting Kizuna to Docker, Proxmox VE, Uptime Kuma, and Prometheus.

---

## 1. Native Docker Socket Integration

Kizuna uses a zero-dependency Unix domain socket HTTP client to talk directly with the Docker daemon.

### Configuration
```bash
# Default path (auto-discovered if present)
KIZUNA_DOCKER_SOCKET=/var/run/docker.sock
```

### Docker Compose Mount
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

> [!TIP]
> Kizuna only requires read access for telemetry and container discovery. Write access is only invoked when you explicitly click **Restart**, **Start**, or **Stop** in the UI.

---

## 2. Proxmox VE Integration

Kizuna connects to the Proxmox VE REST API to monitor physical cluster nodes, CPU/RAM utilization, ZFS storage pool occupancy, and LXC container workloads.

### Creating an API Token in Proxmox
1. Open your Proxmox VE Web UI (e.g. `https://192.168.1.100:8006`).
2. Navigate to **Datacenter ➔ Permissions ➔ API Tokens**.
3. Click **Add**:
   - **User**: `root@pam` (or a dedicated monitoring user like `kizuna@pve`)
   - **Token ID**: `kizuna`
   - **Privilege Separation**: Uncheck (or assign `PVEAuditor` role)
4. Copy the generated **Token ID** and **Secret**.

### Environment Variables
```bash
KIZUNA_PROXMOX_URL=https://192.168.1.100:8006
KIZUNA_PROXMOX_TOKEN_ID=root@pam!kizuna
KIZUNA_PROXMOX_TOKEN_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
KIZUNA_PROXMOX_SKIP_VERIFY=true # Set to true if using self-signed Proxmox certificates
```

---

## 3. Uptime Kuma Integration

Kizuna ingests uptime heartbeats, monitor statuses, and ping response times from your Uptime Kuma instance.

### Configuration
```bash
KIZUNA_UPTIME_KUMA_URL=https://status.yourdomain.com
```

---

## 4. Prometheus Webhook Alerts Ingestion

You can configure Prometheus Alertmanager to push firing alerts directly into Kizuna's unified alert stream.

### Alertmanager Configuration (`alertmanager.yml`)
```yaml
receivers:
  - name: 'kizuna'
    webhook_configs:
      - url: 'http://<kizuna-ip>:8080/api/v1/alerts/webhook'
        send_resolved: true
```
