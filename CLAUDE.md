# CLAUDE.md — Engineering Standards & Project Rules

This file governs how code is written in Lewis Wealth Intelligence. It applies to
every contributor, human or AI. **Read it before writing or reviewing any code.**
When a rule here conflicts with habit, the rule wins. When you believe a rule is
wrong, change it via PR — do not ignore it.

---

## 0. Prime directives

1. **Correctness over speed.** This is regulated financial software. A wrong
   number is worse than a late feature.
2. **No money in floats. Ever.** See §5. This is the rule most likely to be
   violated by reflex — treat any `number` touching currency/quantity as a bug.
3. **The browser is untrusted.** Never compute valuations, entitlements, or
   prices client-side as the source of truth. Never put secrets in the client.
4. **Boundaries are sacred.** External vendors (market data, brokerage, AI) are
   only reachable through their adapter interface. No vendor SDK import inside
   feature/domain code.
5. **Every mutation is audited.** If you change financial or client data without
   an audit trail, the change is incomplete.

## 1. Language & tooling

- **TypeScript, `strict: true`**, plus `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`. `any` is banned (`unknown` + narrowing instead).
  An `any` requires an inline `// eslint-disable` _with a reason_.
- **pnpm** is the only package manager. No `npm`/`yarn` lockfiles.
- **Node 20 LTS** (`.nvmrc`). **Turborepo** orchestrates tasks.
- Lint/format: **ESLint (flat config) + Prettier**, shared from `@lwi/config`.
  CI fails on warnings.
- All code, comments, identifiers, and docs in **English**.

## 2. Project structure rules

- Monorepo packages are imported by alias (`@lwi/ui`, `@lwi/types`, `@lwi/utils`,
  `@lwi/db`). No deep relative imports across package boundaries (`../../../`).
- **Frontend feature-first.** UI lives under `apps/web/src/features/<feature>/`
  (components, hooks, api, types co-located). Shared, generic, presentational
  components go in `@lwi/ui`. A component in `@lwi/ui` may not import a feature.
- **Backend module-first.** Each `apps/api/src/modules/<m>` is a vertical slice:
  `*.controller.ts` (HTTP only) → `*.service.ts` (domain logic) →
  `*.repository.ts` (data access). Controllers contain no business logic;
  repositories contain no business logic.
- **Dependency direction:** `app → feature/module → domain → adapters`. Never the
  reverse. Domain code does not import HTTP, React, or vendor SDKs.

## 3. Naming conventions

| Thing                      | Convention            | Example                    |
| -------------------------- | --------------------- | -------------------------- |
| Files (TS/React)           | kebab-case            | `portfolio-summary.tsx`    |
| React components           | PascalCase            | `PortfolioSummary`         |
| Variables / functions      | camelCase             | `computeAllocation`        |
| Types / interfaces / enums | PascalCase            | `HoldingLot`, `RiskTier`   |
| Constants                  | UPPER_SNAKE_CASE      | `DEFAULT_CURRENCY`         |
| DB tables / columns        | snake_case            | `holding_lots`, `org_id`   |
| Booleans                   | `is/has/should` prefix| `isSettled`, `hasMfa`      |
| Money-typed values         | suffix the unit       | `marketValueUsd: Decimal`  |

No abbreviations that aren't industry-standard (`qty`, `pnl`, `ytd` ok;
`usr`, `acct`, `prt` not). Don't encode type in name (`strName`).

## 4. Components & UI standards

- **Design tokens only.** No hardcoded hex, px, or font values in components.
  Consume tokens from `@lwi/ui/tokens`. See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md).
- **No gold, no yellow, anywhere** — including caution/warning states (we use a
  cool neutral, not amber). Enforced by a lint rule on token usage.
- Components are **typed, documented, and presentational by default.** Data
  fetching lives in hooks (`useX`), not inside presentational components.
- **Financial numbers use tabular figures**, right-aligned in tables, with
  explicit sign and currency. Use the shared `<Money>` / `<Percent>` /
  `<Delta>` primitives — never format currency ad hoc.
- Accessibility is a requirement, not a nicety: semantic HTML, focus states,
  WCAG AA contrast (the dark theme tokens are pre-checked), keyboard nav.
- No layout shift on data load — reserve space, use skeletons from `@lwi/ui`.
- Animation is restrained and purposeful (Framer Motion). No bouncy/playful
  motion — this is institutional software.

## 5. Money & numeric rules (expanded — the most important section)

