/**
 * Phase 1 mock data. Deterministic, in-memory, presentation-only.
 *
 * This is a stand-in for the future `@lwi/types` contract + API. Shapes here
 * intentionally resemble the eventual domain model (see docs/DATA_MODEL.md) so
 * swapping mock → real data is a fetch change, not a UI rewrite. NO real prices,
 * NO PII, NO network. Numbers are illustrative only.
 */

export type Trend = number[];

export interface PortfolioSummary {
  totalValueUsd: number;
  dayChangeUsd: number;
  dayChangePct: number;
  totalGainUsd: number;
  totalGainPct: number;
  cashUsd: number;
  buyingPowerUsd: number;
  asOf: string;
  valueTrend: Trend;
}

export interface AllocationSlice {
  key: string;
  label: string;
  weightPct: number;
  valueUsd: number;
}

export interface WatchItem {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  trend: Trend;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  level: number;
  changePct: number;
  trend: Trend;
}

export interface RiskSnapshot {
  riskScore: number; // 0–100
  tier: "Conservative" | "Balanced" | "Growth" | "Aggressive";
  volatilityPct: number;
  beta: number;
  sharpe: number;
  maxDrawdownPct: number;
  var95Usd: number;
}

const trend = (seed: number[]): Trend => seed;

export const portfolio: PortfolioSummary = {
  totalValueUsd: 12_480_932.55,
  dayChangeUsd: 84_201.12,
  dayChangePct: 0.68,
  totalGainUsd: 2_914_553.0,
  totalGainPct: 30.48,
  cashUsd: 642_118.39,
  buyingPowerUsd: 1_284_236.78,
  asOf: "Jun 21, 2026 · 4:00 PM ET",
  valueTrend: trend([
    9.4, 9.55, 9.7, 9.62, 9.9, 10.2, 10.05, 10.4, 10.8, 10.65, 11.1, 11.4, 11.3,
    11.7, 11.95, 11.8, 12.1, 12.3, 12.2, 12.48,
  ]),
};

export const allocation: AllocationSlice[] = [
  { key: "equities", label: "Equities", weightPct: 58.2, valueUsd: 7_263_902 },
  { key: "fixed_income", label: "Fixed Income", weightPct: 18.6, valueUsd: 2_321_453 },
  { key: "alternatives", label: "Alternatives", weightPct: 9.4, valueUsd: 1_173_207 },
  { key: "real_assets", label: "Real Assets", weightPct: 6.7, valueUsd: 836_222 },
  { key: "cash", label: "Cash & Equivalents", weightPct: 5.1, valueUsd: 642_118 },
  { key: "crypto", label: "Digital Assets", weightPct: 2.0, valueUsd: 244_030 },
];

export const watchlist: WatchItem[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 241.18, changePct: 1.12, trend: [3, 3.1, 3.05, 3.2, 3.18, 3.3, 3.42] },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 502.74, changePct: 0.46, trend: [6.6, 6.55, 6.7, 6.62, 6.8, 6.75, 6.9] },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 1_184.5, changePct: -0.82, trend: [12.6, 12.4, 12.5, 12.2, 12.3, 12.0, 11.84] },
  { symbol: "BRK.B", name: "Berkshire Hathaway", price: 478.9, changePct: 0.21, trend: [4.6, 4.62, 4.61, 4.7, 4.68, 4.75, 4.79] },
  { symbol: "JPM", name: "JPMorgan Chase", price: 276.33, changePct: -0.34, trend: [2.8, 2.82, 2.79, 2.78, 2.77, 2.76, 2.76] },
  { symbol: "XOM", name: "Exxon Mobil", price: 118.07, changePct: 0.94, trend: [1.12, 1.1, 1.14, 1.13, 1.16, 1.17, 1.18] },
];

export const indices: MarketIndex[] = [
  { symbol: "SPX", name: "S&P 500", level: 6_184.42, changePct: 0.62, trend: [60.1, 60.4, 60.2, 60.8, 61.2, 61.0, 61.84] },
  { symbol: "NDX", name: "Nasdaq 100", level: 22_910.18, changePct: 0.88, trend: [224, 226, 225, 227, 228, 227.5, 229.1] },
  { symbol: "DJI", name: "Dow Jones", level: 44_021.7, changePct: 0.31, trend: [438, 439, 438.5, 440, 439.8, 440.1, 440.2] },
  { symbol: "RUT", name: "Russell 2000", level: 2_318.04, changePct: -0.45, trend: [23.4, 23.5, 23.3, 23.35, 23.2, 23.25, 23.18] },
  { symbol: "VIX", name: "Volatility", level: 13.42, changePct: -2.18, trend: [14.2, 14.0, 13.9, 13.7, 13.6, 13.5, 13.42] },
  { symbol: "DXY", name: "US Dollar", level: 99.18, changePct: 0.12, trend: [98.9, 99.0, 98.95, 99.1, 99.05, 99.15, 99.18] },
];

export const risk: RiskSnapshot = {
  riskScore: 62,
  tier: "Growth",
  volatilityPct: 11.8,
  beta: 1.04,
  sharpe: 1.62,
  maxDrawdownPct: -14.3,
  var95Usd: -318_400,
};

/** Empty-state demo surfaces (Phase 1 ships clean empties, not fake rows). */
export const alerts: unknown[] = [];
export const recentActivity: unknown[] = [];
