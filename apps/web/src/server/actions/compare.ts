"use server";

/**
 * Compare action — returns side-by-side metrics for any security (live price/
 * change overlaid from the market-data provider; valuation/returns derived).
 * Powers the /compare page; works for tickers inside or outside the local universe.
 */
import { getMarketData } from "@/server/market";
import { getSecurity } from "@/data/markets-mock";
import { getSecurityDetail, type LiveOverride } from "@/data/security-detail-mock";

export interface CompareCard {
  symbol: string;
  name: string;
  sector: string;
  assetType: string;
  exchange: string;
  price: number;
  changePct: number;
  marketCapB: number;
  peRatio: number;
  dividendYieldPct: number;
  beta: number;
  volumeM: number;
  week52PosPct: number;
  perf1M: number;
  perfYTD: number;
  perf1Y: number;
}

export async function compareSecurityAction(symbol: string): Promise<CompareCard | null> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;

  const md = getMarketData();
  const known = Boolean(getSecurity(sym));
  const [quote, profile] = await Promise.all([
    md.getQuote(sym).catch(() => null),
    known ? Promise.resolve(null) : md.getProfile(sym).catch(() => null),
  ]);

  const live: LiveOverride | undefined = quote
    ? {
        price: quote.price,
        changePct: quote.changePct,
        ...(profile ? { name: profile.name, marketCapB: profile.marketCapB, exchange: profile.exchange } : {}),
      }
    : undefined;

  const d = getSecurityDetail(sym, live);
  if (!d) return null;

  const perf = (label: string) => d.returns.find((r) => r.label === label)?.pct ?? 0;
  const range = d.week52High - d.week52Low || 1;

  return {
    symbol: d.symbol,
    name: d.name,
    sector: d.assetType === "Stock" ? d.sector : (d.category ?? d.assetType),
    assetType: d.assetType,
    exchange: d.exchange,
    price: d.price,
    changePct: d.changePct,
    marketCapB: d.marketCapB,
    peRatio: d.peRatio,
    dividendYieldPct: d.dividendYieldPct,
    beta: d.beta,
    volumeM: d.volumeM,
    week52PosPct: ((d.price - d.week52Low) / range) * 100,
    perf1M: perf("1M"),
    perfYTD: perf("YTD"),
    perf1Y: perf("1Y"),
  };
}
