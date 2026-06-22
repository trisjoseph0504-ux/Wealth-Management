# Data Model & Core Schema

**Database:** PostgreSQL 16 + TimescaleDB · **ORM:** Drizzle · **Status:** Design.

This is the conceptual schema and the rules that govern it. The authoritative,
versioned definition lives in `packages/db/src/schema` once implementation
begins. This document is reviewed alongside any migration that changes core
models.

---

## 1. Modeling principles

- **`NUMERIC`, never `float`,** for any money or quantity (see CLAUDE.md §5).
  Money columns are `NUMERIC(20,4)`; share/unit quantities `NUMERIC(28,8)`;
  prices `NUMERIC(20,8)`; rates/percentages `NUMERIC(12,8)`.
- **Every monetary column has a sibling currency** (`*_currency CHAR(3)`,
  ISO-4217) — no implicit currency.
- **Multi-tenant:** every business table carries `org_id` and is protected by
  Row-Level Security. The tenant is the advisory **organization**.
- **Soft delete + audit:** business rows have `created_at`, `updated_at`, and
  (where deletion is allowed) `deleted_at`. Financial _transactions are never
  deleted_ — they are reversed with a new offsetting record.
- **UUIDs** (v7, time-ordered) for primary keys — globally unique, non-guessable,
  index-friendly.
- **Time-series prices** live in a TimescaleDB hypertable, separate from the
  relational core, because their volume and access pattern differ.

## 2. Entity overview

```
org ─┬─< user ─< user_role >─ role
     ├─< advisor ─< advisor_client >─ client ─< account ─< holding ─< holding_lot
     │                                   │          │
     │                                   │          └─< position_valuation (derived)
     │                                   └─< account_transaction
     ├─< portfolio ─< portfolio_account                (account ↔ portfolio grouping)
     ├─< watchlist ─< watchlist_item ─ instrument
     ├─< screen (saved screener)
     ├─< alert_rule ─< alert_event
     ├─< ai_commentary
     ├─< risk_metric (per portfolio/account, time-stamped)
     └─< audit_log (append-only, all mutations)

instrument ─< instrument_price (TimescaleDB hypertable)
```

## 3. Core tables (conceptual)

### Identity, tenancy & access

**`org`** — advisory firm / tenant root.
`id, name, slug, status, created_at, updated_at`

**`user`** — a login identity (advisor or client persona).
`id, org_id, email (unique per org), display_name, status, mfa_enabled,
last_login_at, identity_provider, created_at, updated_at`
_No password column_ — credentials are handled by the auth provider (Auth.js /
WorkOS). We store provider references, not secrets.

**`role`** — `id, key (enum), name, description`. Seeded set:
`owner, admin, advisor, analyst, client, read_only`.

**`user_role`** — `user_id, role_id, org_id, scope` (org-wide or scoped to a set
of clients/portfolios). RBAC is the join of role + resource ownership.

### People & accounts

**`advisor`** — professional profile linked to a `user`.
`id, org_id, user_id, title, credentials, status`

**`client`** — a household / HNW client (may have no login).
`id, org_id, type (individual|household|entity|trust), legal_name,
display_name, primary_advisor_id, risk_profile, kyc_status, onboarded_at,
created_at, updated_at, deleted_at`

**`advisor_client`** — many-to-many advisor↔client with relationship type.

**`account`** — an investment account owned by a client.
`id, org_id, client_id, name, account_type (taxable|ira|roth|trust|...),
custodian, external_ref (tokenized, from aggregator), base_currency,
status, opened_at, created_at, updated_at`
_No raw account numbers/credentials stored_ — only tokenized aggregator refs.

### Securities & positions

**`instrument`** — securities master.
`id, symbol, exchange_mic, name, asset_class (equity|etf|fund|bond|crypto|cash|
option|other), currency, sector, country, isin, cusip, is_active,
created_at, updated_at`
Unique on `(symbol, exchange_mic)`.

**`holding`** — a position: an instrument held in an account (current state).
`id, org_id, account_id, instrument_id, quantity NUMERIC(28,8),
avg_cost NUMERIC(20,8), avg_cost_currency, opened_at, updated_at`
Unique on `(account_id, instrument_id)`.

**`holding_lot`** — tax lots backing a holding (for cost basis / gains).
`id, org_id, holding_id, quantity, cost_basis, cost_basis_currency,
acquired_at, disposed_at NULL, lot_method (fifo|lifo|spec)`

