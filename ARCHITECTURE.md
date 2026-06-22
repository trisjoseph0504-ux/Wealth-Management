# Architecture

**Owner:** Engineering · **Status:** Living document · **Last reviewed:** 2026-06-21

This document is the single source of truth for _why_ the system is shaped the
way it is. Decisions here are binding until superseded by a recorded ADR. If you
disagree with a decision, open an ADR — do not quietly diverge.

---

## 1. Architectural principles

1. **Boundaries over frameworks.** Market-data providers, brokerage connections,
   and the AI model are _replaceable adapters behind interfaces_, never imported
   directly into feature code. Vendors change; the domain must not.
2. **Money is never a float.** All monetary and quantity values use fixed
   precision (`NUMERIC` in Postgres, decimal types in code). See §6.
3. **Server-authoritative.** The browser is an untrusted rendering surface.
   Pricing, valuation, risk, entitlements, and AI calls happen server-side.
4. **Modular monolith first, microservices only when forced.** We split a
   service out when it has a _different scaling axis, runtime, or team_ — not
   for fashion. The first likely split is a Python quant/risk service (§4).
5. **Type safety end-to-end.** One source of domain truth (`@lwi/types`),
   generated/shared across web and api. No hand-duplicated DTOs.
6. **Auditability is a feature.** Every state change to financial or client data
   writes an append-only audit record (§7). This is non-negotiable for a
   regulated domain.

## 2. System context (C4 level 1)

```
        ┌────────────┐      ┌─────────────────────┐      ┌────────────────────┐
        │  Advisor / │      │  Lewis Wealth        │      │ Market Data Vendor │
        │  HNW Client│◄────►│  Intelligence (LWI)  │◄────►│ (Polygon/Refinitiv)│
        └────────────┘ HTTPS└─────────────────────┘ adapter└────────────────────┘
                                  │        │   │
                       ┌──────────┘        │   └──────────────┐
                       ▼                   ▼                  ▼
              ┌────────────────┐  ┌──────────────┐   ┌──────────────────┐
              │ Brokerage Agg. │  │ Anthropic    │   │ Identity / SSO   │
              │ (Plaid/SnapTrade)│ Claude (AI)  │   │ (Auth.js→WorkOS) │
              └────────────────┘  └──────────────┘   └──────────────────┘
```

## 3. Container view (C4 level 2)

| Container         | Tech                          | Responsibility                                  |
| ----------------- | ----------------------------- | ----------------------------------------------- |
| `apps/web`        | Next.js 15 / React 19         | UI, SSR/RSC, session, presentation logic only   |
| `apps/api`        | NestJS                        | Domain logic, auth, valuation, orchestration    |
| PostgreSQL        | Postgres 16 + TimescaleDB     | System of record + time-series prices           |
| Redis             | Redis 7                       | Cache, rate limiting, sessions, BullMQ queues   |
| Worker            | NestJS + BullMQ               | Scheduled jobs: price sync, alerts, risk recompute |
| Object storage    | S3-compatible                 | Statements, exports, document artifacts         |

**Rule:** `apps/web` never talks to Postgres directly. All domain data flows
through `apps/api`. The web app's own server actions/route handlers are for
session, BFF aggregation, and UI concerns only.

## 4. Why these choices (and what we rejected)

### Backend: NestJS modular monolith — _not_ "just Next.js API routes"

> **Challenge to the brief.** "Institutional-grade" and "Next.js does
> everything" are in tension. Next.js route handlers/server actions are
> excellent for a BFF, but they are a poor home for: long-running risk
> computation, scheduled market-data ingestion, queue workers, websocket fan-out,
> and strict domain layering. Cramming all of that into the web app produces a
> ball of mud that is exactly what "scalable architecture" is meant to prevent.

We use a dedicated NestJS API. It gives us DI, module boundaries, guards/
interceptors for cross-cutting concerns (auth, audit, rate limit), and a clean
path to extract modules later. One language (TypeScript) across the stack keeps
the team and `@lwi/types` coherent.

**When we'd split a service out:** risk analytics that needs `numpy`/`pandas`/
`QuantLib`-class tooling. At that point we add a **Python (FastAPI) quant
service** behind a gRPC/HTTP boundary — _not before_. Premature microservices
are a recorded anti-goal.

### Database: PostgreSQL + TimescaleDB — _not_ a NoSQL store

Financial data is relational, transactional, and demands exact arithmetic and
strong consistency. Postgres gives `NUMERIC`, real transactions, row-level
security, and mature tooling. TimescaleDB (a Postgres extension) handles the one
genuinely high-volume, time-series workload — historical prices/OHLCV — without
introducing a second database technology.

### ORM: Drizzle — _not_ Prisma (with eyes open)

Drizzle is SQL-first, has zero runtime magic, preserves exact types including
decimals, and lets us write the precise queries financial reporting needs.
Prisma is more "batteries included" but historically abstracts SQL in ways that
fight performance-sensitive analytical queries. _Trade-off accepted:_ Drizzle
has a smaller ecosystem; we own more of our query layer. If the team strongly
prefers Prisma's DX, that's an ADR conversation, not a silent swap.

### Auth: Auth.js v5 now, designed to swap to WorkOS/Clerk

Do **not** roll custom crypto/session/password handling. Auth.js covers app
sessions and OAuth today. Enterprise clients will demand SAML/SCIM/SSO and audit
— that's WorkOS/Auth0/Clerk territory. The auth boundary (`AuthProvider`
interface + `@lwi/api` guards) is built so the identity vendor is swappable.

