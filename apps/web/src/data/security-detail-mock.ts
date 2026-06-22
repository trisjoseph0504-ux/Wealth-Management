/**
 * Phase 4 — Security/Instrument detail mock. Enriches a base Security from the
 * shared universe (markets-mock) with stats, performance, qualitative content,
 * and any real portfolio exposure (portfolio-mock). Everything is DERIVED
 * deterministically (seeded by symbol — no Math.random) so SSR/CSR match and the
 * same symbol always renders identically.
 *
 * Qualitative content (thesis, bull/bear, risks, news) is templated, brand-
 * consistent mock — clearly placeholder, wired so a real engine drops in later.
 */
import { getSecurity, type Sector, type Security } from "@/data/markets-mock";
import { holdings } from "@/data/portfolio-mock";

/* ── deterministic seeded helpers ─────────────────────────────────────────── */
function seed(symbol: string, salt: number): number {
  let h = salt + 7;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) % 1000000;
  return h;
}
function unit(symbol: string, salt: number): number {
  return (Math.sin(seed(symbol, salt)) + 1) / 2; // 0..1, deterministic
}
function between(symbol: string, salt: number, min: number, max: number): number {
  return min + unit(symbol, salt) * (max - min);
}

const SECTOR_PE: Record<Sector, number> = {
  Technology: 31, Communication: 22, "Consumer Discretionary": 27, "Consumer Staples": 23,
  Financials: 13, "Health Care": 19, Energy: 12, Industrials: 21, Materials: 17,
  Utilities: 19, "Real Estate": 33,
};
const SECTOR_YIELD: Record<Sector, number> = {
  Technology: 0.6, Communication: 0.8, "Consumer Discretionary": 0.9, "Consumer Staples": 2.6,
  Financials: 2.2, "Health Care": 1.7, Energy: 3.6, Industrials: 1.6, Materials: 2.1,
  Utilities: 3.3, "Real Estate": 3.5,
};
const SECTOR_BETA: Record<Sector, number> = {
  Technology: 1.2, Communication: 1.1, "Consumer Discretionary": 1.25, "Consumer Staples": 0.55,
  Financials: 1.15, "Health Care": 0.8, Energy: 1.05, Industrials: 1.05, Materials: 1.1,
  Utilities: 0.5, "Real Estate": 0.95,
};
const SECTOR_THEME: Record<Sector, string> = {
  Technology: "AI infrastructure and software", Communication: "digital advertising and streaming",
  "Consumer Discretionary": "consumer demand and e-commerce", "Consumer Staples": "defensive staples demand",
  Financials: "rates and capital markets", "Health Care": "innovation and demographics",
  Energy: "global supply and pricing", Industrials: "reshoring and aerospace",
  Materials: "commodities and construction", Utilities: "the electrification buildout",
  "Real Estate": "rates and occupancy trends",
};

export interface SecurityStat {
  label: string;
  value: string;
  hint?: string;
}
export interface PerfPoint {
  label: string;
  pct: number;
}
export interface NewsItem {
  source: string;
  time: string;
  headline: string;
  tag: string;
}
export interface SecurityExposure {
  quantity: number;
  marketValue: number;
  weightPct: number;
  gainUsd: number;
  gainPct: number;
}
export interface ChartRange {
  key: string;
  label: string;
  returnPct: number;
  points: number;
}
export interface SecurityDetail {
  symbol: string;
  name: string;
  assetType: "Stock" | "ETF" | "Fund";
  sector: Sector;
  category?: string;
  exchange: string;
  currency: string;
  price: number;
  changePct: number;
  changeUsd: number;
  marketCapB: number;
  peRatio: number;
  forwardPe: number;
  eps: number;
  dividendYieldPct: number;
  beta: number;
  volumeM: number;
  avgVolumeM: number;
  week52Low: number;
  week52High: number;
  returns: PerfPoint[];
  description: string;
  thesis: string;
  bull: string[];
  bear: string[];
  risks: string[];
  news: NewsItem[];
  chartRanges: ChartRange[];
  exposure: SecurityExposure | null;
}

