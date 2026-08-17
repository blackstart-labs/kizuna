package api

import (
	"io/fs"
	"net/http"
	"strings"

	"github.com/blackstart-labs/kizuna/internal/api/handlers"
	"github.com/blackstart-labs/kizuna/internal/api/middleware"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func NewRouter(h *handlers.APIHandler, frontendFS fs.FS) *chi.Mux {
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.SecurityHeaders)
	r.Use(middleware.SetupCORS())

	// API V1 Route Group
	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/health", h.HealthCheck)
		api.Get("/dashboard", h.GetDashboard)
		api.Get("/services", h.ListServices)
		api.Get("/hosts", h.ListHosts)
		api.Get("/containers", h.ListContainers)
		api.Post("/containers/{id}/restart", h.RestartContainer)
		api.Post("/containers/{id}/stop", h.StopContainer)
		api.Post("/containers/{id}/start", h.StartContainer)
		api.Get("/incidents", h.ListIncidents)
		api.Get("/dependencies", h.GetDependencyGraph)
		api.Get("/alerts", h.ListAlerts)
		api.Post("/alerts/{id}/ack", h.AcknowledgeAlert)
		api.Post("/alerts/{id}/resolve", h.ResolveAlert)
		api.Post("/alerts/webhook", h.IngestAlertWebhook)
		api.Get("/metrics/trends", h.GetMetricTrends)
		api.Get("/recommendations", h.ListRecommendations)
		api.Post("/optimizer/execute", h.ExecuteOptimizerAction)
		api.Post("/optimizer/recommendations/{id}/dismiss", h.DismissRecommendation)
		api.Get("/network/clients", h.ListNetworkClients)
		api.Get("/network/telemetry", h.GetNetworkTelemetry)
		api.Get("/self/metrics", h.GetSelfMetrics)
		api.Get("/search", h.GlobalSearch)
	})

	// Serve Frontend SPA
	if frontendFS != nil {
		fileServer := http.FileServer(http.FS(frontendFS))
		r.Get("/*", func(w http.ResponseWriter, req *http.Request) {
			path := strings.TrimPrefix(req.URL.Path, "/")
			if path == "" {
				path = "index.html"
			}

			// If static file exists, serve it; otherwise serve index.html for SPA router
			if f, err := frontendFS.Open(path); err == nil {
				_ = f.Close()
				fileServer.ServeHTTP(w, req)
				return
			}

			// Fallback to index.html for client-side routing
			if indexFile, err := frontendFS.Open("index.html"); err == nil {
				_ = indexFile.Close()
				req.URL.Path = "/"
				fileServer.ServeHTTP(w, req)
				return
			}

			http.NotFound(w, req)
		})
	}

	return r
}
