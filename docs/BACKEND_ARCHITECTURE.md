# Backend Architecture Plan

**Status:** Scoping (pre-implementation — do not build yet) · **Owner:** Engineering
· **Last reviewed:** 2026-06-21

This plan scopes the backend for Lewis Wealth Intelligence (LWI). It is a planning
document; no backend code is written yet. It builds on — and in one place
deliberately **revises** — the Phase 0 [ARCHITECTURE.md](../ARCHITECTURE.md),
[DATA_MODEL.md](./DATA_MODEL.md), [SECURITY.md](./SECURITY.md), and
[CLAUDE.md](../CLAUDE.md).

---

## 0. Framing & the one big decision

The product today is a polished, mock-data Next.js app (8 feature areas:
dashboard, portfolio, markets, watchlists, screener, risk, alerts, intelligence).
The goal now is to make a **single user's** research platform _real_: their login,
preferences, portfolios, watchlists, screens, alerts, notes, and risk history
persist. Multi-advisor / multi-client CRM is explicitly **out of scope**.

> **Decision (revises Phase 0).** Phase 0 recommended a **separate NestJS
> modular-monolith API** with org-level multi-tenancy and Postgres RLS. For a
> personal research platform that is **the wrong size right now** — it's exactly
> the premature microservice/tenancy build the Phase 0 doc itself warned against.
> We will instead run the backend **inside the existing Next.js app** (Route
> Handlers + Server Actions) over a real Postgres database, with **single-owner**
> data (`user_id` on every row) and **no org tenancy yet**. The seams to extract
> a standalone service and add tenancy later are preserved and documented.
> Recorded as **[ADR 0007](./adr/0007-backend-in-nextjs-for-personal-stage.md)**,
> superseding ADR 0002 for the current stage.

**Principles for this stage**

1. **Right-size, don't pre-scale.** Build for one trusted user; keep the door open
   for advisor/client later without paying for it now.
2. **One source of domain truth.** Shared TypeScript types flow from `@lwi/types`
   into both the data layer and the UI — mock and DB implementations satisfy the
   _same_ interface.
3. **The browser is still untrusted.** Server Actions and Route Handlers are public
   endpoints; every one validates input (zod) and authorizes ownership.
4. **Money stays decimal.** `NUMERIC` in the DB, decimal strings on the wire
   (CLAUDE.md §5). Unchanged.
5. **External data stays mock until licensed.** Persistence of _user-owned_ data
   does not depend on any market-data vendor; keep those decoupled.

---

## 1. Recommended backend stack

| Concern            | Choice (this stage)                          | Why / notes                                              |
| ------------------ | -------------------------------------------- | ------------------------------------------------------- |
| Runtime / API      | **Next.js 15 server layer** — Server Actions (mutations) + Route Handlers (`/api/v1/*`) | No second service to operate; typed end-to-end; already deployed |
| Language           | TypeScript (strict) — same as frontend       | One language, shared types                              |
| Database           | **PostgreSQL** (managed: **Neon**)           | Serverless Postgres, branching for previews, low ops    |
| ORM / migrations   | **Drizzle ORM** + drizzle-kit                | Consistent with Phase 0; SQL-first, decimal-safe        |
| Auth               | **Auth.js v5 (NextAuth)** + Drizzle adapter  | Don't roll your own; email magic-link + OAuth; swap to WorkOS later |
| Validation         | **zod** at every boundary                    | One schema → runtime + types                            |
| Server state (client) | **TanStack Query**                        | Already the plan; caches DB reads                       |
| Email (magic link) | **Resend**                                   | Passwordless = no password storage to secure            |
| Secrets/config     | Env, validated at boot with zod; Vercel/Neon env | Market-data & future broker keys server-only            |
| Hosting            | **Vercel** (app) + **Neon** (db)             | Minimal ops for a personal platform                     |
| File/object storage| **Vercel Blob** or S3 (only when needed)     | For note attachments / exports — defer                  |

**Deliberately deferred (add only when triggered):**

- **Redis** — caching, rate limiting, job locks. Add with market-data ingestion
  and alert evaluation (Phase B4/B6), not before.
- **Job runner / queue** (Vercel Cron → BullMQ if it outgrows cron) — for alert
  evaluation and price sync. Cron is enough at first.
- **Separate NestJS/Python service** — only at the extraction trigger (§10).
- **TimescaleDB** — only when we ingest real time-series prices.

