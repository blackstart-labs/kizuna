package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/blackstart-labs/kizuna/internal/database"
	"github.com/blackstart-labs/kizuna/internal/domain"
	"github.com/blackstart-labs/kizuna/internal/integration"
	"github.com/blackstart-labs/kizuna/internal/service"
	"github.com/go-chi/chi/v5"
)

func setupTestHandler(t *testing.T) *APIHandler {
	db, err := database.Connect(":memory:")
	if err != nil {
		t.Fatalf("Failed to create in-memory db: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	mgr := integration.NewManager(integration.ManagerConfig{DemoMode: true, DockerSocket: "disabled"})
	svc := service.NewControlService(db, mgr, "0.1.0-test")
	return NewAPIHandler(svc)
}

func TestHealthCheck(t *testing.T) {
	h := setupTestHandler(t)

	req := httptest.NewRequest("GET", "/api/v1/health", nil)
	w := httptest.NewRecorder()

	h.HealthCheck(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var res map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if res["status"] != "healthy" {
		t.Errorf("Expected status healthy, got %v", res["status"])
	}
}

func TestGetDashboard(t *testing.T) {
	h := setupTestHandler(t)

	req := httptest.NewRequest("GET", "/api/v1/dashboard", nil)
	w := httptest.NewRecorder()

	h.GetDashboard(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var summary domain.HomelabHealthSummary
	if err := json.Unmarshal(w.Body.Bytes(), &summary); err != nil {
		t.Fatalf("Failed to unmarshal dashboard payload: %v", err)
	}

	if summary.TotalServices != 8 {
		t.Errorf("Expected 8 services, got %d", summary.TotalServices)
	}
}

func TestGlobalSearch(t *testing.T) {
	h := setupTestHandler(t)

	req := httptest.NewRequest("GET", "/api/v1/search?q=forgejo", nil)
	w := httptest.NewRecorder()

	h.GlobalSearch(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var results []map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &results); err != nil {
		t.Fatalf("Failed to unmarshal search results: %v", err)
	}

	if len(results) == 0 {
		t.Errorf("Expected search results for 'forgejo', got 0")
	}
}

func TestContainerLifecycleActions(t *testing.T) {
	h := setupTestHandler(t)

	// In demo mode without real docker socket, actions gracefully return success
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "test-cnt")

	req := httptest.NewRequest("POST", "/api/v1/containers/test-cnt/restart", nil)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	w := httptest.NewRecorder()
	h.RestartContainer(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	reqStop := httptest.NewRequest("POST", "/api/v1/containers/test-cnt/stop", nil)
	reqStop = reqStop.WithContext(context.WithValue(reqStop.Context(), chi.RouteCtxKey, rctx))
	wStop := httptest.NewRecorder()
	h.StopContainer(wStop, reqStop)
	if wStop.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", wStop.Code)
	}

	reqStart := httptest.NewRequest("POST", "/api/v1/containers/test-cnt/start", nil)
	reqStart = reqStart.WithContext(context.WithValue(reqStart.Context(), chi.RouteCtxKey, rctx))
	wStart := httptest.NewRecorder()
	h.StartContainer(wStart, reqStart)
	if wStart.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", wStart.Code)
	}
}

func TestAlertsAndMetricsHandlers(t *testing.T) {
	h := setupTestHandler(t)

	// List Alerts
	req := httptest.NewRequest("GET", "/api/v1/alerts", nil)
	w := httptest.NewRecorder()
	h.ListAlerts(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Ack Alert
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "alt-001")
	reqAck := httptest.NewRequest("POST", "/api/v1/alerts/alt-001/ack", nil)
	reqAck = reqAck.WithContext(context.WithValue(reqAck.Context(), chi.RouteCtxKey, rctx))
	wAck := httptest.NewRecorder()
	h.AcknowledgeAlert(wAck, reqAck)
	if wAck.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", wAck.Code)
	}

	// Metric Trends
	reqTrends := httptest.NewRequest("GET", "/api/v1/metrics/trends", nil)
	wTrends := httptest.NewRecorder()
	h.GetMetricTrends(wTrends, reqTrends)
	if wTrends.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", wTrends.Code)
	}
}

func TestNetworkHandlers(t *testing.T) {
	h := setupTestHandler(t)

	// Test /api/v1/network/clients
	reqClients := httptest.NewRequest("GET", "/api/v1/network/clients", nil)
	wClients := httptest.NewRecorder()
	h.ListNetworkClients(wClients, reqClients)
	if wClients.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", wClients.Code)
	}

	var clients []domain.NetworkClient
	if err := json.Unmarshal(wClients.Body.Bytes(), &clients); err != nil {
		t.Fatalf("Failed to parse network clients response: %v", err)
	}
	if len(clients) == 0 {
		t.Errorf("Expected at least 1 network client, got 0")
	}

	// Test /api/v1/network/telemetry
	reqTelem := httptest.NewRequest("GET", "/api/v1/network/telemetry", nil)
	wTelem := httptest.NewRecorder()
	h.GetNetworkTelemetry(wTelem, reqTelem)
	if wTelem.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", wTelem.Code)
	}

	var summary domain.NetworkTelemetrySummary
	if err := json.Unmarshal(wTelem.Body.Bytes(), &summary); err != nil {
		t.Fatalf("Failed to parse network telemetry response: %v", err)
	}
	if len(summary.BandwidthHistory) == 0 {
		t.Errorf("Expected bandwidth history data points, got 0")
	}
}
