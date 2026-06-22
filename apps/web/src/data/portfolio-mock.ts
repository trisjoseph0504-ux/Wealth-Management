/**
 * Phase 2 mock data for the Portfolio page. Presentation-only, deterministic,
 * no network. Mirrors the eventual domain shapes (docs/DATA_MODEL.md) so the
 * swap to a real API is a fetch change, not a UI rewrite.
 *
 * Derived figures (market value, cost, gain) are COMPUTED from quantity/price/
 * cost so every displayed column is internally consistent — never hand-typed
 * totals that can drift. NOTE: plain `number` is for mock display only; real
 * money math moves to `@lwi/utils/money` (decimal) per CLAUDE.md §5.
 */

export type AssetClass =
  | "Equities"
  | "Fixed Income"
  | "Alternatives"
  | "Real Assets"
  | "Cash"
  | "Digital Assets";

export interface HoldingRaw {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  accountId: string;
  quantity: number;
  avgCost: number;
  price: number;
  dayChangePct: number;
  trend: number[];
}

export interface Holding extends HoldingRaw {
  id: string;
  marketValue: number;
  costValue: number;
  gainUsd: number;
  gainPct: number;
  weightPct: number;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  custodian: string;
  value: number;
  dayChangePct: number;
  weightPct: number;
}

const RAW: HoldingRaw[] = [
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "Equities", sector: "Technology", accountId: "joint", quantity: 6200, avgCost: 120, price: 241.18, dayChangePct: 1.12, trend: [3.0, 3.1, 3.05, 3.2, 3.18, 3.3, 3.42] },
  { symbol: "MSFT", name: "Microsoft Corp.", assetClass: "Equities", sector: "Technology", accountId: "joint", quantity: 2400, avgCost: 210, price: 502.74, dayChangePct: 0.46, trend: [6.6, 6.55, 6.7, 6.62, 6.8, 6.75, 6.9] },
  { symbol: "NVDA", name: "NVIDIA Corp.", assetClass: "Equities", sector: "Technology", accountId: "trust", quantity: 1800, avgCost: 320, price: 1184.5, dayChangePct: -0.82, trend: [12.6, 12.4, 12.5, 12.2, 12.3, 12.0, 11.84] },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", assetClass: "Equities", sector: "Financials", accountId: "joint", quantity: 3500, avgCost: 150, price: 276.33, dayChangePct: -0.34, trend: [2.8, 2.82, 2.79, 2.78, 2.77, 2.76, 2.76] },
  { symbol: "BRK.B", name: "Berkshire Hathaway", assetClass: "Equities", sector: "Financials", accountId: "trust", quantity: 2000, avgCost: 300, price: 478.9, dayChangePct: 0.21, trend: [4.6, 4.62, 4.61, 4.7, 4.68, 4.75, 4.79] },
  { symbol: "UNH", name: "UnitedHealth Group", assetClass: "Equities", sector: "Healthcare", accountId: "roth", quantity: 900, avgCost: 480, price: 612.4, dayChangePct: 0.65, trend: [5.9, 5.95, 6.0, 6.05, 6.08, 6.1, 6.12] },
  { symbol: "XOM", name: "Exxon Mobil Corp.", assetClass: "Equities", sector: "Energy", accountId: "joint", quantity: 4200, avgCost: 95, price: 118.07, dayChangePct: 0.94, trend: [1.12, 1.1, 1.14, 1.13, 1.16, 1.17, 1.18] },
  { symbol: "HD", name: "Home Depot Inc.", assetClass: "Equities", sector: "Consumer", accountId: "trust", quantity: 1100, avgCost: 300, price: 405.66, dayChangePct: -0.21, trend: [4.1, 4.09, 4.08, 4.07, 4.06, 4.06, 4.05] },
  { symbol: "GOOGL", name: "Alphabet Inc.", assetClass: "Equities", sector: "Communication", accountId: "joint", quantity: 2600, avgCost: 120, price: 198.22, dayChangePct: 0.78, trend: [1.9, 1.92, 1.93, 1.95, 1.96, 1.97, 1.98] },
  { symbol: "AGG", name: "iShares Core U.S. Aggregate Bond", assetClass: "Fixed Income", sector: "Aggregate", accountId: "trad", quantity: 18000, avgCost: 104, price: 99.85, dayChangePct: 0.12, trend: [99.4, 99.5, 99.6, 99.7, 99.75, 99.8, 99.85] },
  { symbol: "TLT", name: "iShares 20+ Year Treasury", assetClass: "Fixed Income", sector: "Government", accountId: "trad", quantity: 6500, avgCost: 110, price: 92.4, dayChangePct: 0.3, trend: [91.8, 91.9, 92.0, 92.1, 92.2, 92.3, 92.4] },
  { symbol: "GLD", name: "SPDR Gold Shares", assetClass: "Real Assets", sector: "Commodities", accountId: "trust", quantity: 3000, avgCost: 170, price: 214.55, dayChangePct: 0.4, trend: [212, 212.8, 213.2, 213.6, 214.0, 214.3, 214.55] },
  { symbol: "VNQ", name: "Vanguard Real Estate ETF", assetClass: "Real Assets", sector: "Real Estate", accountId: "roth", quantity: 5000, avgCost: 80, price: 92.1, dayChangePct: -0.55, trend: [93.0, 92.8, 92.6, 92.5, 92.3, 92.2, 92.1] },
  { symbol: "IBIT", name: "iShares Bitcoin Trust", assetClass: "Digital Assets", sector: "Digital Assets", accountId: "joint", quantity: 2500, avgCost: 40, price: 58.2, dayChangePct: 2.1, trend: [55.0, 55.8, 56.5, 57.0, 57.4, 57.9, 58.2] },
  { symbol: "USD", name: "Cash & Money Market", assetClass: "Cash", sector: "Cash", accountId: "cash", quantity: 642118, avgCost: 1, price: 1, dayChangePct: 0.0, trend: [1, 1, 1, 1, 1, 1, 1] },
];