---

## 2. Database schema (single-owner, v1)

Conventions: UUIDv7 PKs; `user_id` FK on every domain row; `created_at` /
`updated_at` (+ `deleted_at` where soft-delete applies); money as `NUMERIC`;
JSONB for flexible/validated blobs (validated by zod before write). **No
`org_id` yet** — §5 documents how it's added later without a rewrite.

### Identity (Auth.js-managed)

- **`user`** — `id, email (unique), name, image, email_verified, created_at, updated_at`
- **`account`** — OAuth provider links (Auth.js): `user_id, provider, provider_account_id, …`
- **`session`** — `id, user_id, session_token, expires` _(DB sessions via adapter)_
- **`verification_token`** — magic-link tokens (Auth.js)

### Preferences

- **`user_preference`** — `user_id (unique), theme ('dark'|'light'), base_currency,
  locale, settings JSONB, updated_at` · _drives the existing `data-theme` switch_

### Portfolios & holdings

- **`portfolio`** — `id, user_id, name, base_currency, is_default, created_at, updated_at`
- **`holding`** — `id, user_id, portfolio_id, symbol, asset_class, sector,
  quantity NUMERIC(28,8), avg_cost NUMERIC(20,8), cost_currency, created_at, updated_at`
  · unique `(portfolio_id, symbol)` · _references instruments by symbol for now_
- **`transaction`** *(Phase B3+, optional)* — immutable activity ledger
  (`buy|sell|dividend|fee|deposit|withdrawal`); enables true cost-basis/realized P&L

### Watchlists

- **`watchlist`** — `id, user_id, name, sort_order, created_at, updated_at`
- **`watchlist_item`** — `id, user_id, watchlist_id, symbol, sort_order, note, added_at`
  · unique `(watchlist_id, symbol)`

### Saved screens

- **`saved_screen`** — `id, user_id, name, criteria JSONB (zod-validated filter set),
  created_at, updated_at`

### Alerts

- **`alert_rule`** — `id, user_id, scope ('instrument'|'portfolio'|'sector'),
  target (symbol/sector/null), condition JSONB, severity_default, channel
  ('in_app'|'email'), is_active, created_at, updated_at`
- **`alert_event`** — `id, user_id, alert_rule_id NULL, category, severity
  ('info'|'caution'|'critical'), title, body, evidence JSONB, triggered_at,
  read_at NULL, archived_at NULL` · _`alert_rule_id` is null for system-derived
  alerts (drift, concentration, risk-threshold) generated server-side_

### Research notes / investment memos

- **`research_note`** — `id, user_id, title, body (markdown), symbol NULL,
  tags TEXT[], pinned, created_at, updated_at, deleted_at NULL`

### Risk analytics persistence

- **`risk_snapshot`** — `id, user_id, portfolio_id, as_of, metrics JSONB
  (beta, vol, sharpe, max_drawdown, var95/99, score, tier, concentration…),
  created_at` · _append-only series → powers the risk-trend chart from real history_

### Reference & cross-cutting

- **`instrument`** *(reference cache)* — `symbol (pk), name, asset_class, sector,
  exchange, currency, updated_at` · _seeded from current mock universe now;
  provider-fed later_
- **`instrument_price`** *(Phase B6, TimescaleDB)* — OHLCV time-series · deferred
- **`integration_credential`** *(Phase B6)* — `user_id, provider, encrypted_token,
  scopes, expires_at` · _broker/market tokens, encrypted at rest_ · deferred
- **`audit_log`** — `id, user_id, action, entity_type, entity_id, meta JSONB,
  created_at` · append-only; lightweight now, expands with sensitive actions

> JSONB choice (`criteria`, `condition`, `evidence`, `metrics`, `settings`) is
> deliberate: these shapes evolve with the UI and are always read/written as a
> whole by their owner. They are zod-validated on write. Promote a field to a
> real column only when it needs indexing/aggregation.

---

## 3. Auth approach

- **Auth.js v5** with the **Drizzle adapter** and **database sessions** (httpOnly,
  secure, `SameSite=Lax` cookies; server-side revocation).
- **Passwordless first:** email **magic link** (Resend) + optional OAuth
  (Google/GitHub). No passwords to store, hash, or breach — ideal for a personal
  platform and the cleanest security posture to start.
- **Session shape:** `session.user.id` is the single ownership key used by every
  authorization check.
