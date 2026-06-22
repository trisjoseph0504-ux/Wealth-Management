/**
 * Lazy Drizzle client (postgres.js). Backend B0.
 *
 * The connection is created ONLY on first use, so importing this module never
 * forces a database connection — the app runs fine with DATA_SOURCE=mock and no
 * DATABASE_URL. Server-only by convention.
 */
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/server/env";
import { schema } from "@/server/db/schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!env.DATABASE_URL) {
    throw new Error("getDb() called without DATABASE_URL — set DATA_SOURCE=db and DATABASE_URL.");
  }
  if (!_db) {
    // Neon (and most hosted Postgres) require SSL; enable it automatically.
    const needsSsl = /neon\.tech|sslmode=require/.test(env.DATABASE_URL);
    // max:1 keeps connection count sane under serverless; tune with pooling later.
    const client = postgres(env.DATABASE_URL, { max: 1, ssl: needsSsl ? "require" : undefined });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export type Db = ReturnType<typeof getDb>;
