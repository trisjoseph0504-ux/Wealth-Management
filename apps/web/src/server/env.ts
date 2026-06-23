/**
 * Server environment validation (zod). Backend B0.
 *
 * DATABASE_URL is OPTIONAL so the app keeps running on mock data with no database
 * (the B0 exit criterion). It is only REQUIRED when DATA_SOURCE=db. This module
 * is server-only by convention — it must not be imported from a Client Component.
 */
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  /** Per-domain cutover flag: "mock" (default) or "db". See BACKEND_ARCHITECTURE §8. */
  DATA_SOURCE: z.enum(["mock", "db"]).default("mock"),
  /** Required only when DATA_SOURCE=db. A Postgres connection string. */
  DATABASE_URL: z.string().min(1).optional(),
  /** Market-data provider: "mock" (default, local universe) or "finnhub". */
  MARKET_DATA_PROVIDER: z.enum(["mock", "finnhub"]).default("mock"),
  /** Required only when MARKET_DATA_PROVIDER=finnhub. Server-only. */
  FINNHUB_API_KEY: z.string().min(1).optional(),
  /** Optional site password. When set, the whole app is gated behind it; when
   *  unset (e.g. local dev), the app is open. */
  SITE_PASSWORD: z.string().min(1).optional(),
  /** Optional Anthropic API key. When set, AI Market Commentary is generated live
   *  by Claude; when unset, it falls back to the rules-based generator. */
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  /** Optional model override for the commentary (defaults to claude-opus-4-8).
   *  Set to claude-sonnet-4-6 or claude-haiku-4-5 to cut per-use cost. */
  ANTHROPIC_MODEL: z.string().min(1).optional(),
});

const parsed = schema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATA_SOURCE: process.env.DATA_SOURCE,
  DATABASE_URL: process.env.DATABASE_URL,
  MARKET_DATA_PROVIDER: process.env.MARKET_DATA_PROVIDER,
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
  SITE_PASSWORD: process.env.SITE_PASSWORD,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
});

if (parsed.DATA_SOURCE === "db" && !parsed.DATABASE_URL) {
  throw new Error("DATABASE_URL is required when DATA_SOURCE=db");
}
if (parsed.MARKET_DATA_PROVIDER === "finnhub" && !parsed.FINNHUB_API_KEY) {
  throw new Error("FINNHUB_API_KEY is required when MARKET_DATA_PROVIDER=finnhub");
}

export const env = parsed;
export type Env = typeof env;