- **MFA / step-up:** not required for v1 (single user, magic-link already a
  possession factor). Add TOTP when the data sensitivity or user count grows.
- **Enterprise path:** the auth boundary is isolated behind a thin
  `getCurrentUser()` / middleware seam so the provider can later move to
  **WorkOS/Auth0** (SAML/SCIM/SSO) without touching feature code — unchanged from
  Phase 0 intent, just deferred.
- **Route protection:** Next.js middleware gates all app routes and `/api/v1/*`;
  unauthenticated → redirect (pages) or 401 (API). Auth.js owns `/api/auth/*`.

---

## 4. API route structure

Two complementary surfaces, by purpose:

**A. Server Actions** — the default for app-internal reads/mutations (typed, no
manual fetch wiring, co-located with features). Grouped per domain:

```
src/server/actions/
  preferences.ts   getPreferences, updateTheme, updatePreferences
  portfolios.ts    listPortfolios, getPortfolio, createPortfolio, upsertHolding, removeHolding
  watchlists.ts    listWatchlists, createWatchlist, addItem, removeItem, reorder
  screens.ts       listScreens, saveScreen, deleteScreen
  alerts.ts        listAlerts, createRule, markRead, archive, dismiss
  notes.ts         listNotes, getNote, createNote, updateNote, deleteNote
  risk.ts          getLatestSnapshot, listSnapshots, recomputeSnapshot
```

**B. Route Handlers** `/api/v1/*` — versioned REST for anything that will need
**programmatic/external** access (future mobile, webhooks, market-data proxy,
exports). Same auth + zod + ownership rules.

```
/api/auth/*                         (Auth.js)
/api/v1/preferences                 GET, PATCH
/api/v1/portfolios                  GET, POST
/api/v1/portfolios/:id              GET, PATCH, DELETE
/api/v1/portfolios/:id/holdings     GET, POST, PATCH, DELETE
/api/v1/watchlists                  GET, POST
/api/v1/watchlists/:id              GET, PATCH, DELETE
/api/v1/watchlists/:id/items        POST, DELETE
/api/v1/screens                     GET, POST
/api/v1/screens/:id                 GET, PATCH, DELETE
/api/v1/alerts                      GET            (events, filterable)
/api/v1/alerts/:id                  PATCH          (read/archive)
/api/v1/alert-rules                 GET, POST, PATCH, DELETE
/api/v1/notes                       GET, POST
/api/v1/notes/:id                   GET, PATCH, DELETE
/api/v1/risk/snapshots              GET, POST
/api/v1/market/*                    (Phase B6) quotes, search — server-side proxy
```

**Layering (both surfaces share it):** `route/action → service (domain logic) →
repository (Drizzle data access)`. Controllers/actions do no business logic;
repositories do no authorization — the **service** owns ownership checks and the
decimal/money rules. A typed error envelope `{ error: { code, message } }` for
Route Handlers; thrown typed errors for Server Actions.

---

## 5. Data ownership & security model

- **Single-owner model.** Every domain row has `user_id`. Authorization is one
  invariant, enforced in the service/repository layer: **a user can only read or
  write rows where `row.user_id === session.user.id`.** Encapsulated in a
  `scopedRepo(userId)` helper so no query can forget it.
- **No org tenancy yet.** This is intentional (the brief). The forward path:
  add a nullable `org_id` column + an `org` and `membership` table later;
  backfill each user as their own org; switch the scope key from `user_id` to
  `(org_id, …)`. Because all access already funnels through one scoping helper,
  this is a contained change — _not_ a rewrite. **Postgres RLS** becomes worth
  adding at that point (defense-in-depth for true multi-tenancy); for a single
  user, app-layer scoping is sufficient and simpler.
- **Validation & injection.** zod on every input; Drizzle parameterized queries
  only; output typed. No string-built SQL.
- **Secrets.** Market-data and (future) broker tokens are **server-only**, env- or
  vault-stored, validated at boot. Future `integration_credential` tokens are
  **encrypted at rest** (envelope encryption). Never in the client bundle.
- **PII/financial data.** TLS in transit; encryption at rest (managed by Neon) +
  column-level encryption for any future restricted fields (SSN/account numbers —
  not stored in v1). No PII/money-tied-to-identity in logs.
- **Audit.** Append-only `audit_log` on sensitive mutations (auth changes,
  deletes, future money/integration actions). Lightweight now, per SECURITY.md.
