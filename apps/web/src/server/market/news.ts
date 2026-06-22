/**
 * Market news (B6) — real US market + company news from Finnhub. Server-only
 * (the API key never reaches the client). Cached via Next fetch revalidate to
 * respect the free-tier rate limit. Returns [] for the mock provider / on error
 * so the Intelligence page degrades gracefully.
 */
import { env } from "@/server/env";

const BASE = "https://finnhub.io/api/v1";

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number; // unix seconds
  related: string; // comma-separated tickers
  category: string;
}

interface FhNews {
  category?: string;
  datetime?: number;
  headline?: string;
  id?: number;
  related?: string;
  source?: string;
  summary?: string;
  url?: string;
}

async function fetchNews(path: string, params: Record<string, string>, revalidate: number): Promise<FhNews[]> {
  const key = env.FINNHUB_API_KEY;
  if (!key) return [];
  try {
    const qs = new URLSearchParams({ ...params, token: key }).toString();
    const res = await fetch(`${BASE}${path}?${qs}`, { next: { revalidate } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as FhNews[]) : [];
  } catch {
    return [];
  }
}

function map(items: FhNews[]): NewsItem[] {
  return items
    .filter((n) => n.headline && n.url)
    .map((n) => ({
      id: String(n.id ?? n.url),
      headline: n.headline!,
      summary: n.summary ?? "",
      source: n.source ?? "",
      url: n.url!,
      datetime: n.datetime ?? 0,
      related: n.related ?? "",
      category: n.category ?? "general",
    }));
}

/** General US market / business news. */
export async function getMarketNews(): Promise<NewsItem[]> {
  if (env.MARKET_DATA_PROVIDER !== "finnhub") return [];
  return map(await fetchNews("/news", { category: "general" }, 600)).slice(0, 40);
}

/** Recent company-specific news for a single symbol (last ~7 days). */
export async function getCompanyNews(symbol: string): Promise<NewsItem[]> {
  if (env.MARKET_DATA_PROVIDER !== "finnhub") return [];
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 86_400_000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const items = await fetchNews("/company-news", { symbol, from: fmt(from), to: fmt(to) }, 1800);
  // Finnhub doesn't always set `related`; stamp the requested symbol so we can tag it.
  return map(items)
    .map((n) => ({ ...n, related: n.related || symbol }))
    .slice(0, 6);
}
