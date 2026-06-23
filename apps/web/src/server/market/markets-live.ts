/**
 * Live Markets data. Overlays real Finnhub quotes onto the major names (top by
 * market cap, which covers every recognizable ticker and everything the user is
 * likely to hold), then recomputes sector performance, movers, and the heatmap
 * from those real numbers. Index levels (S&P/VIX/etc.) stay mock — index data
 * isn't on the free Finnhub tier — and are clearly labeled in the UI.
 */
import {
  stocks,
  indices,
  SECTOR_ORDER,
  type Security,
  type SectorPerf,
  type Sector,
  type MarketIndex,
} from "@/data/markets-mock";
import { fetchMarketQuotes } from "@/server/market/market-quotes";

/** How many of the largest stocks to pull live (stays within the free limit). */
const LIVE_CAP = 50;

/** Deterministic 7-point trend ending at `price` (mirrors markets-mock.mkTrend). */
function mkTrend(price: number, changePct: number, seed: number): number[] {
  const start = price / (1 + changePct / 100);
  const pts: number[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const drift = start + (price - start) * t;
    const wiggle = Math.sin((i + seed) * 1.3) * price * 0.0035;
    pts.push(Number((drift + wiggle).toFixed(2)));
  }
  pts[6] = price;
  return pts;
}

export interface HeatmapGroup {
  sector: Sector;
  marketCapB: number;
  items: Security[];
}

export interface LiveMarkets {
  indices: MarketIndex[]; // mock — index data is not on the free tier
  sectorPerformance: SectorPerf[];
  movers: { gainers: Security[]; losers: Security[]; mostActive: Security[] };
  heatmap: HeatmapGroup[];
  liveCount: number; // how many names resolved to a live quote
  totalCount: number;
}

export async function getLiveMarkets(): Promise<LiveMarkets> {
  const top = [...stocks].sort((a, b) => b.marketCapB - a.marketCapB).slice(0, LIVE_CAP);
  const quotes = await fetchMarketQuotes(
    top.map((s) => s.symbol),
    LIVE_CAP,
  );

  const live: Security[] = top.map((s, i) => {
    const q = quotes[s.symbol];
    if (!q) return s; // keep mock for any that failed
    return { ...s, price: q.price, changePct: q.changePct, trend: mkTrend(q.price, q.changePct, i) };
  });
  const liveCount = top.filter((s) => quotes[s.symbol]).length;

  const sectorPerformance: SectorPerf[] = SECTOR_ORDER.map((sector) => {
    const items = live.filter((s) => s.sector === sector);
    const mcap = items.reduce((sum, s) => sum + s.marketCapB, 0);
    const weighted = items.reduce((sum, s) => sum + s.changePct * s.marketCapB, 0) / (mcap || 1);
    return { sector, changePct: weighted, marketCapB: mcap, count: items.length };
  })
    .filter((s) => s.count > 0)
    .sort((a, b) => b.changePct - a.changePct);

  const movers = {
    gainers: [...live].sort((a, b) => b.changePct - a.changePct).slice(0, 6),
    losers: [...live].sort((a, b) => a.changePct - b.changePct).slice(0, 6),
    mostActive: [...live].sort((a, b) => b.volumeM - a.volumeM).slice(0, 6),
  };

  const heatmap: HeatmapGroup[] = SECTOR_ORDER.map((sector) => {
    const items = live.filter((s) => s.sector === sector).sort((a, b) => b.marketCapB - a.marketCapB);
    const marketCapB = items.reduce((sum, s) => sum + s.marketCapB, 0);
    return { sector, marketCapB, items };
  })
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.marketCapB - a.marketCapB);

  return { indices, sectorPerformance, movers, heatmap, liveCount, totalCount: top.length };
}
