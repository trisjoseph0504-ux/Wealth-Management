/**
 * Migration runner (Backend B0+). Applies the generated SQL migrations using the
 * SAME SSL-aware postgres.js connection the app uses, so Neon (which requires SSL)
 * works out of the box and errors are surfaced clearly. Run: `npm run db:migrate`.
 */
import "@/server/load-env";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (put it in apps/web/.env.local).");
  process.exit(1);
}

const ssl = /neon\.tech|sslmode=require/.test(url) ? "require" : undefined;
const sql = postgres(url, { max: 1, ssl });
const db = drizzle(sql);

migrate(db, { migrationsFolder: "./src/server/db/migrations" })
  .then(async () => {
    console.log("✓ Migrations applied.");
    await sql.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("✗ Migration failed:", err?.message ?? err);
    await sql.end().catch(() => {});
    process.exit(1);
  });
