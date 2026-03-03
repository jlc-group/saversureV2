package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"saversure/internal/config"
)

func main() {
	godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, cfg.DB.DSN())
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	// Create migrations tracking table
	_, err = pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		log.Fatalf("failed to create migrations table: %v", err)
	}

	action := "up"
	if len(os.Args) > 1 {
		action = os.Args[1]
	}

	migrationsDir := findMigrationsDir()

	switch action {
	case "up":
		if err := migrateUp(ctx, pool, migrationsDir); err != nil {
			log.Fatalf("migration up failed: %v", err)
		}
	case "down":
		if err := migrateDown(ctx, pool, migrationsDir); err != nil {
			log.Fatalf("migration down failed: %v", err)
		}
	default:
		log.Fatalf("unknown action: %s (use 'up' or 'down')", action)
	}
}

func findMigrationsDir() string {
	candidates := []string{
		"migrations",
		"backend/migrations",
		"../migrations",
		"../../migrations",
	}
	for _, dir := range candidates {
		if info, err := os.Stat(dir); err == nil && info.IsDir() {
			return dir
		}
	}
	log.Fatal("migrations directory not found")
	return ""
}

func migrateUp(ctx context.Context, pool *pgxpool.Pool, dir string) error {
	files, err := filepath.Glob(filepath.Join(dir, "*.up.sql"))
	if err != nil {
		return fmt.Errorf("glob migrations: %w", err)
	}
	sort.Strings(files)

	for _, file := range files {
		version := extractVersion(file)

		var exists bool
		pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", version).Scan(&exists)
		if exists {
			fmt.Printf("  skip: %s (already applied)\n", version)
			continue
		}

		sql, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("read %s: %w", file, err)
		}

		fmt.Printf("  applying: %s ...", version)
		if _, err := pool.Exec(ctx, string(sql)); err != nil {
			return fmt.Errorf("\n  FAILED %s: %w", file, err)
		}

		pool.Exec(ctx, "INSERT INTO schema_migrations (version) VALUES ($1)", version)
		fmt.Println(" done")
	}

	fmt.Println("all migrations applied")
	return nil
}

func migrateDown(ctx context.Context, pool *pgxpool.Pool, dir string) error {
	files, err := filepath.Glob(filepath.Join(dir, "*.down.sql"))
	if err != nil {
		return fmt.Errorf("glob migrations: %w", err)
	}
	sort.Sort(sort.Reverse(sort.StringSlice(files)))

	if len(files) == 0 {
		fmt.Println("no down migrations found")
		return nil
	}

	// Only rollback the latest
	file := files[0]
	version := extractVersion(file)

	var exists bool
	pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", version).Scan(&exists)
	if !exists {
		fmt.Printf("  skip: %s (not applied)\n", version)
		return nil
	}

	sql, err := os.ReadFile(file)
	if err != nil {
		return fmt.Errorf("read %s: %w", file, err)
	}

	fmt.Printf("  rolling back: %s ...", version)
	if _, err := pool.Exec(ctx, string(sql)); err != nil {
		return fmt.Errorf("\n  FAILED %s: %w", file, err)
	}

	pool.Exec(ctx, "DELETE FROM schema_migrations WHERE version = $1", version)
	fmt.Println(" done")

	return nil
}

func extractVersion(path string) string {
	base := filepath.Base(path)
	parts := strings.SplitN(base, ".", 2)
	return parts[0]
}
