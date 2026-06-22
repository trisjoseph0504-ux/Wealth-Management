import { config as loadEnv } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env.local (then .env) so DATABASE_URL is available to drizzle-kit.
loadEnv({ path: ".env.local" });
loadEnv();

/**
 * drizzle-kit config. `generate` (schema → SQL) needs no live DB; `migrate`/`push`
 * use dbCredentials.url (DATABASE_URL) when a database is provisioned.
 */
export default {
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/lwi",
  },
  strict: true,
  verbose: true,
} satisfies Config;
