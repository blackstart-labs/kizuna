package main

import (
	"context"
	"flag"
	"fmt"
	"log"
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

var Version = "0.1.0-alpha"

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
	mgr := integration.NewManager(cfg.DemoMode)

	// Initialize Business Logic Control Service
	ctrlService := service.NewControlService(db, mgr, Version)

	// Initialize API Handlers and Chi Router
	apiHandler := handlers.NewAPIHandler(ctrlService)
	frontendFS := embedded.GetFrontendFS()
	router := api.NewRouter(apiHandler, frontendFS)

	serverAddr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in background goroutine
	go func() {
		log.Printf("[HTTP] Control Plane listening at http://%s", serverAddr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
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