### Charts: TradingView Lightweight Charts + Visx — _not_ one do-everything lib

Price/candlestick rendering is a solved, performance-critical problem — use
TradingView's purpose-built lib. Bespoke analytics (allocation, risk surfaces,
attribution) need full design control — use Visx (low-level, D3-powered) so the
output matches the design system rather than a charting vendor's defaults.

### Tables: AG Grid

Holdings and screener views need virtualization, column pinning, grouping, and
export at thousands of rows. Hand-rolling this is a tar pit. AG Grid is the
institutional standard.

## 5. Module map (`apps/api/src/modules`)

Each module is a vertical slice: `controller` → `service` → `repository`, with
its own DTOs and an interface to any external adapter.

```
auth/            identity, sessions, RBAC enforcement
users/           user & profile management
orgs/            advisory firms / tenants (multi-tenancy root)
clients/         HNW client records, advisor↔client links
accounts/        investment accounts (per client)
portfolios/      portfolio aggregation & valuation
holdings/        positions, lots, cost basis
instruments/     securities master (symbols, metadata)
market-data/     adapter boundary: quotes, OHLCV, fundamentals
watchlists/      user watchlists
screener/        rule-based instrument screening
risk/            risk metrics (vol, beta, VaR, exposure)  ← future Python split
alerts/          alert rules + evaluation
notifications/   delivery (email, in-app, push)
commentary/      AI market commentary orchestration
audit/           append-only audit log (cross-cutting)
billing/         (future) subscription / entitlements
```

### Multi-tenancy

Tenancy root is the **organization** (advisory firm). Every domain row carries
`org_id`. Isolation is enforced at two layers: (1) application — a tenant guard
injects `org_id` scope into every repository call; (2) database — Postgres
Row-Level Security policies as defense-in-depth. Never rely on the app layer
alone.

## 6. Money & numeric correctness

- Storage: Postgres `NUMERIC(precision, scale)`. Never `float`/`double`.
- Transport: monetary values as **string-encoded decimals** in JSON, never JS
  `number` (which is IEEE-754 and will silently lose cents). Parsed into a
  decimal type (`decimal.js` / `dinero.js`) in code.
- A shared `@lwi/utils/money` module is the _only_ place money math lives.
  Feature code never does `a + b` on currency directly.
- Every monetary value carries an explicit currency code (ISO 4217). No
  "assumed USD."
- Rounding rules (half-even / banker's rounding) are defined once and tested.

## 7. Cross-cutting concerns

| Concern        | Mechanism                                                       |
| -------------- | -------------------------------------------------------------- |
| AuthN/AuthZ    | NestJS guards; RBAC + resource-ownership checks                |
| Audit log      | Interceptor writes append-only records on all mutations        |
| Rate limiting  | Redis-backed, per-user and per-IP, stricter on AI & auth       |
| Idempotency    | Idempotency keys on all write endpoints that touch money       |
| Caching        | TanStack Query (client) + Redis (server); market data TTL'd    |
| Observability  | Structured logs (no PII), OpenTelemetry traces, health checks  |
| Error handling | Global exception filter; typed error envelope; no stack leaks  |
| Config/secrets | Env-validated at boot (zod); secrets via vault, never in repo  |

## 8. Data flow examples

**Portfolio valuation (read):** web → api `GET /portfolios/:id` → portfolios
service composes holdings + latest prices (Redis cache → market-data adapter on
miss) → valuation computed server-side with decimal math → typed response →
TanStack Query caches → UI renders with tabular figures.

**AI commentary (generate):** web requests commentary → api `commentary` module
builds a constrained prompt from _server-side_ portfolio context → calls
Anthropic via server proxy (key never client-side) → response is wrapped with a
mandatory non-advice disclaimer and persisted with provenance (model id, prompt
hash, timestamp) → returned. See compliance rules in [docs/SECURITY.md](./docs/SECURITY.md).

## 9. Environments & deployment

| Env     | Purpose                  | Notes                                   |
| ------- | ------------------------ | --------------------------------------- |
| local   | development              | docker-compose: postgres, redis         |
| preview | per-PR ephemeral         | seeded synthetic data only — no real PII |
| staging | pre-prod, prod-like      | masked data, full integrations sandbox  |
| prod    | live                     | least-privilege, audited, backups + PITR |

Frontend deploys to Vercel; API + worker to a container platform (start: Fly/
Railway/Render; institutional target: AWS ECS/Fargate). Infra is
code-described (Terraform) before prod.

## 10. Architecture Decision Records (ADRs)

Material decisions live in `docs/adr/NNNN-title.md`. The choices above are the
seed ADRs (0001 backend, 0002 database, 0003 ORM, 0004 auth, 0005 charts).
Changing any of them requires a superseding ADR — this is how we keep "one
consistent engineering system" across phases.

## 11. Known risks & open questions

- **Market-data licensing** is the critical-path constraint, not engineering.
  Real-time pro data carries redistribution restrictions and cost. Resolve
  commercial terms before promising real-time depth.
- **Regulatory posture** (RIA vs. tool vendor) determines how far AI commentary
  and "risk analytics" can go before they become regulated advice. Get legal
  input before Phase 3.
- **Brokerage write access** (placing trades) is explicitly out of scope until a
  separate, audited, compliance-reviewed track. Read-only aggregation first.
