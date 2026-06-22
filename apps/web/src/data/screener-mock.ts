/**
 * Phase 5 — Screener dataset + filter/sort/summary engine. Rows are built from
 * the shared securities universe enriched with the SAME deterministic stats the
 * detail page uses (getSecurityDetail), so a row in the screener and its profile
 * page always agree. Filtering/summary are pure functions (easy to test, and a
 * 1:1 map to a future server-side query). No network, no Math.random.
 */
import { stocks, SECTOR_ORDER, type Sector } from "@/data/markets-mock";
import { getSecurityDetail } from "@/data/security-detail-mock";

const INDUSTRY: Record<string, string> = {
  AAPL: "Consumer Electronics", MSFT: "Software — Infrastructure", NVDA: "Semiconductors",
  AVGO: "Semiconductors", ORCL: "Software — Infrastructure", CRM: "Software — Application",
  AMD: "Semiconductors", ADBE: "Software — Application", GOOGL: "Internet Content",
  META: "Internet Content", NFLX: "Entertainment", DIS: "Entertainment",
  AMZN: "Internet Retail", TSLA: "Auto Manufacturers", HD: "Home Improvement Retail",
  MCD: "Restaurants", NKE: "Footwear & Apparel", WMT: "Discount Stores",
  PG: "Household Products", KO: "Beverages", COST: "Discount Stores",
  JPM: "Banks — Diversified", "BRK.B": "Insurance — Diversified", V: "Credit Services",
  MA: "Credit Services", BAC: "Banks — Diversified", GS: "Capital Markets",
  UNH: "Healthcare Plans", LLY: "Drug Manufacturers", JNJ: "Drug Manufacturers",
  PFE: "Drug Manufacturers", ABBV: "Drug Manufacturers", XOM: "Oil & Gas — Integrated",
  CVX: "Oil & Gas — Integrated", COP: "Oil & Gas — E&P", CAT: "Heavy Machinery",
  BA: "Aerospace & Defense", GE: "Aerospace & Defense", LIN: "Specialty Chemicals",
  FCX: "Copper & Mining", NEE: "Utilities — Electric", DUK: "Utilities — Electric",
  AMT: "REIT — Specialty", PLD: "REIT — Industrial",
};

export interface ScreenerRow {
  symbol: string;
  name: string;
  sector: Sector;
  industry: string;
  price: number;
  changePct: number;
  marketCapB: number;
  peRatio: number;
  dividendYieldPct: number;
  beta: number;
  volumeM: number;
  week52Low: number;
  week52High: number;
  week52PosPct: number; // 0 = at low, 100 = at high
  perf1M: number;
  perfYTD: number;
  perf1Y: number;
}

export const screenerRows: ScreenerRow[] = stocks.map((s) => {
  const d = getSecurityDetail(s.symbol)!;
  const ret = (label: string) => d.returns.find((r) => r.label === label)?.pct ?? 0;
  const span = d.week52High - d.week52Low || 1;
  return {
    symbol: s.symbol,
    name: s.name,
    sector: s.sector,
    industry: INDUSTRY[s.symbol] ?? "Diversified",
    price: s.price,
    changePct: s.changePct,
    marketCapB: s.marketCapB,
    peRatio: d.peRatio,
    dividendYieldPct: d.dividendYieldPct,
    beta: d.beta,
    volumeM: s.volumeM,
    week52Low: d.week52Low,
    week52High: d.week52High,
    week52PosPct: ((s.price - d.week52Low) / span) * 100,
    perf1M: ret("1M"),
    perfYTD: ret("YTD"),
    perf1Y: ret("1Y"),
  };
});

export const SECTORS: Sector[] = [...SECTOR_ORDER];
export const INDUSTRIES: string[] = Array.from(new Set(screenerRows.map((r) => r.industry))).sort();

export type Range52 = "any" | "nearHigh" | "nearLow";

export interface ScreenFilters {
  query: string;
  sectors: Sector[]; // empty = all
  industry: string; // "All" or specific
  mcapMin: number | null;
  mcapMax: number | null;
  peMin: number | null;
  peMax: number | null;
  divMin: number | null;
  betaMin: number | null;
  betaMax: number | null;
  volMin: number | null;
  range52: Range52;
  perfMin: number | null; // 1Y %
  perfMax: number | null;
}

