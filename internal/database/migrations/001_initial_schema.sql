-- 001_initial_schema.sql
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon TEXT,
    category TEXT NOT NULL,
    tags TEXT,
    host_id TEXT,
    host_name TEXT,
    status TEXT NOT NULL DEFAULT 'unknown',
    uptime_percentage REAL DEFAULT 100.0,
    latency_ms INTEGER DEFAULT 0,
    version TEXT,
    health_endpoint TEXT,
    integration_id TEXT,
    is_favorite INTEGER DEFAULT 0,
    dependencies TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hosts (
    id TEXT PRIMARY KEY,
    hostname TEXT NOT NULL,
    display_name TEXT,
    os_name TEXT,
    kernel_version TEXT,
    ip_address TEXT,
    status TEXT NOT NULL DEFAULT 'online',
    cpu_cores INTEGER DEFAULT 0,
    cpu_usage_percent REAL DEFAULT 0.0,
    memory_total_bytes INTEGER DEFAULT 0,
    memory_used_bytes INTEGER DEFAULT 0,
    disk_total_bytes INTEGER DEFAULT 0,
    disk_used_bytes INTEGER DEFAULT 0,
    uptime_seconds INTEGER DEFAULT 0,
    container_count INTEGER DEFAULT 0,
    integration_id TEXT,
    temperature_deg_c REAL DEFAULT 0.0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS containers (
    id TEXT PRIMARY KEY,
    host_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    container_id TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    image_size_bytes INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    state TEXT NOT NULL,
    restart_count INTEGER DEFAULT 0,
    cpu_percent REAL DEFAULT 0.0,
    memory_usage_bytes INTEGER DEFAULT 0,
    memory_limit_bytes INTEGER DEFAULT 0,
    ports TEXT,
    is_waste_candidate INTEGER DEFAULT 0,
    waste_reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    severity TEXT NOT NULL DEFAULT 'warning',
    status TEXT NOT NULL DEFAULT 'active',
    root_cause_type TEXT,
    root_cause_id TEXT,
    impacted_services TEXT,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    incident_id TEXT,
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    metadata_json TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    action_suggestion TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    potential_savings_bytes INTEGER DEFAULT 0,
    is_dismissed INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
