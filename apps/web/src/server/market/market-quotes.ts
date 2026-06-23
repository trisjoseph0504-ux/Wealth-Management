/**
 * Live quotes for the Markets page. Reuses the same free Finnhub quote endpoint
 * the portfolio uses, but capped + throttled + cached so it never trips the free
 * 60-calls/minute rate limit. Failed/unknown symbols are simply omitted (the
 * caller keeps the mock value for those). Server-only.
 */
import { getMarketData } from "@/server/market";

export interface MarketQuote {
  price: number;
  changePct: number;
}

const TTL_MS = 180_000; // 3 minutes — one refresh window shared across requests
const BATCH = 6; // small bursts keep us under the per-second cap
const GAP_MS = 260;

const cache = new Map<string, { q: MarketQuote; at: number }>();
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Fetch live quotes for up to `cap` symbols. Cached ~3 min; throttled in small
 * batches. Returns only the symbols that resolved to a real, positive price.
 */
export async function fetchMarketQuotes(symbols: string[], cap = 50): Promise<Record<string, MarketQuote>> {
  const md = getMarketData();
  const now = Date.now();
  const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()))]
    .filter((s) => s && s !== "USD")
    .slice(0, cap);

  const out: Record<string, MarketQuote> = {};
  const toFetch: string[] = [];
  for (const sym of unique) {
    const c = cache.get(sym);
    if (c && now - c.at < TTL_MS) out[sym] = c.q;
    else toFetch.push(sym);
  }

  for (let i = 0; i < toFetch.length; i += BATCH) {
    const batch = toFetch.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (sym) => {
        const q = await md.getQuote(sym).catch(() => null);
        return q && q.price > 0 ? ([sym, { price: q.price, changePct: q.changePct }] as const) : null;
      }),
    );
    for (const r of results) {
      if (r) {
        out[r[0]] = r[1];
        cache.set(r[0], { q: r[1], at: Date.now() });
      }
    }
    if (i + BATCH < toFetch.length) await sleep(GAP_MS);
  }

  return out;
}
