# Security & Compliance Guardrails

**Scope:** This document defines the non-negotiable guardrails for handling
financial data, personal data, credentials, and AI output in Lewis Wealth
Intelligence. It is binding. Where it says "must," a violation blocks merge or
release.

> **Disclaimer about this document:** these are sound _engineering_ guardrails.
> They are **not legal advice** and do not by themselves establish regulatory
> compliance. Before handling real client data or real money, engage qualified
> legal/compliance counsel for your jurisdiction (US: SEC/FINRA/state RIA rules,
> GLBA, state privacy law; EU/UK: GDPR/UK-GDPR, MiFID II; plus PCI-DSS if cards
> are ever touched). See §9.

---

## 1. Data classification

| Class             | Examples                                              | Handling                                  |
| ----------------- | ----------------------------------------------------- | ----------------------------------------- |
| **Restricted**    | SSNs/tax IDs, account numbers, brokerage tokens, auth secrets | Encrypted at rest (column-level), never logged, access audited, strict RBAC |
| **Confidential**  | Holdings, balances, transactions, client PII, AI commentary tied to a client | Encrypted at rest + transit, tenant-isolated, audited |
| **Internal**      | Aggregated/anonymized analytics, app config           | Standard protection                       |
| **Public**        | Marketing copy, public docs                           | No special handling                       |

Every new column is classified at design time. Restricted data is minimized — if
we don't need it, we don't store it.

## 2. Identity, authentication, authorization

- **No custom crypto or password handling.** Use the auth provider (Auth.js v5
  now; WorkOS/Auth0 for enterprise SSO/SAML/SCIM later). We store provider
  references, never raw passwords.
- **MFA** required for all advisor/admin/staff accounts; available and encouraged
  for clients. Step-up auth for sensitive actions (e.g., changing payout details).
- **Authorization is server-side and double-checked:** (1) role (RBAC) and
  (2) resource ownership/tenant scope. The UI hiding a control is _never_ the
  access control. Every endpoint authorizes the specific resource.
- **Tenant isolation** enforced at the repository layer _and_ Postgres RLS.
  Cross-tenant data access is a Sev-1 incident.
- Sessions: short-lived, rotating, `HttpOnly` + `Secure` + `SameSite` cookies;
  server-side revocation; idle and absolute timeouts.
- Principle of **least privilege** for users, services, and DB roles. The app DB
  user cannot `DELETE` from `audit_log` or financial ledgers.

## 3. Secrets & key management

- Secrets live only in a secret manager / env, **validated at boot with zod**.
  Never in the repo, never in client bundles, never in logs.
- CI runs **secret scanning**; a hit fails the build. A leaked secret is
  **rotated** (and treated as an incident), not just removed from history.
- Market-data keys, AI keys, and brokerage tokens are **server-side only** and
  scoped per environment. Restricted data uses envelope encryption (KMS-managed
  data keys); keys are rotated on a schedule.

## 4. Network, transport & storage

- **TLS 1.2+ everywhere**, HSTS on. No plaintext transport, ever.
- Encryption at rest for the database, backups, and object storage; column-level
  encryption for Restricted fields on top of disk encryption.
- Strict security headers (CSP, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy); CORS locked to known origins.
- Backups encrypted, access-controlled, **restore-tested**, with point-in-time
  recovery on the primary DB.

## 5. Application security (the usual, enforced)

- **Validate all input** at the boundary with zod; reject, don't coerce. Output
  encode to prevent XSS. ORM/parameterized queries only — **no string-built SQL.**
- **CSRF** protection on state-changing requests; **idempotency keys** on money
  writes (also a correctness control).
- **Rate limiting** (Redis-backed) per user and per IP, with stricter limits on
  auth and AI endpoints; lockout/backoff on repeated auth failure.
- Dependencies pinned and audited (`pnpm audit` + SCA in CI); minimal surface;
  reviewed before adding. SAST + dependency review run in CI.
- No PII, account numbers, tokens, or money-tied-to-identity in logs, error
  messages, traces, or analytics events. Errors to clients are typed and generic.

## 6. Audit & monitoring

- **Append-only `audit_log`** records every mutation of financial/client data:
  who, what, when, before/after (redacted), request id, IP. No one can edit or
  delete it (§2). This is a compliance control, not just debugging.
