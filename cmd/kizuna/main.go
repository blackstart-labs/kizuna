package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/blackstart-labs/kizuna/internal/api"
	"github.com/blackstart-labs/kizuna/internal/api/handlers"
	"github.com/blackstart-labs/kizuna/internal/config"
	"github.com/blackstart-labs/kizuna/internal/database"
	"github.com/blackstart-labs/kizuna/internal/embedded"
	"github.com/blackstart-labs/kizuna/internal/integration"
	"github.com/blackstart-labs/kizuna/internal/service"
)

var Version = "0.2.0"

func main() {
	demoFlag := flag.Bool("demo", false, "Run Kizuna with built-in realistic homelab demo data")
	portFlag := flag.Int("port", 0, "Override server port")
	dbPathFlag := flag.String("db", "", "Path to SQLite database file")
	flag.Parse()

	cfg := config.Load()
	if *demoFlag {
		cfg.DemoMode = true
	}
	if *portFlag != 0 {
		cfg.Port = *portFlag
	}
	if *dbPathFlag != "" {
		cfg.DBPath = *dbPathFlag
	}

	log.Printf("=====================================================")
	log.Printf(" 🚀 Kizuna (絆) — Your homelab. One control plane.  ")
	log.Printf(" Version: %s | Demo Mode: %v", Version, cfg.DemoMode)
	log.Printf("=====================================================")

	// Initialize SQLite Database with WAL Mode
	db, err := database.Connect(cfg.DBPath)
	if err != nil {
		log.Fatalf("[FATAL] Database initialization failed: %v", err)
	}
	defer db.Close()
	log.Printf("[DB] Connected to SQLite database at: %s (WAL mode active)", cfg.DBPath)

	// Initialize Integration Manager
	mgr := integration.NewManager(integration.ManagerConfig{
		DemoMode:           cfg.DemoMode,
		DockerSocket:       cfg.DockerSocket,
		ProxmoxURL:         cfg.ProxmoxURL,
		ProxmoxTokenID:     cfg.ProxmoxTokenID,
		ProxmoxTokenSecret: cfg.ProxmoxTokenSecret,
		ProxmoxSkipVerify:  cfg.ProxmoxSkipVerify,
		UptimeKumaURL:      cfg.UptimeKumaURL,
		UptimeKumaKey:      cfg.UptimeKumaKey,
	})

	// Initialize Business Logic Control Service
	ctrlService := service.NewControlService(db, mgr, Version)

	// Initialize API Handlers and Chi Router
	apiHandler := handlers.NewAPIHandler(ctrlService)
	frontendFS := embedded.GetFrontendFS()
	router := api.NewRouter(apiHandler, frontendFS)

	// Create TCP listener with intelligent port conflict fallback
	var listener net.Listener
	var actualPort = cfg.Port

	initialListener, listenErr := net.Listen("tcp", fmt.Sprintf("%s:%d", cfg.Host, cfg.Port))
	if listenErr != nil {
		if *portFlag == 0 {
			// Try friendly homelab fallback ports
			fallbackCandidates := []int{3030, 8081, 8082, 8085, 8095, 8888, 7070, 9099}
			for _, candidatePort := range fallbackCandidates {
				l, fbErr := net.Listen("tcp", fmt.Sprintf("%s:%d", cfg.Host, candidatePort))
				if fbErr == nil {
					listener = l
					actualPort = candidatePort
					log.Printf("[HTTP] ⚡ Port %d in use; automatically bound to available port %d", cfg.Port, actualPort)
					break
				}
			}
		}
		if listener == nil {
			log.Fatalf("[FATAL] Could not bind to port %d: %v", cfg.Port, listenErr)
		}
	} else {
		listener = initialListener
	}

	serverAddr := fmt.Sprintf("%s:%d", cfg.Host, actualPort)
	srv := &http.Server{
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in background goroutine
	go func() {
		log.Printf("[HTTP] Control Plane listening at http://%s", serverAddr)
		if err := srv.Serve(listener); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] HTTP server error: %v", err)
		}
	}()

	// Graceful shutdown handling
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)
	<-stopChan

	log.Println("[SHUTDOWN] Interrupt signal received. Shutting down gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("[WARN] Server shutdown forced: %v", err)
	} else {
		log.Println("[SHUTDOWN] Kizuna cleanly stopped.")
	}
}
