/**
 * Fetch live quotes for a set of holding symbols (server-only). Returns a
 * symbol → {price, changePct} map used to overlay real prices onto the derived
 * portfolio. Cached per-symbol via the provider's getQuote revalidate; failures
 * and cash (USD) are skipped so the portfolio still renders.
 */
import { getMarketData } from "@/server/market";

export interface LiveQuote {
  price: number;
  changePct: number;
}

export async function fetchHoldingQuotes(symbols: string[]): Promise<Record<string, LiveQuote>> {
  const md = getMarketData();
  const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()))].filter((s) => s && s !== "USD");

  const entries = await Promise.all(
    unique.map(async (sym) => {
      const q = await md.getQuote(sym).catch(() => null);
      return q && q.price > 0 ? ([sym, { price: q.price, changePct: q.changePct }] as const) : null;
    }),
  );

  return Object.fromEntries(entries.filter(Boolean) as (readonly [string, LiveQuote])[]);
}