export const defaultFilters: ScreenFilters = {
  query: "",
  sectors: [],
  industry: "All",
  mcapMin: null,
  mcapMax: null,
  peMin: null,
  peMax: null,
  divMin: null,
  betaMin: null,
  betaMax: null,
  volMin: null,
  range52: "any",
  perfMin: null,
  perfMax: null,
};

const inRange = (v: number, min: number | null, max: number | null) =>
  (min === null || v >= min) && (max === null || v <= max);

export function applyFilters(rows: ScreenerRow[], f: ScreenFilters): ScreenerRow[] {
  const q = f.query.trim().toLowerCase();
  return rows.filter((r) => {
    if (q && !r.symbol.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
    if (f.sectors.length > 0 && !f.sectors.includes(r.sector)) return false;
    if (f.industry !== "All" && r.industry !== f.industry) return false;
    if (!inRange(r.marketCapB, f.mcapMin, f.mcapMax)) return false;
    if (!inRange(r.peRatio, f.peMin, f.peMax)) return false;
    if (f.divMin !== null && r.dividendYieldPct < f.divMin) return false;
    if (!inRange(r.beta, f.betaMin, f.betaMax)) return false;
    if (f.volMin !== null && r.volumeM < f.volMin) return false;
    if (f.range52 === "nearHigh" && r.week52PosPct < 80) return false;
    if (f.range52 === "nearLow" && r.week52PosPct > 20) return false;
    if (!inRange(r.perf1Y, f.perfMin, f.perfMax)) return false;
    return true;
  });
}

/** Count of non-default filter facets (for the "N active" badge). */
export function activeFilterCount(f: ScreenFilters): number {
  let n = 0;
  if (f.query.trim()) n++;
  if (f.sectors.length) n++;
  if (f.industry !== "All") n++;
  if (f.mcapMin !== null || f.mcapMax !== null) n++;
  if (f.peMin !== null || f.peMax !== null) n++;
  if (f.divMin !== null) n++;
  if (f.betaMin !== null || f.betaMax !== null) n++;
  if (f.volMin !== null) n++;
  if (f.range52 !== "any") n++;
  if (f.perfMin !== null || f.perfMax !== null) n++;
  return n;
}

export interface ScreenSummary {
  count: number;
  avgPe: number;
  avgDiv: number;
  medianMcapB: number;
  avgPerf1Y: number;
  advancingPct: number;
}

export function summarize(rows: ScreenerRow[]): ScreenSummary {
  if (rows.length === 0) {
    return { count: 0, avgPe: 0, avgDiv: 0, medianMcapB: 0, avgPerf1Y: 0, advancingPct: 0 };
  }
  const n = rows.length;
  const avg = (sel: (r: ScreenerRow) => number) => rows.reduce((s, r) => s + sel(r), 0) / n;
  const mcaps = rows.map((r) => r.marketCapB).sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const medianMcapB = n % 2 ? mcaps[mid]! : (mcaps[mid - 1]! + mcaps[mid]!) / 2;
  return {
    count: n,
    avgPe: avg((r) => r.peRatio),
    avgDiv: avg((r) => r.dividendYieldPct),
    medianMcapB,
    avgPerf1Y: avg((r) => r.perf1Y),
    advancingPct: (rows.filter((r) => r.changePct >= 0).length / n) * 100,
  };
}

export interface ScreenPreset {
  id: string;
  name: string;
  description: string;
  filters: ScreenFilters;
}

const preset = (over: Partial<ScreenFilters>): ScreenFilters => ({ ...defaultFilters, ...over });

export const builtInPresets: ScreenPreset[] = [
  { id: "all", name: "All Securities", description: "Full tracked universe", filters: preset({}) },
  { id: "largeval", name: "Large-Cap Value", description: "Big, cheap, dividend-paying", filters: preset({ mcapMin: 100, peMax: 20, divMin: 1.5 }) },
  { id: "growth", name: "High Growth", description: "Strong 1Y momentum, higher beta", filters: preset({ perfMin: 15, betaMin: 1 }) },
  { id: "income", name: "Dividend Income", description: "Yield ≥ 2.5%, lower beta", filters: preset({ divMin: 2.5, betaMax: 1 }) },
  { id: "nearlow", name: "Near 52-Week Low", description: "Potential value / oversold", filters: preset({ range52: "nearLow" }) },
  { id: "megatech", name: "Mega-Cap Tech", description: "Tech & comms over $500B", filters: preset({ sectors: ["Technology", "Communication"], mcapMin: 500 }) },
];