- **Rate limiting.** Add (Redis or Vercel KV) on auth and any future market-data
  proxy endpoints (Phase B4+).
- **Compliance posture.** Unchanged from SECURITY.md §7/§9: AI commentary stays
  educational/non-advice with disclaimer + provenance; resolve regulatory
  classification with counsel before any feature reads as personalized advice.

---

## 6. What should remain mock-data for now

Keep mock/seeded (no external dependency, or licensing/legal blockers):

- **Market data** — quotes, the securities universe, prices/OHLCV, fundamentals
  (P/E, beta, yield), 52-week ranges, sector performance, indices, news, earnings
  dates. _Blocked on a licensed provider; legal before technical._
- **AI generation** — the "Lewis Intelligence" briefing, investment theses, and
  insight prose stay **templated/deterministic** until a real model call is wired
  (and even then, disclaimer + provenance per SECURITY.md). Persist the user's
  _interactions_ (monitor/dismiss/alerts), not generated text, first.
- **Derived analytics math** — risk metrics, scenarios, correlation, screener
  filtering can keep running as pure functions over persisted holdings; only the
  **inputs** (holdings) and **snapshots** (outputs) need the DB. Don't move the
  compute server-side prematurely.
- **Reference seeds** — the `instrument` table is seeded from the current mock
  universe so symbols resolve, ahead of a provider.

---

## 7. What should become persistent first

Order by **(high user value) × (low risk, no external dependency)**:

1. **Auth + `user`** — nothing is "yours" until login is real. _(prerequisite)_
2. **`user_preference` (theme)** — tiny, high-signal first win; proves the full
   stack (auth → DB → server read → `data-theme`) end-to-end with near-zero risk.
3. **Watchlists, saved screens, research notes** — pure user-owned CRUD, no
   market-data coupling, immediately useful, easy to get right.
4. **Portfolios + holdings** — the core of "personal." Manual / CSV entry;
   valuation still computed from (mock) prices. Money rules apply here.
5. **Alerts (events + rules)** — persist user rules and alert state
   (read/archive/dismiss); system-derived alerts generated from persisted
   holdings/risk.
6. **Risk snapshots** — append-only, turns the risk-trend chart into _real_
   history instead of a synthetic series.

Everything above is independent of any vendor — so it can ship while market data
remains mock.

---

## 8. Migration plan: mock → real database

The codebase currently imports directly from `src/data/*-mock.ts`. Migrate behind
a **data-access seam**, per domain, without a big-bang rewrite:

