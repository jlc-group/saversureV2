# Saversure V2

Multi-Tenant Loyalty & Reward Platform with zero-oversell guarantee.

## Architecture

| Component | Technology | Port |
|-----------|-----------|------|
| Backend API | Go + Gin | 30400 |
| Admin Portal | Next.js + TypeScript | 30401 |
| Database | PostgreSQL 18 | 5432 |
| Cache | Redis 7 (Docker) | 6379 |
| Queue | NATS JetStream (Docker) | 4222 |
| Storage | MinIO (shared) | 59300 |

## Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Run database migrations
cd backend
cp ../../run/saversureV2/.env.dev .env
go run ./cmd/migrate up

# 3. Start API server
go run ./cmd/api

# 4. Start admin portal (separate terminal)
cd frontend
npm install
npm run dev
```

## Project Structure

```
saversureV2/
├── backend/              Go API
│   ├── cmd/api/          Entry point
│   ├── cmd/migrate/      Migration runner
│   ├── internal/         Business logic
│   │   ├── auth/         JWT + RBAC
│   │   ├── tenant/       Multi-tenant management
│   │   ├── campaign/     Campaign CRUD
│   │   ├── batch/        QR batch generation
│   │   ├── code/         QR scan validation
│   │   ├── redemption/   2-phase reservation
│   │   ├── inventory/    Reward stock management
│   │   ├── ledger/       Immutable point ledger
│   │   ├── audit/        Audit trail
│   │   └── middleware/   Auth, CORS, rate limit, idempotency
│   ├── pkg/              Shared packages
│   └── migrations/       SQL migrations
├── frontend/             Next.js Admin Portal
├── docker-compose.yml    Redis + NATS
└── Makefile              Common commands
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/v1/auth/register | User registration |
| POST | /api/v1/auth/login | Login (JWT) |
| POST | /api/v1/tenants | Create tenant |
| POST | /api/v1/campaigns | Create campaign |
| POST | /api/v1/batches | Generate QR batch |
| POST | /api/v1/scan | Scan QR code |
| POST | /api/v1/redeem | Redeem reward (phase 1: reserve) |
| POST | /api/v1/redeem/:id/confirm | Confirm redemption (phase 2) |
| GET | /api/v1/points/balance | Point balance |
| GET | /api/v1/rewards | List rewards + inventory |
| GET | /api/v1/audit | Audit trail |

## Core Design Principles

- **Zero Oversell**: Atomic 2-phase reservation with row-level locks
- **Immutable Ledger**: Point transactions cannot be edited or deleted
- **Multi-Tenant**: Complete data isolation per tenant
- **Idempotent APIs**: Duplicate requests return same result
- **On-Scan Code Creation**: Only batch metadata stored; codes created on first scan
