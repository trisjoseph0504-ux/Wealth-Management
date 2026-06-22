/**
 * Simple site-password gate token. The auth cookie stores a SHA-256 of the
 * password (not the raw value); both the middleware (edge) and the login action
 * (node) derive the same token to verify. Uses Web Crypto, available in both
 * runtimes — keep this dependency-free so it stays edge-safe.
 */
export const GATE_COOKIE = "lwi-gate";

export async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`lwi-gate:v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
