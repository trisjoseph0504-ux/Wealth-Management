# @lwi/web — Phase 1 Dashboard

The premium institutional dashboard, built with **mock data only** (no APIs, no
auth, no brokerage — per the Phase 1 scope). Next.js 15 (App Router) · React 19 ·
Tailwind CSS v4 · TypeScript strict.

## Prerequisites

- **Node.js 20 LTS** (see repo `.nvmrc`). _Not currently installed on this
  machine_ — install it before running. On Windows: `winget install OpenJS.NodeJS.LTS`.

## Run it

This app is self-contained for Phase 1 — run it directly without workspace setup:

```bash
cd apps/web
npm install
npm run dev          # http://localhost:3000
```

(`pnpm install && pnpm dev` works too, as does running from the repo root once
pnpm is installed.)

Production build:

```bash
npm run build && npm run start
npm run typecheck    # tsc --noEmit
```

## What's here

| Area | Path |
| --- | --- |
| Design tokens (Tailwind v4 `@theme`) | `src/app/globals.css` |
| Financial primitives (`Money`, `Percent`, `Delta`) | `src/components/ui/financial.tsx` |
| UI primitives (`Card`, `Button`, `Badge`, `EmptyState`, …) | `src/components/ui/` |
| Charts (in-house SVG `Sparkline`, `Donut`) | `src/components/ui/` |
| App shell (sidebar, topbar, mobile drawer) | `src/components/shell/` |
| Dashboard panels | `src/components/dashboard/` |
| Portfolio page panels | `src/components/portfolio/` |
| Markets page panels | `src/components/markets/` |
| Watchlists experience | `src/components/watchlists/` |
| Mock data | `src/data/*.ts` (dashboard, portfolio, markets, watchlists) |

### Routes (all mock-data, no auth)

| Route | Page |
| --- | --- |
| `/` | Home dashboard |
| `/portfolio` | Holdings, allocation, sectors, movers, accounts, performance |
| `/markets` | Indices, sector performance, movers, heatmap |
| `/watchlists` | Multi-list management, ticker search/add, remove |
| `/screener` | Advanced filters, sortable results, compare, presets, summary stats |
| `/risk` | Risk analytics — score, beta/vol/Sharpe/VaR, concentration, correlation, scenarios |
| `/alerts` | Alerts & notifications — severity levels, drift/risk/price/earnings, read/archive/filter |
| `/intelligence` | Advisor Intelligence Center — daily briefing, ranked evidence-based insights, monitor/dismiss/create-alert |
| `/notes` | Research Notes — investment memos (create/edit/pin/delete), persisted through the data seam |
| `/security/[symbol]` | Instrument detail — chart, stats, exposure, thesis, bull/bear, news, risk |

> **Dev note (Windows):** this repo lives at `C:\dev\lewis-wealth-intelligence`
> (deliberately **outside** OneDrive). Keep it there — building under a
> OneDrive-synced folder caused `.next` file locks (`EBUSY`) mid-build and
> spurious `next dev` Fast Refreshes that reset client-component state.

## Phase 1 boundaries (intentional)

- Mock data only; `src/data/mock.ts` mirrors the future domain shapes so the
  swap to a real API is a fetch change, not a UI rewrite.
- No authentication, no real market data, no brokerage.
- AI commentary & risk are **labeled placeholders** — but the AI disclaimer +
  provenance note already ship (guardrail before feature, per `docs/SECURITY.md`).
- Charting is in-house SVG; TradingView Lightweight Charts + Visx arrive in Phase 3.
