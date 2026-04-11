package main

import (
	"context"
	"flag"
	"log"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"saversure/internal/config"
	"saversure/internal/v1sync"
)

func main() {
	_ = godotenv.Load(".env", "../.env", "../../.env", "../../../.env")

	entitiesArg := flag.String("entities", "user,scan_history", "comma-separated entities to sync")
	limit := flag.Int("limit", 5000, "batch size")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	ctx := context.Background()
	db, err := pgxpool.New(ctx, cfg.DB.DSN())
	if err != nil {
		log.Fatalf("connect db: %v", err)
	}
	defer db.Close()

	svc := v1sync.NewService(db, cfg)
	entities := split(*entitiesArg)
	results := svc.RunSync(ctx, entities, *limit)
	for _, r := range results {
		if r.Error != "" {
			log.Printf("entity=%s rows=%d duration=%s error=%s", r.Entity, r.RowsSynced, r.Duration, r.Error)
			continue
		}
		log.Printf("entity=%s rows=%d duration=%s", r.Entity, r.RowsSynced, r.Duration)
	}
}

func split(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
