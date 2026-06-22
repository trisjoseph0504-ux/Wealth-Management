/**
 * Route protection (Backend B1). Gated by AUTH_ENABLED:
 *  - disabled (default): pass-through — the demo runs unauthenticated.
 *  - enabled: a lightweight gate that redirects to /sign-in when no Auth.js
 *    session cookie is present. Full session validation happens server-side in
 *    pages/actions via getCurrentUser() (Node runtime); the middleware stays
 *    edge-safe by not importing the DB-backed auth instance.
 */
import { NextResponse, type NextRequest } from "next/server";

const authEnabled = process.env.AUTH_ENABLED === "true";

export function middleware(req: NextRequest) {
  if (!authEnabled) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const isPublic =
    pathname.startsWith("/sign-in") || pathname.startsWith("/api/auth");
  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
