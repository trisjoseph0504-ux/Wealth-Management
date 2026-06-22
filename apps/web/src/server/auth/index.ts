/**
 * Auth entry seam (Backend B1). Exposes the AUTH_ENABLED flag and a `getSession`
 * that dynamically loads the DB-backed instance ONLY when enabled — so demo mode
 * never imports next-auth's database path. Feature code uses getCurrentUser()
 * (current-user.ts), which builds on these.
 */
export const authEnabled = process.env.AUTH_ENABLED === "true";

/** Current Auth.js session, or null when auth is disabled / signed out. */
export async function getSession() {
  if (!authEnabled) return null;
  const { auth } = await import("@/server/auth/instance");
  return auth();
}
