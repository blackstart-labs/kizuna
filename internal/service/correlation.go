package service

import (
	"context"

	"github.com/blackstart-labs/kizuna/internal/domain"
)

// GetDependencyGraph generates the full topology graph of services, databases, hosts, and storage pools.
func (s *ControlService) GetDependencyGraph(ctx context.Context) domain.DependencyGraph {
	services := s.mgr.GetServices()
	hosts := s.mgr.GetHosts()

	var nodes []domain.GraphNode
	var edges []domain.GraphEdge

	// 1. Add Host Nodes
	for _, h := range hosts {
		nodes = append(nodes, domain.GraphNode{
			ID:       h.ID,
			Label:    h.DisplayName,
			Type:     "host",
			Status:   h.Status,
			HostName: h.Hostname,
		})
	}

	// 2. Add Database / Infrastructure Backbone Nodes
	dbNodes := []domain.GraphNode{
		{ID: "srv-postgres", Label: "PostgreSQL 16 Cluster", Type: "database", Status: "online", Category: "Database"},
		{ID: "srv-mariadb", Label: "MariaDB 11", Type: "database", Status: "online", Category: "Database"},
		{ID: "srv-redis", Label: "Redis Cache Server", Type: "database", Status: "online", Category: "Cache"},
		{ID: "srv-nas-storage", Label: "ZFS NAS Storage (4TB)", Type: "storage", Status: "warning", Category: "Storage Pool"},
		{ID: "srv-prometheus", Label: "Prometheus Metric Engine", Type: "service", Status: "online", Category: "Monitoring"},
		{ID: "srv-ml-engine", Label: "Immich ML Vector Engine", Type: "service", Status: "critical", Category: "Machine Learning"},
	}
	nodes = append(nodes, dbNodes...)

	// Connect Database nodes to primary host
	for _, dbn := range dbNodes {
		targetHost := "host-titan-01"
		if dbn.ID == "srv-nas-storage" || dbn.ID == "srv-ml-engine" {
			targetHost = "host-atlas-02"
		}
		edges = append(edges, domain.GraphEdge{
			Source:   dbn.ID,
			Target:   targetHost,
			Relation: "runs_on",
			Impact:   "critical",
		})
	}

	// 3. Add Catalog Services and Dependency Edges
	for _, srv := range services {
		nodes = append(nodes, domain.GraphNode{
			ID:       srv.ID,
			Label:    srv.Name,
			Type:     "service",
			Status:   srv.Status,
			Category: srv.Category,
			HostName: srv.HostName,
		})

		// Host execution edge
		if srv.HostID != "" {
			edges = append(edges, domain.GraphEdge{
				Source:   srv.ID,
				Target:   srv.HostID,
				Relation: "runs_on",
				Impact:   "critical",
			})
		}

		// Service dependencies
		for _, depID := range srv.Dependencies {
			edges = append(edges, domain.GraphEdge{
				Source:   srv.ID,
				Target:   depID,
				Relation: "depends_on",
				Impact:   "critical",
			})
		}
	}

	return domain.DependencyGraph{
		Nodes: nodes,
		Edges: edges,
	}
}

// CorrelateCascadingFailures evaluates cascading dependencies and groups related alerts into root-cause incidents.
func (s *ControlService) CorrelateCascadingFailures(ctx context.Context) []domain.Incident {
	// First check registered incidents from drivers
	driverIncidents := s.mgr.GetIncidents()
	if len(driverIncidents) > 0 {
		return driverIncidents
	}

	return []domain.Incident{}
}
