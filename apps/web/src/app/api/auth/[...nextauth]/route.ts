/**
 * Auth.js route handler (Backend B1). Gated: returns 404 in demo mode so the
 * DB-backed instance is never loaded. When AUTH_ENABLED=true it delegates to
 * the NextAuth handlers (dynamic import keeps the DB path out of demo mode).
 */
import type { NextRequest } from "next/server";
import { authEnabled } from "@/server/auth";

const disabled = () => new Response("Authentication is disabled", { status: 404 });

export async function GET(req: NextRequest): Promise<Response> {
  if (!authEnabled) return disabled();
  const { handlers } = await import("@/server/auth/instance");
  return handlers.GET(req);
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!authEnabled) return disabled();
  const { handlers } = await import("@/server/auth/instance");
  return handlers.POST(req);
}