**`account_transaction`** — immutable ledger of activity.
`id, org_id, account_id, instrument_id NULL, type (buy|sell|dividend|interest|
fee|deposit|withdrawal|transfer|split|reversal), quantity, price,
amount, currency, trade_date, settle_date, external_ref,
reverses_transaction_id NULL, created_at`
**Append-only.** Corrections create a `reversal` row referencing the original.

### Portfolios & valuation

**`portfolio`** — an analytical grouping (may span accounts).
`id, org_id, client_id NULL, name, base_currency, benchmark_instrument_id NULL,
created_at, updated_at`

**`portfolio_account`** — `portfolio_id, account_id` (M:N grouping).

**`position_valuation`** *(derived, cached)* — point-in-time valuation snapshot.
`id, org_id, account_id, instrument_id, as_of, quantity, price, price_currency,
market_value, market_value_base, unrealized_pnl, weight`
Recomputed by the valuation job; never hand-edited.

### Time-series prices (TimescaleDB)

**`instrument_price`** — hypertable, partitioned on `ts`.
`instrument_id, ts, open, high, low, close, adj_close, volume, source, granularity
(1m|5m|1h|1d)` · PK `(instrument_id, ts, granularity)`.
Retention/compression policies configured per granularity. Latest-quote reads go
through Redis cache, not this table.

### Watchlists & screener

**`watchlist`** — `id, org_id, owner_user_id, name, created_at, updated_at`
**`watchlist_item`** — `id, watchlist_id, instrument_id, sort_order, note, added_at`
**`screen`** — saved screener definition.
`id, org_id, owner_user_id, name, criteria JSONB (validated against a schema),
created_at, updated_at` — criteria are validated server-side, never trusted raw.

### Alerts & notifications

**`alert_rule`** — `id, org_id, owner_user_id, scope (instrument|portfolio|account),
target_id, condition JSONB (e.g. price/%/risk threshold), channel
(in_app|email|push), is_active, created_at, updated_at`
**`alert_event`** — `id, org_id, alert_rule_id, triggered_at, snapshot JSONB,
delivered_at NULL, status`
**`notification`** — `id, org_id, user_id, type, payload JSONB, read_at NULL,
created_at`

### Risk analytics

**`risk_metric`** — time-stamped risk snapshot per portfolio/account.
`id, org_id, scope, target_id, as_of, volatility, beta, sharpe, max_drawdown,
var_95, exposure JSONB (by asset class/sector/geo), method, created_at`
Computed by the risk job (future Python service per ARCHITECTURE §4).

### AI commentary

**`ai_commentary`** — persisted generated commentary with full provenance.
`id, org_id, scope (market|portfolio|instrument), target_id NULL, as_of,
body TEXT, summary TEXT, model_id, prompt_hash, input_snapshot_ref,
disclaimer_version, generated_by_user_id, created_at`
**Every row carries the disclaimer version and provenance** — required so any
output can be reproduced and audited (see SECURITY.md).

### Audit (cross-cutting, append-only)

**`audit_log`** — `id, org_id, actor_user_id, actor_ip, action, entity_type,
entity_id, before JSONB (redacted), after JSONB (redacted), request_id,
created_at`
Written by an interceptor on every mutation. **Insert-only**; no update/delete
grant on this table even for admins.

## 4. Integrity & performance rules

- Foreign keys enforced everywhere; `ON DELETE` is `RESTRICT` for financial
  links (you cannot delete an account with transactions).
- Composite indexes match real query paths: `(org_id, account_id)`,
  `(org_id, client_id)`, `(account_id, instrument_id)`, price hypertable on
  `(instrument_id, granularity, ts DESC)`.
- All money math that aggregates (portfolio value, P&L) is computed in SQL or the
  decimal layer — never by summing JS numbers.
- Migrations are forward-only and reversible; data backfills are separate,
  idempotent, and batched. See CLAUDE.md §9.

## 5. What is deliberately NOT modeled yet

- Billing/subscription tables (Phase 5+).
- Order/trade _execution_ tables — write access to brokerages is out of scope
  until a separate compliance-reviewed track (ARCHITECTURE §11).
- Document/statement storage metadata (added when document features land).

These are intentional omissions, recorded here so their absence reads as a
decision, not an oversight.
