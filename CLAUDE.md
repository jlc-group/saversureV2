# SaverSure V2 — Claude Code Project Config

## Architecture
- **Backend**: Go + Gin (port 30400)
- **Admin Panel**: Next.js (port 30401) — `frontend/`
- **Consumer App**: Next.js (port 30403) — `consumer/`
- **Factory Portal**: Next.js — `factory-portal/`
- **Database**: PostgreSQL 17 (Docker, port 5433, container: `saversure-postgres`)
- **Cache**: Redis (port 6379)
- **Messaging**: NATS (port 4222)

## UX/UI Design Skills
When working on frontend UI/UX tasks, reference the design system skills at:
- `.claude/skills/ux-ui/CLAUDE.md` — Core design principles and decision framework
- `.claude/skills/ux-ui/tokens/` — Design tokens (colors, typography, spacing, shadows, borders, breakpoints)
- `.claude/skills/ux-ui/components/` — Component specs (atoms, molecules, organisms, templates)
- `.claude/skills/ux-ui/accessibility/` — WCAG 2.2 checklist and ARIA patterns
- `.claude/skills/ux-ui/frameworks/react-tailwind.md` — React + Tailwind patterns
- `.claude/skills/ux-ui/frameworks/nextjs.md` — Next.js 15 App Router patterns
- `.claude/skills/ux-ui/workflows/` — Design review, design-to-code, prototyping workflows

## Key Conventions
- Tenant isolation via `X-Tenant-ID` header or JWT claims
- Demo Tenant: `00000000-0000-0000-0000-000000000001`
- All API endpoints under `/api/v1/`
- Thai language for user-facing content