- Centralized, structured logging (PII-scrubbed) + distributed tracing
  (OpenTelemetry). Alerting on auth anomalies, authz failures, rate-limit
  breaches, and unusual data export volume.
- Health checks and uptime monitoring per service; security events route to an
  on-call channel.

## 7. AI / market-commentary compliance (high-risk — read carefully)

AI-generated commentary is the feature most likely to create regulatory and
liability exposure. Guardrails:

- **Not investment advice.** Every AI output is wrapped with a clear,
  versioned disclaimer stating it is informational, AI-generated, and not
  personalized investment advice or a recommendation. The `disclaimer_version`
  is persisted with the output (DATA_MODEL `ai_commentary`).
- **Provenance & reproducibility.** Persist `model_id`, `prompt_hash`,
  `input_snapshot_ref`, and timestamp for every generation, so any statement can
  be reproduced and audited.
- **Server-side only.** The AI key never reaches the client. Prompts are built
  from server-validated context; user input into prompts is sanitized and
  treated as untrusted (prompt-injection aware). The model cannot trigger trades,
  data exports, or privileged actions — it produces text only.
- **No fabricated certainty.** Commentary must not present figures it wasn't
  given, must label estimates, and must not guarantee performance. Outputs that
  could read as a recommendation are filtered/flagged for review.
- **Human-in-the-loop where it matters.** Client-facing commentary can require
  advisor review before publication (config per org).
- **Tenant data isolation in prompts.** Never include one tenant's data in
  another tenant's generation context.

## 8. Third-party integrations (market data & brokerage)

- **Brokerage access is read-only and tokenized** via aggregators (Plaid /
  SnapTrade). We **never** store brokerage credentials; we store revocable
  tokens encrypted at rest. **Placing trades / moving money is out of scope** for
  v1 and gated behind a separate, audited, compliance-reviewed track.
- **Market-data licensing must be respected.** Real-time/pro data carries
  redistribution and display restrictions and per-seat/usage costs. Do not
  display or redistribute data beyond the license. This is a legal constraint
  enforced in product, not just a technical one. (ARCHITECTURE §11.)
- Vendor calls go through adapters with timeouts, retries, circuit breakers, and
  no leakage of our secrets to them.

## 9. Compliance posture & process

- **Regulatory classification first.** Whether LWI is a tool vendor vs. acting as
  / for a Registered Investment Adviser changes obligations dramatically. Resolve
  this with counsel before Phase 3 (AI/risk features that resemble advice).
- Likely-relevant regimes to evaluate (non-exhaustive, jurisdiction-dependent):
  SEC/FINRA & state RIA rules, GLBA Safeguards Rule, SOC 2 (clients will ask),
  GDPR/UK-GDPR & CCPA/CPRA for personal data, MiFID II if EU. PCI-DSS only if
  card data is ever handled (prefer never — use a processor).
- **Data subject rights & retention:** support export and deletion requests
  within legal limits (financial records often have mandatory retention that
  overrides deletion — encode retention rules, don't hard-delete ledgers).
- **Incident response plan** with defined severities, breach-notification
  timelines, and a runbook — written before prod, not after an incident.
- **Vendor due diligence** (DPAs, sub-processor lists) for every processor of
  Confidential/Restricted data, including the AI provider.

## 10. Security in the SDLC

- Threat-model new features that touch money, auth, PII, or external integration.
- Security review required for: auth changes, new external integrations,
  migrations touching Restricted data, and anything changing the AI prompt path.
- Secrets scanning, SAST, dependency review, and IaC scanning run in CI on every
  PR. Pen-test before any public/prod launch handling real data.
- Least-privilege CI/CD; no long-lived cloud creds; environments isolated;
  preview/staging use **synthetic or masked data only — never real client PII.**

---

### Guardrail quick list (pin this)

1. Money/PII encrypted in transit + at rest; Restricted data column-encrypted.
2. No secrets/PII in repo, client bundle, logs, or AI prompts cross-tenant.
3. AuthZ server-side: role **and** ownership, every request, RLS backstop.
4. AI output: disclaimer + provenance, server-side, text-only, no privileged power.
5. Brokerage = read-only tokenized; no credential storage; no trading in v1.
6. Append-only audit log on every mutation; financial ledgers never deleted.
7. Validate all input; parameterized queries; rate-limit; idempotent money writes.
8. Get legal/compliance counsel before touching real client data or money.
