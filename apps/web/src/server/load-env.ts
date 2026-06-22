/**
 * Loads environment variables from .env.local (then .env) for STANDALONE scripts
 * (drizzle-kit migrate, tsx seed). The Next.js app loads .env.local itself; these
 * Node scripts don't, so we load it explicitly. Import this FIRST in any script
 * that reads env (before modules that parse process.env).
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config(); // fall back to .env
