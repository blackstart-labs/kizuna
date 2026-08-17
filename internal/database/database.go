package database

import (
	"database/sql"
	_ "embed"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

//go:embed migrations/001_initial_schema.sql
var initialSchemaSQL string

type DB struct {
	*sql.DB
	path string
}

func Connect(dbPath string) (*DB, error) {
	dir := filepath.Dir(dbPath)
	if dir != "." && dir != "/" {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create database directory: %w", err)
		}
	}

	dsn := fmt.Sprintf("file:%s?_pragma=journal_mode(WAL)&_pragma=synchronous(NORMAL)&_pragma=foreign_keys(ON)&_pragma=busy_timeout(5000)", dbPath)
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	// Optimize connection pooling for SQLite WAL mode
	db.SetMaxOpenConns(1) // Single writer for SQLite
	db.SetMaxIdleConns(1)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	instance := &DB{DB: db, path: dbPath}
	if err := instance.migrate(); err != nil {
		return nil, fmt.Errorf("database migration failed: %w", err)
	}

	return instance, nil
}

func (d *DB) migrate() error {
	_, err := d.Exec(initialSchemaSQL)
	return err
}

func (d *DB) GetDBSizeBytes() int64 {
	info, err := os.Stat(d.path)
	if err != nil {
		return 0
	}
	return info.Size()
}
