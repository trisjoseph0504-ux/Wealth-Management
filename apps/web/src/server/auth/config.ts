/**
 * Auth.js base config (Backend B1) — edge-safe: providers, pages, callbacks; no
 * database adapter here (that lives in instance.ts for the Node runtime). Magic-
 * link (Resend) is the primary, passwordless method; Google is optional. Both
 * read their secrets from AUTH_* env at runtime and are only exercised when
 * AUTH_ENABLED=true.
 */
import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";

export const authConfig = {
  pages: { signIn: "/sign-in" },
  providers: [
    Resend({ from: process.env.AUTH_EMAIL_FROM ?? "login@lewiswealth.example" }),
    Google,
  ],
  callbacks: {
    // Database sessions expose `user`; surface its id on the session object.
    session({ session, user }) {
      if (session.user && user) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
