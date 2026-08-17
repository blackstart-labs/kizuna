package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/blackstart-labs/kizuna/internal/database"
	"github.com/blackstart-labs/kizuna/internal/domain"
	"github.com/blackstart-labs/kizuna/internal/integration"
	"github.com/blackstart-labs/kizuna/internal/service"
)

func setupTestHandler(t *testing.T) *APIHandler {
	db, err := database.Connect(":memory:")
	if err != nil {
		t.Fatalf("Failed to create in-memory db: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	mgr := integration.NewManager(true)
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
