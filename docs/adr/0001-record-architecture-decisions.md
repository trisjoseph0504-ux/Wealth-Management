# ADR 0001 — Record architecture decisions

**Status:** Accepted · **Date:** 2026-06-21

## Context

This project must maintain "one consistent engineering system" across many build
phases and contributors (human and AI). Decisions made implicitly get re-litigated
and silently diverged from.

## Decision

We record every material architectural decision as an ADR in `docs/adr/`,
numbered sequentially. The seed decisions established in
[ARCHITECTURE.md](../ARCHITECTURE.md) are considered accepted ADRs:

- **0002** — NestJS modular monolith backend (not Next.js-only).
- **0003** — PostgreSQL + TimescaleDB (not NoSQL).
- **0004** — Drizzle ORM (not Prisma).
- **0005** — Auth.js v5 now, swappable to WorkOS/Clerk for enterprise SSO.
- **0006** — TradingView Lightweight Charts + Visx (not one charting lib).

Each future change to these requires a new superseding ADR. No silent divergence.

## Consequences

- Decisions are discoverable and reversible with a paper trail.
- Slightly more process per significant decision — accepted, and the point.

> When writing the full text for 0002–0006, lift the rationale and rejected
> alternatives already captured in ARCHITECTURE.md §4 so nothing is lost.