/** Build a deterministic price series ending at `price` with the given return. */
export function buildSeries(symbol: string, endPrice: number, returnPct: number, points: number): number[] {
  const start = endPrice / (1 + returnPct / 100);
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1 || 1);
    const drift = start + (endPrice - start) * t;
    const wiggle = Math.sin((seed(symbol, i + 1) % 628) / 100) * endPrice * 0.012 * (1 - Math.abs(0.5 - t));
    out.push(Number((drift + wiggle).toFixed(2)));
  }
  out[points - 1] = endPrice;
  return out;
}

/** Real, live values from the market-data provider, overlaid on the derived
 *  detail. For a symbol outside the local universe, this is the only real data
 *  we have — the rest is synthesized illustratively from it. */
export interface LiveOverride {
  price?: number;
  changePct?: number;
  name?: string;
  marketCapB?: number;
  exchange?: string;
}

export function getSecurityDetail(
  symbol: string,
  live?: LiveOverride,
  liveExposure?: SecurityExposure | null,
): SecurityDetail | null {
  const found = getSecurity(symbol);
  if (!found && !live) return null;

  // Base carries the real price/change/cap so every derived stat below reflects
  // live data. Known symbols keep their universe metadata; unknown symbols get a
  // neutral synthetic base built around the live quote.
  const s: Security = found
    ? {
        ...found,
        price: live?.price ?? found.price,
        changePct: live?.changePct ?? found.changePct,
        marketCapB: live?.marketCapB ?? found.marketCapB,
        name: live?.name ?? found.name,
      }
    : {
        symbol,
        name: live?.name ?? symbol,
        assetType: "Stock",
        sector: "Financials",
        price: live?.price ?? 0,
        changePct: live?.changePct ?? 0,
        marketCapB: live?.marketCapB ?? 0,
        volumeM: 0,
        trend: [],
      };

  const pe = Number((SECTOR_PE[s.sector] + between(symbol, 1, -4, 9)).toFixed(1));
  const forwardPe = Number((pe * between(symbol, 2, 0.82, 0.96)).toFixed(1));
  const eps = Number((s.price / pe).toFixed(2));
  const dividendYieldPct = Number(Math.max(0, SECTOR_YIELD[s.sector] + between(symbol, 3, -0.6, 0.8)).toFixed(2));
  const beta = Number((SECTOR_BETA[s.sector] + between(symbol, 4, -0.2, 0.3)).toFixed(2));
  const avgVolumeM = Number((s.volumeM * between(symbol, 5, 0.75, 1.25)).toFixed(0));
  const week52Low = Number((s.price * (1 - between(symbol, 6, 0.16, 0.34))).toFixed(2));
  const week52High = Number((s.price * (1 + between(symbol, 7, 0.05, 0.24))).toFixed(2));
  const changeUsd = Number((s.price - s.price / (1 + s.changePct / 100)).toFixed(2));

  const r1w = Number((s.changePct * 1.4 + between(symbol, 11, -2.5, 3)).toFixed(2));
  const r1m = Number(between(symbol, 12, -7, 10).toFixed(2));
  const r3m = Number(between(symbol, 13, -11, 17).toFixed(2));
  const rytd = Number(between(symbol, 14, -12, 29).toFixed(2));
  const r1y = Number(between(symbol, 15, -18, 46).toFixed(2));
  const r5y = Number(between(symbol, 16, -10, 180).toFixed(2));

  const returns: PerfPoint[] = [
    { label: "1D", pct: s.changePct },
    { label: "1W", pct: r1w },
    { label: "1M", pct: r1m },
    { label: "3M", pct: r3m },
    { label: "YTD", pct: rytd },
    { label: "1Y", pct: r1y },
  ];

  const chartRanges: ChartRange[] = [
    { key: "1D", label: "1D", returnPct: s.changePct, points: 24 },
    { key: "1W", label: "1W", returnPct: r1w, points: 28 },
    { key: "1M", label: "1M", returnPct: r1m, points: 30 },
    { key: "3M", label: "3M", returnPct: r3m, points: 36 },
    { key: "1Y", label: "1Y", returnPct: r1y, points: 52 },
    { key: "5Y", label: "5Y", returnPct: r5y, points: 60 },
  ];

  const theme = SECTOR_THEME[s.sector];
  const sectorLc = s.sector.toLowerCase();

  // Exposure reflects the user's REAL holdings when the caller supplies it
  // (passing `null` = confirmed not held). Falls back to the static demo book
  // only when nothing is provided.
  let exposure: SecurityExposure | null = liveExposure ?? null;
  if (liveExposure === undefined) {
    const held = holdings.find((h) => h.symbol === symbol);
    exposure = held
      ? {
          quantity: held.quantity,
          marketValue: held.marketValue,
          weightPct: held.weightPct,
          gainUsd: held.gainUsd,
          gainPct: held.gainPct,
        }
      : null;
  }

  return {
    symbol: s.symbol,
    name: s.name,
    assetType: s.assetType,
    sector: s.sector,
    category: s.category,
    exchange: live?.exchange ?? (s.symbol.includes(".") || ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "AVGO", "COST", "NFLX", "AMD", "ADBE", "PFE"].includes(s.symbol) ? "NASDAQ" : "NYSE"),
    currency: "USD",
    price: s.price,
    changePct: s.changePct,
    changeUsd,
    marketCapB: s.marketCapB,
    peRatio: pe,
    forwardPe,
    eps,
    dividendYieldPct,
    beta,
    volumeM: s.volumeM,
    avgVolumeM,
    week52Low,
    week52High,
    returns,
    description: `${s.name} is a ${sectorLc} company tracked by Lewis Wealth Intelligence. The figures shown here are illustrative mock data for platform development — not a real quote or research.`,
    thesis: `${s.name} screens as a core ${sectorLc} holding for the Lewis Family Office. Positioning is supported by exposure to ${theme}, a ${pe.toFixed(1)}× earnings multiple, and a beta of ${beta.toFixed(2)}. Lewis Intelligence would weigh this against valuation and concentration before sizing a position.`,
    bull: [
      `${s.name} holds a durable position in ${sectorLc}, with demand tied to ${theme}.`,
      `Cash generation and margins support continued capital return and reinvestment.`,
      `Secular tailwinds expand the addressable market over a multi-year horizon.`,
    ],
    bear: [
      `At ${pe.toFixed(1)}× earnings, the valuation leaves limited room for execution missteps.`,
      `Competitive intensity in ${sectorLc} could pressure share and margins.`,
      `A beta of ${beta.toFixed(2)} means macro and rate moves swing the multiple.`,
    ],
    risks: [
      `Regulatory, policy, or tax shifts affecting the ${sectorLc} sector.`,
      `Single-name concentration and drawdown risk in stressed markets.`,
      `Earnings or guidance disappointment relative to consensus expectations.`,
    ],
    news: [
      { source: "Lewis Intelligence", time: "2h ago", headline: `${s.symbol} ${s.changePct >= 0 ? "extends gains" : "slips"} as ${sectorLc} leads the session`, tag: "Markets" },
      { source: "Newswire (mock)", time: "6h ago", headline: `${s.name} reaffirms outlook at industry conference`, tag: "Company" },
      { source: "Research (mock)", time: "1d ago", headline: `Analysts revisit ${s.symbol} estimates ahead of next print`, tag: "Estimates" },
    ],
    chartRanges,
    exposure,
  };
}

/** All detail symbols — used for static pre-rendering. */
export { securities as detailUniverse } from "@/data/markets-mock";
