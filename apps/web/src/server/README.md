# Server layer (Backend B0)

Server-only backend foundation for LWI. See [docs/BACKEND_ARCHITECTURE.md](../../../../docs/BACKEND_ARCHITECTURE.md).
Modules here must **not** be imported from Client Components.

```
src/server/
├─ env.ts              # zod-validated env; DATABASE_URL optional (required only for DATA_SOURCE=db)
├─ db/
│  ├─ schema.ts        # Drizzle schema (v1, single-owner) — Auth.js + domain tables
│  ├─ client.ts        # lazy Drizzle client (connects on first use only)
│  ├─ migrations/      # generated SQL (drizzle-kit generate)
│  └─ seed.ts          # seeds DB from the existing mock modules
├─ data/               # the mock↔DB data-access seam
│  ├─ types.ts         # repository interfaces (one source of truth)
│  ├─ index.ts         # getData() — returns mock or db repos by DATA_SOURCE
│  ├─ mock/            # mock impls (wrap src/data/*-mock)
│  └─ db/              # Drizzle impls (used when DATA_SOURCE=db)
├─ auth/               # B1 — gated by AUTH_ENABLED (off by default = demo mode)
│  ├─ config.ts        # edge-safe Auth.js config (providers/pages/callbacks)
│  ├─ instance.ts      # NextAuth + Drizzle adapter (loaded only when enabled)
│  ├─ index.ts         # authEnabled + getSession()
│  └─ current-user.ts  # getCurrentUser() — demo user, or session user when enabled
└─ actions/            # server actions (the API surface for the app)
   ├─ preferences.ts   # setThemeAction → preferences repo (LIVE, B1)
   └─ auth.ts          # gated sign-in/out actions
```

Also: `src/middleware.ts` (gated route protection) and `app/sign-in/page.tsx`.

## How the seam works

Callers (Server Actions / Route Handlers, added in Phase B1) read through one
factory, never a concrete impl:

```ts
import { getData } from "@/server/data";
const { watchlists } = getData();
const lists = await watchlists.list(userId);
```

Flip a domain from mock to real persistence by setting `DATA_SOURCE=db` (and
`DATABASE_URL`). With `DATA_SOURCE=mock` (default) nothing connects to a database
— the app behaves exactly as before. **B0 implements `preferences` and
`watchlists`** as the worked pattern; other domains land in B2–B5.

## Database scripts (need a provisioned Postgres)

```bash
npm run db:generate   # schema → SQL migration (no DB needed)
npm run db:migrate    # apply migrations           (needs DATABASE_URL)
npm run db:seed       # seed from mock data         (needs DATA_SOURCE=db + DATABASE_URL)
npm run db:studio     # Drizzle Studio
```

## Enabling auth (Backend B1)

Off by default. To turn on real sign-in:

1. Provision Postgres, set `DATA_SOURCE=db` + `DATABASE_URL`, run `db:migrate` + `db:seed`.
2. Set `AUTH_ENABLED=true`, `AUTH_SECRET`, and a provider:
   - Magic link: `AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM`
   - Google (optional): `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
3. Middleware then gates routes to `/sign-in`; `getCurrentUser()` resolves the
   session user; the theme (and all user data) persists per real account.

## Status

- **B0** — foundation: schema, migrations, env, lazy client, data seam, seed. ✅
- **B1** — **theme/preferences persist end-to-end through the seam** (live in mock
  mode; DB when flipped). Auth.js scaffolding in place but **gated off**.
- **B2** — **watchlists, saved screens, and research notes** are routed through the
  seam: pages load via server actions (dynamic), the UIs persist via server
  actions, and changes **survive reloads** (verified in mock mode; one-flag flip
  to Postgres). New **Research Notes** feature added (`/notes`).
- **B3** — **portfolio/holdings persist to Postgres**. The Portfolio page loads
  holdings through the seam and derives everything live (`portfolio-derive.ts`);
  holdings are editable (add/remove) and survive restarts. Verified on Neon.
- **Next (B4+)** — alerts + risk snapshots; wire the analytics pages
  (risk/intelligence/alerts) to the live holdings.
