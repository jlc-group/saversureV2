.PHONY: dev build migrate-up migrate-down docker-up docker-down test clean baseline-snapshot baseline-reset

# Development
dev:
	cd backend && go run ./cmd/api

# Build
build:
	cd backend && go build -o ../bin/saversure-api.exe ./cmd/api

# Database migrations
migrate-up:
	cd backend && go run ./cmd/migrate up

migrate-down:
	cd backend && go run ./cmd/migrate down

# Docker services (Redis + NATS)
docker-up:
	docker compose up -d

docker-down:
	docker compose down

# Test
test:
	cd backend && go test ./... -v

# Dev migration reset helpers
baseline-snapshot:
	powershell -ExecutionPolicy Bypass -File scripts/create-v2-baseline-snapshot.ps1

baseline-reset:
	powershell -ExecutionPolicy Bypass -File scripts/reset-v2-from-baseline.ps1 -Force

# Clean
clean:
	rm -rf bin/
	cd backend && go clean

# Full setup
setup: docker-up migrate-up
	@echo "Setup complete! Run 'make dev' to start the server."
