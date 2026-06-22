/**
 * Auth.js instance (Backend B1) — the full NextAuth with the Drizzle adapter and
 * database sessions. This module is loaded ONLY via dynamic import when
 * AUTH_ENABLED=true, so its top-level `getDb()` never runs in demo mode (no DB
 * connection is forced). Tables map to our Auth.js-compatible schema.
 */
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/server/db/client";
import { users, accounts, sessions, verificationTokens } from "@/server/db/schema";
import { authConfig } from "@/server/auth/config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
});
