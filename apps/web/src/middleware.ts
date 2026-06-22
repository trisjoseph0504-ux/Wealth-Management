/**
 * Site password gate. When SITE_PASSWORD is set, every route (except the sign-in
 * screen and static assets) requires a valid gate cookie; otherwise the request
 * is redirected to /sign-in. When SITE_PASSWORD is unset (e.g. local dev), the
 * app is fully open. Edge-safe: reads process.env directly and verifies the
 * cookie via Web Crypto — no DB, no Node-only imports.
 */
import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

export async function middleware(req: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next(); // gate disabled when no password set

  const { pathname } = req.nextUrl;
  const isPublic = pathname.startsWith("/sign-in") || pathname.startsWith("/api/auth");

  const cookie = req.cookies.get(GATE_COOKIE)?.value;
  const valid = cookie ? cookie === (await gateToken(password)) : false;

  if (valid) {
    // Already in — bounce away from the sign-in screen.
    if (pathname.startsWith("/sign-in")) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isPublic) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/sign-in";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
