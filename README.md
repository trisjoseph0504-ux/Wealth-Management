# Lewis Wealth Intelligence (LWI)

> Institutional-grade financial intelligence and wealth management platform.
> Built for serious advisors and high-net-worth clients.

**Status:** Foundation / pre-implementation. No feature code yet — this repository
currently establishes architecture, standards, and the engineering system that
every future build phase must follow.

---

## What this is

A premium, dark-luxury financial platform combining portfolio analytics, market
data visualization, risk analytics, AI-assisted market commentary, and
client/advisor management. The product target is the visual and functional
seriousness of a Bloomberg Terminal / BlackRock Aladdin, delivered with modern
fintech polish.

> **Reality check (read this).** Bloomberg and Aladdin represent thousands of
> engineer-years and, more importantly, _licensed data and regulatory
> infrastructure_. We can match the **feel** and the **engineering discipline**
> from day one. We cannot match the **data breadth** until commercial market-data
> agreements are in place. Architecture here is built so that the data layer is a
> swappable boundary, not a rewrite. See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Core capabilities (planned, phased)

- Portfolio analytics dashboard
- Holdings & allocation breakdown
- Watchlists
- Stock screener
- Market data visualization
- AI-generated market commentary _(clearly labeled, non-advisory — see [docs/SECURITY.md](./docs/SECURITY.md))_
- Risk analytics
- Alerts & notifications
- Client / advisor management
- Authentication & role-based access control (RBAC)
- Future brokerage & market-data API integrations (via aggregators, tokenized)

## Tech stack (summary)

| Layer            | Choice                                              |
| ---------------- | --------------------------------------------------- |
| Monorepo         | Turborepo + pnpm workspaces                         |
| Frontend         | Next.js 15 (App Router), React 19, TypeScript strict |
| Styling          | Tailwind CSS v4 + design-token preset (`@lwi/ui`)   |
| Components        | Radix UI primitives (headless) + in-house `@lwi/ui` |
| Data tables      | AG Grid (holdings, screener)                         |
| Charts           | TradingView Lightweight Charts (price) + Visx (analytics) |
| Client state     | Zustand                                             |
| Server state     | TanStack Query                                      |
| Backend          | NestJS modular monolith (TypeScript)                |
| API contract     | OpenAPI + shared `@lwi/types` (typed client)        |
| Database         | PostgreSQL + TimescaleDB (time-series)              |
| ORM              | Drizzle ORM (SQL-first, decimal-safe)               |
| Cache / queues   | Redis + BullMQ                                      |
| Auth             | Auth.js v5 now; architected to swap to WorkOS SSO   |
| AI               | Anthropic Claude (latest Opus/Sonnet) via server proxy |

Full reasoning, alternatives, and rejected options: [ARCHITECTURE.md](./ARCHITECTURE.md).

## Repository layout

```
lewis-wealth-intelligence/
├─ apps/
│  ├─ web/          # Next.js frontend
│  └─ api/          # NestJS backend (modular monolith)
├─ packages/
│  ├─ ui/           # Design tokens + shared component library
│  ├─ db/           # Drizzle schema + migrations
│  ├─ types/        # Shared domain types / API contracts
│  ├─ utils/        # Money/decimal, formatting, pure helpers
│  └─ config/       # Shared eslint / tsconfig / tailwind preset
├─ docs/            # DESIGN_SYSTEM, SECURITY, ROADMAP, DATA_MODEL
└─ tooling/         # Repo scripts
```

## Getting started

**Phase 1 (current): the web dashboard runs on mock data.** Requires Node 20+ (24 LTS verified).

```bash
cd apps/web
npm install       # deps hoist to the workspace root (npm workspaces)
npm run dev       # http://localhost:3000
npm run build     # verified: compiles, types pass, static export OK
```

The eventual full-stack workflow (`pnpm dev` running web + api via Turbo)
activates when the API app lands in Phase 1's identity milestone. See
[apps/web/README.md](./apps/web/README.md).

## Key documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design, boundaries, trade-offs
- [CLAUDE.md](./CLAUDE.md) — coding standards & project rules (read before any PR)
- [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) — brand, tokens, components
- [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) — schema & core models
- [docs/SECURITY.md](./docs/SECURITY.md) — security & financial-compliance guardrails
- [docs/ROADMAP.md](./docs/ROADMAP.md) — phased milestones

## License

Proprietary — © Lewis Wealth Intelligence. All rights reserved.
