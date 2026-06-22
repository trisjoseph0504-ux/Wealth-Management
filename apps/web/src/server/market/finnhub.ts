/**
 * Finnhub market-data provider (B6). Real symbol search + quotes + profiles.
 * Server-only: the API key never reaches the client. Responses are cached briefly
 * (Next fetch revalidate) to respect the free-tier rate limit.
 */
import { env } from "@/server/env";
import type { MarketDataProvider, SymbolHit, Quote, CompanyProfile, InstrumentType } from "@/server/market/types";

const BASE = "https://finnhub.io/api/v1";

interface FhSearchResult {
  symbol: string;
  displaySymbol?: string;
  description?: string;
  type?: string;
}
interface FhQuote {
  c: number; // current
  d: number | null; // change
  dp: number | null; // change %
  pc: number; // prev close
}
interface FhProfile {
  name?: string;
  exchange?: string;
  marketCapitalization?: number; // millions
  finnhubIndustry?: string;
}

function mapType(t: string): InstrumentType {
  const s = (t ?? "").toLowerCase();
  if (s.includes("etf")) return "ETF";
  if (s.includes("fund")) return "Fund";
  if (s.includes("stock") || s.includes("ads") || s.includes("reit") || s.includes("adr")) return "Stock";
  return "Other";
}

// US-listed: no exchange suffix, or a single-letter class share (e.g. BRK.B).
const isUsSymbol = (sym: string) => !sym.includes(".") || /^[A-Z]+\.[A-Z]$/.test(sym);

async function fh<T>(path: string, params: Record<string, string>, revalidate = 30): Promise<T> {
  const key = env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY not set");
  const qs = new URLSearchParams({ ...params, token: key }).toString();
  const res = await fetch(`${BASE}${path}?${qs}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  return (await res.json()) as T;
}

export const finnhubProvider: MarketDataProvider = {
  async searchSymbols(query) {
    const q = query.trim();
    if (!q) return [];
    const data = await fh<{ result?: FhSearchResult[] }>("/search", { q });
    return (data.result ?? [])
      .filter((r) => r.symbol && isUsSymbol(r.symbol))
      .slice(0, 10)
      .map((r) => ({ symbol: r.symbol, name: r.description ?? r.symbol, type: mapType(r.type ?? "") }));
  },

  async getQuote(symbol) {
    const d = await fh<FhQuote>("/quote", { symbol }, 15);
    if (typeof d.c !== "number" || d.c === 0) return null;
    return { symbol, price: d.c, change: d.d ?? 0, changePct: d.dp ?? 0, prevClose: d.pc || d.c };
  },

  async getProfile(symbol) {
    const d = await fh<FhProfile>("/stock/profile2", { symbol }, 3600);
    if (!d || !d.name) return null;
    const profile: CompanyProfile = { name: d.name };
    if (d.exchange) profile.exchange = d.exchange;
    if (typeof d.marketCapitalization === "number") profile.marketCapB = d.marketCapitalization / 1000;
    if (d.finnhubIndustry) profile.industry = d.finnhubIndustry;
    return profile;
  },
};