- Currency/quantity values are **`Decimal`** (from `@lwi/utils/money`) in code
  and **`NUMERIC`** in the DB. Never `number`, never `parseFloat`.
- JSON transports money as a **decimal string** + ISO-4217 currency code:
  `{ "amount": "1234.56", "currency": "USD" }`. Never a bare number.
- All arithmetic on money goes through `@lwi/utils/money` (`add`, `sub`, `mul`,
  `allocate`, `round`). Direct `+ - * /` on currency is a review-blocking bug.
- Rounding is **banker's rounding (half-even)** unless a regulation specifies
  otherwise; the rule is centralized and unit-tested.
- Percentages and rates keep enough precision (≥6 dp) until the _final_ display
  rounding. Never round intermediate results.
- Every value with a unit states it: basis points vs percent, shares vs units,
  gross vs net. Ambiguity here causes real financial error.

## 6. API & data-access rules

- The contract is **`@lwi/types`**. Request/response shapes are validated with
  **zod** at the boundary (both ends). Never trust unvalidated input.
- Every write endpoint touching money/positions is **idempotent** (idempotency
  key) and wrapped in a DB transaction.
- All queries are **tenant-scoped** by `org_id` at the repository layer; RLS is
  the backstop. A query without tenant scope is a security bug.
- No N+1 in analytical paths; prefer set-based SQL. Pagination is mandatory on
  list endpoints — no unbounded result sets.
- Errors return a typed envelope `{ error: { code, message, details? } }`. Never
  leak stack traces, SQL, or internal identifiers to the client.

## 7. Security rules (summary — full text in docs/SECURITY.md)

- Secrets only via env/secret manager, validated at boot. **Never** commit
  secrets; CI runs secret scanning. A leaked secret is rotated, not deleted.
- AI calls, market-data keys, and brokerage tokens are **server-side only**.
- AuthZ is checked on the server for every request: role **and** resource
  ownership. Never rely on the UI hiding a control.
- All PII/financial data encrypted in transit (TLS) and at rest. Logs must not
  contain PII, full account numbers, tokens, or money tied to identity.
- Dependencies: pinned, audited (`pnpm audit` in CI), and reviewed before add.
  Prefer fewer, well-maintained deps over many trendy ones.

## 8. Testing standards

- **Unit tests are mandatory for:** all money/decimal logic, valuation, risk
  math, allocation, RBAC checks, and any adapter mapping. These get edge-case
  and property-based tests, not just happy path.
- Integration tests cover each API module's controller→repository path against a
  real Postgres (testcontainers), not mocks-of-mocks.
- E2E (Playwright) covers critical user journeys per phase.
- A bug fix ships with a test that fails before the fix. No exceptions.
- Coverage is a signal, not a target to game; uncovered money/auth code blocks
  merge.

## 9. Git & PR workflow

- Trunk-based with short-lived branches: `feat/…`, `fix/…`, `chore/…`,
  `docs/…`. **Never commit directly to `main`.**
- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`…).
- PRs are small and single-purpose, link an issue, and pass CI (lint, types,
  tests, build, secret scan) before review. Two-thumbs for anything touching
  money, auth, or migrations.
- Commit messages and PRs end with the co-author trailer when AI-assisted:

  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```

- DB migrations are reviewed separately, are reversible, and never edited after
  merge — fix forward with a new migration.

## 10. AI / Claude-specific working rules

- **Plan before building.** For non-trivial work, propose the approach and the
  files you'll touch before writing code.
- **Stay in scope.** Do exactly what's asked; flag adjacent issues, don't
  silently expand the change.
- **Respect the boundaries above** — especially money types, vendor adapters,
  and "the browser is untrusted." These are the rules an LLM is most likely to
  violate by pattern-matching to generic tutorials. Don't.
- When generating AI commentary code, always attach the non-advice disclaimer
  and provenance metadata (model id, timestamp, prompt hash). See SECURITY.md.
- Verify, don't assume: if you change behavior, run the relevant tests/build and
  report the actual result. Never report success you didn't observe.
- Match surrounding code style; don't introduce a new pattern when an
  established one exists.

## 11. Definition of Done

A change is done when: it meets the spec; types pass; lint passes; tests
(including new ones) pass; money/auth paths are covered; docs/ADRs updated if
behavior or decisions changed; no secrets/PII in code or logs; and it has been
reviewed. "It runs on my machine" is not done.
