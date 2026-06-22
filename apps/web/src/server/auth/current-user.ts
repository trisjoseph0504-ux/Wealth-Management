/**
 * Current-user seam (Backend B1). One place feature code asks "who is this?".
 *
 * Demo mode (AUTH_ENABLED unset, default) returns a stable demo user, so the app
 * and data seam work without a login. When AUTH_ENABLED=true it resolves the
 * signed-in user from the Auth.js session. Feature code never changes either way.
 */
import { authEnabled, getSession } from "@/server/auth";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
}

export const DEMO_USER: CurrentUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "tristan@lewiswealth.example",
  name: "Tristan Lewis",
};

export async function getCurrentUser(): Promise<CurrentUser> {
  if (!authEnabled) return DEMO_USER;
  const session = await getSession();
  const u = session?.user as { id?: string; email?: string; name?: string | null } | undefined;
  if (!u?.id || !u.email) throw new Error("Unauthorized");
  return { id: u.id, email: u.email, name: u.name ?? null };
}
