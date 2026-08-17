package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/blackstart-labs/kizuna/internal/service"
)

type APIHandler struct {
	svc *service.ControlService
}

func NewAPIHandler(svc *service.ControlService) *APIHandler {
	return &APIHandler{svc: svc}
}

func (h *APIHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status":    "healthy",
		"component": "kizuna-control-plane",
	})
}

func (h *APIHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	summary := h.svc.GetHealthSummary(r.Context())
	respondJSON(w, http.StatusOK, summary)
}

func (h *APIHandler) ListServices(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	services := h.svc.ListServices(category)
	respondJSON(w, http.StatusOK, services)
}

func (h *APIHandler) ListHosts(w http.ResponseWriter, r *http.Request) {
	hosts := h.svc.ListHosts()
	respondJSON(w, http.StatusOK, hosts)
}

func (h *APIHandler) ListContainers(w http.ResponseWriter, r *http.Request) {
	containers := h.svc.ListContainers()
	respondJSON(w, http.StatusOK, containers)
}

func (h *APIHandler) ListIncidents(w http.ResponseWriter, r *http.Request) {
	incidents := h.svc.ListIncidents()
	respondJSON(w, http.StatusOK, incidents)
}

func (h *APIHandler) ListRecommendations(w http.ResponseWriter, r *http.Request) {
	recommendations := h.svc.ListRecommendations()
	respondJSON(w, http.StatusOK, recommendations)
}

func (h *APIHandler) GetSelfMetrics(w http.ResponseWriter, r *http.Request) {
	metrics := h.svc.GetSelfMetrics()
	respondJSON(w, http.StatusOK, metrics)
}

func (h *APIHandler) GlobalSearch(w http.ResponseWriter, r *http.Request) {
	query := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	if query == "" {
		respondJSON(w, http.StatusOK, []interface{}{})
		return
	}

	type SearchResult struct {
		ID          string `json:"id"`
		Type        string `json:"type"` // "service", "host", "container", "incident"
		Title       string `json:"title"`
		Subtitle    string `json:"subtitle"`
		URL         string `json:"url,omitempty"`
		Status      string `json:"status,omitempty"`
	}

	var results []SearchResult

	// Search Services
	for _, srv := range h.svc.ListServices("") {
		if strings.Contains(strings.ToLower(srv.Name), query) || strings.Contains(strings.ToLower(srv.Category), query) || strings.Contains(strings.ToLower(srv.Description), query) {
			results = append(results, SearchResult{
				ID:       srv.ID,
				Type:     "service",
				Title:    srv.Name,
				Subtitle: srv.Category + " · " + srv.URL,
				URL:      srv.URL,
				Status:   srv.Status,
			})
		}
	}

	// Search Hosts
	for _, hst := range h.svc.ListHosts() {
		if strings.Contains(strings.ToLower(hst.DisplayName), query) || strings.Contains(strings.ToLower(hst.Hostname), query) || strings.Contains(strings.ToLower(hst.IPAddress), query) {
			results = append(results, SearchResult{
				ID:       hst.ID,
				Type:     "host",
				Title:    hst.DisplayName,
				Subtitle: hst.IPAddress + " (" + hst.OSName + ")",
				Status:   hst.Status,
			})
		}
	}

	// Search Containers
	for _, cnt := range h.svc.ListContainers() {
		if strings.Contains(strings.ToLower(cnt.Name), query) || strings.Contains(strings.ToLower(cnt.Image), query) {
			results = append(results, SearchResult{
				ID:       cnt.ID,
				Type:     "container",
				Title:    cnt.Name,
				Subtitle: cnt.Image + " · " + cnt.Status,
				Status:   cnt.State,
			})
		}
	}

	respondJSON(w, http.StatusOK, results)
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