1. **Introduce a typed data interface** per domain (e.g. `WatchlistsRepo`) in
   `@lwi/types` + a `src/server/data/` layer. Two implementations satisfy it:
   `MockWatchlistsRepo` (wraps today's mock module) and `DbWatchlistsRepo`
   (Drizzle). _No UI change in this step — just an indirection._
2. **Route components through the seam.** Replace direct `import … from
   "@/data/*-mock"` with calls to the data layer (Server Action / Query hook).
   Mock impl returns identical shapes, so the UI is unaffected.
3. **Stand up the DB** (Phase B0): Drizzle schema + migrations + a **seed script
   that imports the existing mock modules** to populate `instrument`, and seeds
   the signed-in user's default portfolio/watchlists from the mock data — so the
   first real login looks exactly like the demo.
4. **Per-domain cutover** via a feature flag (`DATA_SOURCE=mock|db` per domain),
   in the §7 order: preferences → watchlists/screens/notes → portfolio →
   alerts → risk. Flip one domain at a time; roll back by flipping the flag.
5. **Backfill & verify.** For each domain, write a one-shot import from mock →
   DB, then verify parity (row counts, spot-checked values) before flipping.
6. **Retire mock modules** only after a domain is DB-backed and verified; keep
   them as seed fixtures and test data.

Key invariant: **mock and DB implementations share the same types**, so "mock →
DB" is a dependency-injection swap, not a UI rewrite. This mirrors how the mock
data was authored to "resemble the eventual domain model" from the start.

---

## 9. Backend implementation phases

> Mirror the frontend's phased discipline. Each phase ends with: migrations
> reviewed & reversible, zod validation + ownership tests on new endpoints, no
> secrets/PII in logs, and a working flag-flip from mock.

- **B0 — Foundation.** Provision Neon; Drizzle + drizzle-kit + baseline migration;
  env validation; the data-access seam (§8.1–8.2); seed script. _Exit:_ app runs
  unchanged on the seam with `DATA_SOURCE=mock`.
- **B1 — Identity & preferences.** Auth.js (magic link + OAuth), `user`,
  middleware route protection, `user_preference`. _Exit:_ real login; theme
  persists per user; logout/revocation works.
- **B2 — User CRUD.** Watchlists, saved screens, research notes persistent &
  flipped to DB. _Exit:_ these survive reloads and devices.
- **B3 — Portfolio persistence.** `portfolio` + `holding`, manual/CSV import,
  decimal money path proven end-to-end; valuation still computed. _Exit:_ a real,
  user-owned portfolio drives the dashboard/portfolio/risk pages.
- **B4 — Alerts + first background job.** `alert_rule` + `alert_event`; a
  **Vercel Cron** job evaluates rules and generates system alerts from persisted
  data; add rate limiting + Redis/KV. _Exit:_ alerts fire from real state.
- **B5 — Risk history & memos.** `risk_snapshot` (scheduled append) powers the
  real risk-trend; research notes hardened (attachments if needed). _Exit:_ risk
  trend reflects actual history.
- **B6 — Market-data integration.** Provider adapter behind an interface;
  `instrument`/`instrument_price` cache (TimescaleDB), Redis-cached quotes,
  `/api/v1/market/*` proxy; (optional) read-only brokerage aggregation with
  tokenized, encrypted credentials. **Gated on licensing/legal.** _Exit:_ live
  prices replace mock; provider is swappable.
- **B7 — Hardening & the tenancy seam.** Audit coverage, backups + PITR
  validation, observability, security review; introduce `org_id`/RLS **only if**
  advisor/client features are greenlit. _Exit:_ production-grade for real data.

---

## 10. Risks & trade-offs (read before coding)

| Risk / trade-off | Assessment & mitigation |
| --- | --- |
| **Backend-in-Next.js vs separate service** | Simpler now; weaker fit for heavy compute / streaming / long jobs later. **Mitigation:** data-access seam + a defined **extraction trigger** — extract a NestJS/Python service when we need (a) sustained heavy analytics, (b) real-time price streaming/fan-out, or (c) a second consumer (mobile/partners). Not before. |
| **Serverless DB connection limits** | Vercel functions × Postgres can exhaust connections. **Mitigation:** Neon serverless driver / pooled connection (PgBouncer); keep queries short. |
| **Money correctness** | A wrong number is worse than a late feature. **Mitigation:** `NUMERIC` + decimal strings + the single `@lwi/utils/money` layer; property-tests on valuation. (Unchanged from CLAUDE.md.) |
| **Mock ↔ DB shape drift** | Two implementations can diverge. **Mitigation:** one shared type per domain; both repos implement it; contract tests. |
| **JSONB over-use** | Flexible but unindexable/unvalidated if careless. **Mitigation:** zod-validate on write; promote to columns when filtering/aggregation is needed. |
| **Auth provider lock-in** | Auth.js → enterprise SSO later. **Mitigation:** thin `getCurrentUser()` seam; WorkOS swap is isolated. |
| **Over-building tenancy/CRM** | The explicit anti-goal. **Mitigation:** single-owner `user_id` model; org/RLS deferred to B7 behind a contained migration. |
| **Server Actions are public endpoints** | Easy to treat as "trusted." **Mitigation:** every action validates (zod) + authorizes ownership, same as REST. |
| **Market-data licensing** | Legal, not technical, and on the critical path. **Mitigation:** keep market data mock until commercial terms exist; isolate behind the provider adapter. |
| **AI commentary → advice line** | Regulatory exposure. **Mitigation:** stays educational/non-advice with disclaimer + provenance; counsel before B-anything that reads as personalized advice (SECURITY.md §9). |
| **Backups / DR** | Personal ≠ disposable. **Mitigation:** Neon PITR + tested restores from B3 (once real data exists). |

---

### TL;DR

Run the backend **inside Next.js** over **Neon Postgres + Drizzle + Auth.js**,
**single-owner** (`user_id`) with **no org tenancy yet**. Persist **preferences →
watchlists/screens/notes → portfolio → alerts → risk snapshots**, in that order,
behind a **mock↔DB data-access seam** flipped per domain. Keep **market data and
AI generation mock** until licensing/compliance allow. Preserve — but don't pay
for — the paths to a standalone service, enterprise auth, and tenancy.
