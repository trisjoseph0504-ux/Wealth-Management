# Provisioning Neon (making persistence real)

A beginner-friendly walkthrough to move LWI from in-memory mock data to a real
Postgres database on **Neon**. You do steps 1–3 in the browser; the rest are
commands. The app keeps working on mock data until you flip the final switch, so
nothing breaks while you set up.

> Everything on the code side is already prepared: the schema, a baseline
> migration, a seed script, and `.env.local` loading for the scripts.

---

## 1. Create the Neon project

1. Go to **https://neon.tech** and sign up (free tier is plenty; you can log in
   with GitHub or Google).
2. Click **Create project** (or **New Project**).
3. Fill in:
   - **Name:** `lewis-wealth-intelligence` (anything).
   - **Postgres version:** leave the default (latest).
   - **Region:** pick the one closest to you (e.g. *US East*).
4. Click **Create project**. Neon creates a database (usually named `neondb`) and
   shows you a **Connection string**.

## 2. Get the DATABASE_URL

On the project dashboard there's a **Connection Details** box with a connection
string that looks like:

```
postgresql://alex:AbC123xyz@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

- Click **Copy**. That whole string is your `DATABASE_URL`.
- Keep `?sslmode=require` at the end — Neon needs SSL (our client handles it).
- If you see a **Connection pooling** toggle and migrations later misbehave, copy
  the **unpooled / direct** string instead (see Troubleshooting). Either works to
  start.

> Treat this string like a password — it grants full access to your database.
> It goes only in `.env.local`, which is gitignored (never committed).

## 3. Where to put it

Open **`apps/web/.env.local`** (already created for you). Paste your string and
remove the leading `# ` so it becomes active:

```
DATA_SOURCE=mock
DATABASE_URL=postgresql://...your copied string...
```

Leave `DATA_SOURCE=mock` for now — we flip it to `db` in step 6.

## 4. Run the migration (creates the tables)

In a terminal:

```powershell
cd C:\dev\lewis-wealth-intelligence\apps\web
npm run db:migrate
```

This applies the baseline migration and creates all 16 tables. Expected output
ends with something like `migrations applied` / no errors. (It reads the URL from
`.env.local` automatically.)

## 5. Run the seed (loads your starting data)

```powershell
npm run db:seed
```

This inserts the instrument list and a demo user with the default portfolio and
watchlists, drawn from the existing mock data. Expected output:

```
Seeded demo user tristan@lewiswealth.example: 15 holdings, 4 watchlists.
```

(Notes and saved screens start empty in the database — you create those yourself,
and they'll persist.)

## 6. Verify DATA_SOURCE=db works

1. Edit **`apps/web/.env.local`** and change:
   ```
   DATA_SOURCE=db
   ```
2. Start the app:
   ```powershell
   npm run dev
   ```
3. Open **http://localhost:3000/watchlists** — you should see the seeded lists
   (Core Holdings, Tech Leaders, Dividend & Defensive, New Ideas) — now served
   **from Postgres**.
4. **The real proof of persistence:** create a new watchlist, then **stop** the
   dev server (Ctrl+C) and **restart** it (`npm run dev`), and reload the page.
   The new list is still there. (In mock mode it would have reset — real DB data
   survives restarts and would sync across devices.)
5. Try `/notes` too: create a memo, restart, reload — it persists.

That's it — persistence is real. To switch back to mock anytime, set
`DATA_SOURCE=mock`.

## 7. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `DATABASE_URL is required when DATA_SOURCE=db` | You set `DATA_SOURCE=db` but the `DATABASE_URL` line is missing, blank, or still commented (`#`). Fix `.env.local`. |
| `ENOTFOUND` / `getaddrinfo` | Host in the URL is wrong/typo'd. Re-copy the full string from Neon. |
| `password authentication failed` | Wrong password in the URL. Re-copy from Neon (or reset the password in the dashboard). |
| SSL / "server does not support SSL" / "SSL required" | Make sure `?sslmode=require` is at the end of the URL. |
| Migrate errors mentioning **pooler** / "prepared statement" / "unsupported startup parameter" | Use the **direct (unpooled)** connection string for migrate/seed: in Neon's connection box, turn **Connection pooling** off and copy that URL. |
| `relation "..." already exists` when re-running migrate | The migration already ran — that's fine, it's a no-op. Only re-generate (`npm run db:generate`) if you changed the schema. |
| App still shows mock data after setting `DATA_SOURCE=db` | Restart `npm run dev` — env changes need a server restart. Confirm `.env.local` is saved and has no typo. |
| First request is slow | Neon free tier auto-suspends after inactivity; the first query "wakes" it (a few seconds). Normal. |
| Re-running `db:seed` | Safe — it upserts instruments/user and rebuilds the demo portfolio/watchlists each time. |

### Quick reference

```powershell
cd C:\dev\lewis-wealth-intelligence\apps\web
npm run db:migrate    # create tables
npm run db:seed       # load starting data
# set DATA_SOURCE=db in .env.local, then:
npm run dev           # app now reads/writes Postgres
npm run db:studio     # optional: browse the data in Drizzle Studio
```
