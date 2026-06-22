# Roadmap — Phased Milestones

Sequencing prioritizes **long-term scalability over short-term speed** (per the
project mandate). Each phase has an explicit goal, exit criteria, and an "off
the table" list so scope stays disciplined. **No feature work starts before
Phase 0 is complete.** Each phase ends only when its exit criteria — including
tests, security review, and docs — are met.

> Phases are ordered by dependency, not calendar. Durations are deliberately
> omitted until the team and data-vendor agreements are known; estimating dates
> now would be fiction.

---

## Phase 0 — Foundation & engineering system  ◀ _current_

**Goal:** establish the system every later phase follows. (This is what this
repository currently is.)

- Architecture, data model, design system, security guardrails, standards docs ✅
- Monorepo scaffold (Turborepo + pnpm), shared `config/types/ui/db/utils`
- TypeScript strict, ESLint/Prettier, CI (lint, types, test, build, secret scan)
- Design tokens + Tailwind preset + first UI primitives (`Button`, `Money`, …)
- Local infra: docker-compose (Postgres + TimescaleDB, Redis); env validation
- Drizzle wired with empty migration baseline; seed harness with **synthetic** data

**Exit:** a developer can clone, `pnpm install`, `pnpm dev`, and see an empty but
correctly-themed shell with CI green. No business features yet.

## Phase 1 — Identity, tenancy & app shell

**Goal:** secure, multi-tenant skeleton.

- Auth.js v5 integration; sessions; MFA scaffolding
- `org` tenancy, RBAC roles, RLS policies, tenant-scoped repositories
- App shell: nav rail, top bar, global search frame, account menu, routing
- Audit-log interceptor live; structured logging; health checks
- Account/user management screens (advisor-side)

**Exit:** users can sign in, are isolated by org, roles gate routes/actions
server-side, every mutation is audited. **Off the table:** any market data.

## Phase 2 — Core financial domain (read path)

**Goal:** model and display real portfolio state from imported data.

- Instruments master; accounts, holdings, lots, transactions ledger
- Manual / CSV import of holdings & transactions (no live brokerage yet)
- Server-side valuation engine (decimal-correct) + `position_valuation`
- Portfolio analytics dashboard (v1): value, allocation, P&L, holdings table
  (AG Grid), allocation breakdown
- `<Money>/<Percent>/<Delta>` primitives proven end-to-end with tabular figures

**Exit:** an advisor sees a correct, auditable portfolio built from imported data.
Money math is unit/property-tested. **Off the table:** live quotes, AI, alerts.

## Phase 3 — Market data & visualization

**Goal:** bring instruments to life with quotes and charts (license-permitting).

- Market-data **adapter** behind an interface; first provider (e.g. Polygon)
- Quote cache (Redis, TTL'd), OHLCV ingestion into TimescaleDB hypertable
- Price charts (TradingView Lightweight Charts) + analytical charts (Visx)
- Watchlists; live valuation refresh; market overview surfaces

**Exit:** portfolios value against live/recent prices; charts render from real
series; provider is swappable. **Gate:** market-data license terms confirmed
before exposing real-time depth (SECURITY §8).

## Phase 4 — Discovery & risk

**Goal:** analysis tools that don't (yet) resemble personalized advice.

- Stock screener (saved `screen`s, server-validated criteria)
- Risk analytics v1: volatility, beta, drawdown, exposure breakdowns
  (extract Python/FastAPI quant service **only if** the math demands it)
- Risk surfaced in the dashboard with clear methodology labels

**Exit:** advisors screen instruments and see risk metrics with documented
methods. **Gate:** legal review of regulatory posture before features read as
advice (SECURITY §9).

## Phase 5 — Intelligence, alerts & notifications

**Goal:** proactive + AI-assisted layers, tightly guardrailed.

- Alert rules + evaluation job (BullMQ) + delivery (in-app/email/push)
- AI market commentary via server proxy, with mandatory disclaimer + provenance,
  prompt-injection hardening, optional advisor-review-before-publish
- Notifications center

**Exit:** alerts fire reliably; AI commentary ships only with disclaimer +
provenance + isolation guarantees (SECURITY §7). **Off the table:** AI taking any
privileged action.

## Phase 6 — Advisor/client management & collaboration

**Goal:** the relationship layer.

- Rich client/household records, advisor↔client assignment, client-facing views
  with scoped RBAC
- Reporting/exports (PDF/statements) with audit + retention rules
- Client persona login with least-privilege access to their own data only

**Exit:** advisors manage books of clients; clients see only their own data;
exports are audited and retention-aware.

## Phase 7 — Integrations & scale hardening

**Goal:** production-grade external connectivity and operability.

- Brokerage **read-only** aggregation (Plaid/SnapTrade), tokenized, encrypted
- Performance hardening (caching, query tuning, virtualization at scale)
- SOC 2 readiness, pen-test, incident-response runbook, DR drills
- Terraform-described infra; staging↔prod parity

**Exit:** live (read-only) brokerage links, security-reviewed, observably
operable. **Explicitly out of scope across all phases until a separate audited
track:** placing trades / moving money.

---

## Standing scope discipline (applies to every phase)

**Never sacrificed for speed:** money correctness, server-side authz, audit
trail, tenant isolation, AI guardrails, license compliance.

**Deferred by default (require an ADR to pull forward):** microservice splits,
light theme, mobile-native apps, billing, real-time trading, exotic asset
classes.

Each phase closes with: tests green, security review for anything touching
money/auth/PII/AI, docs + ADRs updated, and a demo against synthetic data.
