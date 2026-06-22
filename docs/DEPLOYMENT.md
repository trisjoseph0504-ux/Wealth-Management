# Deploying Lewis Wealth Intelligence (Vercel)

Goal: get LWI online at a private URL you can open from your phone or any device.
Everything in the codebase is ready. The remaining steps need **your** GitHub and
Vercel accounts — they involve signing in, which only you can do. Budget ~15 min.

> **Security note.** Your secrets (database password, Finnhub key) live only in
> `apps/web/.env.local`, which is git-ignored and will **never** be pushed. On
> Vercel you paste those same values into the encrypted "Environment Variables"
> screen — not into any file.

---

## Step 1 — Create a GitHub account + repo (if you don't have one)

1. Go to <https://github.com> and sign up (free). Verify your email.
2. Click the **+** (top-right) → **New repository**.
   - Name: `lewis-wealth-intelligence`
   - Visibility: **Private** (recommended — keeps your code yours).
   - Do **not** add a README/.gitignore/license (the repo already has them).
3. Click **Create repository**. Leave the page open — you'll need the URL it shows
   (looks like `https://github.com/<you>/lewis-wealth-intelligence.git`).

## Step 2 — Push the code to GitHub

The code is **already committed** locally (first commit done). You just need to
connect the GitHub repo and push. Run these (replace `<URL>` with the repo URL from
Step 1) — or paste me the URL in chat and I'll run them for you:

```bash
cd C:\dev\lewis-wealth-intelligence
git branch -M main
git remote add origin <URL>
git push -u origin main
```

GitHub will ask you to authenticate the first time (a browser popup) — that part is
yours to approve.

## Step 3 — Create a Vercel account

1. Go to <https://vercel.com> → **Sign Up** → **Continue with GitHub** (easiest;
   it links the two so Vercel can see your repo).
2. Approve the GitHub authorization when prompted.

## Step 4 — Import the project

1. Vercel dashboard → **Add New…** → **Project**.
2. Find `lewis-wealth-intelligence` → **Import**.
3. **Important — Root Directory:** click **Edit** and set it to `apps/web`.
   (The app lives there; the repo is a monorepo.)
4. Framework Preset should auto-detect **Next.js**. Leave Build/Install commands
   on their defaults.

## Step 5 — Add environment variables

Before clicking Deploy, expand **Environment Variables** and add these four. Copy
the **values** from your `apps/web/.env.local` file:

| Name | Value | Notes |
|------|-------|-------|
| `DATA_SOURCE` | `db` | Use the real database. |
| `DATABASE_URL` | *(your Neon URL)* | **Use the POOLED URL** — see below. |
| `MARKET_DATA_PROVIDER` | `finnhub` | Real prices + search. |
| `FINNHUB_API_KEY` | *(your Finnhub key)* | From `.env.local`. |

**Pooled `DATABASE_URL` (do this):** Vercel runs serverless functions that open
many short-lived connections, so use Neon's **pooled** host. In the Neon dashboard,
the pooled connection string has `-pooler` in the host (e.g.
`...-pooler.c-3.us-east-1.aws.neon.tech...`). Keep `?sslmode=require` on the end.
(Your local file uses the direct host, which is correct for local dev/migrations —
they can differ.)

## Step 6 — Deploy

Click **Deploy**. First build takes ~2–3 min. When it finishes you get a URL like
`https://lewis-wealth-intelligence.vercel.app`. Open it on your phone — done.

Every future `git push` to `main` auto-deploys the new version.

---

## Troubleshooting

- **Build fails on "DATABASE_URL not set"** → the env var didn't save, or is on the
  wrong environment. In Project → Settings → Environment Variables, make sure all
  four are set for **Production** (and Preview, if you want preview deploys to work).
  Re-deploy from the Deployments tab.
- **Pages load but data is empty / errors** → almost always the `DATABASE_URL`.
  Confirm it's the pooled host and ends with `?sslmode=require`.
- **"Module not found" / install errors** → confirm Root Directory is `apps/web`
  and that "Include files outside the root directory" stayed enabled (default).
- **Want a custom domain later** → Project → Settings → Domains.

## What I can do for you in chat
- Run the Step 2 git commands once you give me the GitHub repo URL.
- Double-check the pooled `DATABASE_URL` format (paste it and I'll verify — though
  you may prefer to handle the secret yourself in the Vercel UI).
- Walk through any error message from the Vercel build log.
