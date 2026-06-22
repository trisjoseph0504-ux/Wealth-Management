# ADR 0007 — Backend in Next.js for the personal-platform stage

**Status:** Accepted · **Date:** 2026-06-21 · **Supersedes (for current stage):** ADR 0002

## Context

ADR 0002 (Phase 0) chose a **separate NestJS modular-monolith API** with
org-level multi-tenancy and Postgres RLS. The product has since been built as a
polished mock-data **Next.js** app, and the agreed next step is to persist a
**single user's** research data — not to build a multi-advisor/-client CRM. A
separate service + tenancy + RLS is, at this stage, the premature
microservice/tenancy build that the Phase 0 architecture itself warned against.

## Decision

For the personal-research-platform stage, run the backend **inside the existing
Next.js app** (Server Actions + Route Handlers) over **Neon PostgreSQL** with
**Drizzle ORM** and **Auth.js v5**. Data is **single-owner** — `user_id` on every
row, authorization funneled through one scoping helper — with **no `org_id`
tenancy and no RLS yet**. Market data and AI generation remain mock.

Full reasoning, schema, phases, and migration plan: [BACKEND_ARCHITECTURE.md](../BACKEND_ARCHITECTURE.md).

## Consequences

- **+** Far less to build/operate now; one language, end-to-end types; ships fast.
- **+** Extraction and tenancy paths are preserved behind the data-access seam and
  the single scoping helper — later changes are contained, not rewrites.
- **−** Next.js is a weaker host for heavy compute / real-time streaming / long
  jobs. We accept this and define an **extraction trigger**: carve out a
  NestJS/Python service when we hit sustained heavy analytics, real-time price
  fan-out, or a second consumer (mobile/partners).
- This ADR governs **only the current stage**. Reaching the extraction trigger or
  greenlighting advisor/client features requires a new superseding ADR (which
  would re-activate the ADR 0002 direction for that part of the system).