function buildHoldings(raw: HoldingRaw[]): Holding[] {
  const enriched = raw.map((r) => {
    const marketValue = r.quantity * r.price;
    const costValue = r.quantity * r.avgCost;
    const gainUsd = marketValue - costValue;
    const gainPct = costValue > 0 ? (gainUsd / costValue) * 100 : 0;
    return { ...r, id: r.symbol, marketValue, costValue, gainUsd, gainPct, weightPct: 0 };
  });
  const total = enriched.reduce((s, h) => s + h.marketValue, 0);
  return enriched.map((h) => ({ ...h, weightPct: (h.marketValue / total) * 100 }));
}

export const holdings: Holding[] = buildHoldings(RAW);

export const ASSET_CLASSES: AssetClass[] = [
  "Equities",
  "Fixed Income",
  "Alternatives",
  "Real Assets",
  "Cash",
  "Digital Assets",
];

/** Aggregate holdings into a keyed breakdown (asset class or sector). */
export function aggregateBy(key: "assetClass" | "sector") {
  const total = holdings.reduce((s, h) => s + h.marketValue, 0);
  const map = new Map<string, number>();
  for (const h of holdings) {
    map.set(h[key], (map.get(h[key]) ?? 0) + h.marketValue);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value, weightPct: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export const assetAllocation = aggregateBy("assetClass");
export const sectorAllocation = aggregateBy("sector");

export const movers = {
  winners: [...holdings].filter((h) => h.assetClass !== "Cash").sort((a, b) => b.dayChangePct - a.dayChangePct).slice(0, 4),
  losers: [...holdings].filter((h) => h.assetClass !== "Cash").sort((a, b) => a.dayChangePct - b.dayChangePct).slice(0, 4),
};

export const accountsRaw: Omit<Account, "weightPct">[] = [
  { id: "joint", name: "Joint Brokerage", type: "Taxable", custodian: "Schwab", value: 0, dayChangePct: 0.72 },
  { id: "trust", name: "Lewis Family Trust", type: "Trust", custodian: "Fidelity", value: 0, dayChangePct: 0.54 },
  { id: "roth", name: "Roth IRA", type: "Retirement", custodian: "Vanguard", value: 0, dayChangePct: 0.61 },
  { id: "trad", name: "Traditional IRA", type: "Retirement", custodian: "Fidelity", value: 0, dayChangePct: 0.18 },
  { id: "cash", name: "Cash Management", type: "Cash", custodian: "Schwab", value: 0, dayChangePct: 0.0 },
];

export const accounts: Account[] = (() => {
  const byAccount = new Map<string, number>();
  for (const h of holdings) byAccount.set(h.accountId, (byAccount.get(h.accountId) ?? 0) + h.marketValue);
  const total = holdings.reduce((s, h) => s + h.marketValue, 0);
  return accountsRaw.map((a) => {
    const value = byAccount.get(a.id) ?? 0;
    return { ...a, value, weightPct: (value / total) * 100 };
  });
})();

export const portfolioSummary = (() => {
  const totalValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalCost = holdings.reduce((s, h) => s + h.costValue, 0);
  const totalGain = totalValue - totalCost;
  const investable = holdings.filter((h) => h.assetClass !== "Cash");
  const dayChangeUsd = investable.reduce((s, h) => s + (h.marketValue * h.dayChangePct) / 100, 0);
  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPct: (totalGain / totalCost) * 100,
    dayChangeUsd,
    dayChangePct: (dayChangeUsd / totalValue) * 100,
    cash: holdings.filter((h) => h.assetClass === "Cash").reduce((s, h) => s + h.marketValue, 0),
    holdingsCount: investable.length,
    accountsCount: accounts.length,
    ytdReturnPct: 14.82,
    incomeYieldPct: 1.94,
    asOf: "Jun 21, 2026 · 4:00 PM ET",
  };
})();

/** Performance chart placeholder series (indexed to 100 at period start). */
export const performanceSeries = {
  ranges: ["1M", "3M", "6M", "1Y", "ALL"] as const,
  portfolio: [100, 101.2, 100.4, 102.8, 104.1, 103.2, 106.0, 108.4, 107.1, 110.5, 112.9, 111.8, 114.8],
  benchmark: [100, 100.8, 100.1, 101.9, 102.6, 102.0, 103.8, 105.1, 104.4, 106.2, 107.5, 107.0, 108.9],
  labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
};
