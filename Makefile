.PHONY: dev build migrate-up migrate-down docker-up docker-down test clean

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

# Clean
clean:
	rm -rf bin/
	cd backend && go clean

# Full setup
setup: docker-up migrate-up
	@echo "Setup complete! Run 'make dev' to start the server."
