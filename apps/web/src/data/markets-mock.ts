/**
 * Phase 3 mock data — a single securities "universe" that powers Markets AND
 * Watchlists, so indices, sectors, movers, the heatmap, and watchlists all stay
 * internally consistent (one source, many views). Presentation-only, no network.
 *
 * Trends are DERIVED deterministically from price/change (no Math.random) so SSR
 * and client hydration match. Plain `number` is mock-display only — real money
 * math moves to `@lwi/utils/money` (decimal) per CLAUDE.md §5.
 */

export type Sector =
  | "Technology"
  | "Communication"
  | "Consumer Discretionary"
  | "Consumer Staples"
  | "Financials"
  | "Health Care"
  | "Energy"
  | "Industrials"
  | "Materials"
  | "Utilities"
  | "Real Estate";

export type AssetType = "Stock" | "ETF" | "Fund";

export interface Security {
  symbol: string;
  name: string;
  assetType: AssetType;
  sector: Sector;
  category?: string; // shown for ETFs/funds (e.g. "Large Blend", "Total Bond")
  price: number;
  changePct: number;
  marketCapB: number; // $ billions (AUM for funds)
  volumeM: number; // shares, millions
  trend: number[];
}

// Existing stock rows omit assetType (defaults to "Stock"); ETFs/funds set it.
type SecurityRaw = Omit<Security, "trend" | "assetType"> & { assetType?: AssetType };

/** Deterministic 7-point trend ending at `price`, direction matching change. */
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

const RAW: SecurityRaw[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", price: 241.18, changePct: 1.12, marketCapB: 3680, volumeM: 52 },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology", price: 502.74, changePct: 0.46, marketCapB: 3740, volumeM: 21 },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology", price: 1184.5, changePct: -0.82, marketCapB: 2920, volumeM: 38 },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology", price: 1685.0, changePct: 1.34, marketCapB: 790, volumeM: 6 },
  { symbol: "ORCL", name: "Oracle Corp.", sector: "Technology", price: 192.4, changePct: 0.58, marketCapB: 540, volumeM: 9 },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology", price: 312.7, changePct: -0.41, marketCapB: 300, volumeM: 7 },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology", price: 178.2, changePct: -1.12, marketCapB: 288, volumeM: 41 },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology", price: 565.3, changePct: 0.22, marketCapB: 250, volumeM: 4 },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication", price: 198.22, changePct: 0.78, marketCapB: 2410, volumeM: 24 },
  { symbol: "META", name: "Meta Platforms", sector: "Communication", price: 712.5, changePct: 1.02, marketCapB: 1810, volumeM: 16 },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication", price: 985.4, changePct: -0.35, marketCapB: 420, volumeM: 4 },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Communication", price: 112.8, changePct: 0.44, marketCapB: 205, volumeM: 11 },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary", price: 224.6, changePct: 0.66, marketCapB: 2330, volumeM: 35 },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Discretionary", price: 348.9, changePct: -2.1, marketCapB: 1110, volumeM: 88 },
  { symbol: "HD", name: "Home Depot Inc.", sector: "Consumer Discretionary", price: 405.66, changePct: -0.21, marketCapB: 402, volumeM: 4 },
  { symbol: "MCD", name: "McDonald's Corp.", sector: "Consumer Discretionary", price: 298.4, changePct: 0.18, marketCapB: 214, volumeM: 3 },
  { symbol: "NKE", name: "Nike Inc.", sector: "Consumer Discretionary", price: 78.3, changePct: -0.92, marketCapB: 116, volumeM: 9 },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Staples", price: 98.7, changePct: 0.34, marketCapB: 790, volumeM: 14 },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples", price: 168.2, changePct: 0.12, marketCapB: 396, volumeM: 6 },
  { symbol: "KO", name: "Coca-Cola Co.", sector: "Consumer Staples", price: 71.4, changePct: 0.28, marketCapB: 308, volumeM: 13 },
  { symbol: "COST", name: "Costco Wholesale", sector: "Consumer Staples", price: 1042.0, changePct: 0.51, marketCapB: 462, volumeM: 2 },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials", price: 276.33, changePct: -0.34, marketCapB: 770, volumeM: 9 },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Financials", price: 478.9, changePct: 0.21, marketCapB: 1030, volumeM: 4 },
  { symbol: "V", name: "Visa Inc.", sector: "Financials", price: 348.1, changePct: 0.39, marketCapB: 670, volumeM: 6 },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financials", price: 552.7, changePct: 0.41, marketCapB: 510, volumeM: 3 },
  { symbol: "BAC", name: "Bank of America", sector: "Financials", price: 47.8, changePct: -0.55, marketCapB: 360, volumeM: 38 },
  { symbol: "GS", name: "Goldman Sachs", sector: "Financials", price: 612.3, changePct: 0.72, marketCapB: 195, volumeM: 2 },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Health Care", price: 612.4, changePct: 0.65, marketCapB: 560, volumeM: 3 },
  { symbol: "LLY", name: "Eli Lilly & Co.", sector: "Health Care", price: 925.6, changePct: 1.48, marketCapB: 880, volumeM: 4 },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Health Care", price: 162.9, changePct: 0.2, marketCapB: 392, volumeM: 7 },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Health Care", price: 27.1, changePct: -0.74, marketCapB: 154, volumeM: 31 },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Health Care", price: 198.4, changePct: 0.33, marketCapB: 350, volumeM: 6 },
  { symbol: "XOM", name: "Exxon Mobil Corp.", sector: "Energy", price: 118.07, changePct: 0.94, marketCapB: 470, volumeM: 16 },
  { symbol: "CVX", name: "Chevron Corp.", sector: "Energy", price: 158.2, changePct: 0.81, marketCapB: 290, volumeM: 9 },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy", price: 102.6, changePct: 1.22, marketCapB: 128, volumeM: 7 },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrials", price: 412.8, changePct: 0.55, marketCapB: 196, volumeM: 3 },
  { symbol: "BA", name: "Boeing Co.", sector: "Industrials", price: 215.4, changePct: -1.34, marketCapB: 162, volumeM: 8 },
  { symbol: "GE", name: "GE Aerospace", sector: "Industrials", price: 248.7, changePct: 0.88, marketCapB: 268, volumeM: 5 },
  { symbol: "LIN", name: "Linde plc", sector: "Materials", price: 462.1, changePct: 0.27, marketCapB: 220, volumeM: 2 },
  { symbol: "FCX", name: "Freeport-McMoRan", sector: "Materials", price: 48.9, changePct: -1.05, marketCapB: 70, volumeM: 18 },
  { symbol: "NEE", name: "NextEra Energy", sector: "Utilities", price: 78.6, changePct: 0.15, marketCapB: 162, volumeM: 9 },
  { symbol: "DUK", name: "Duke Energy", sector: "Utilities", price: 118.3, changePct: 0.09, marketCapB: 91, volumeM: 3 },
  { symbol: "AMT", name: "American Tower", sector: "Real Estate", price: 212.4, changePct: -0.62, marketCapB: 99, volumeM: 3 },
  { symbol: "PLD", name: "Prologis Inc.", sector: "Real Estate", price: 118.9, changePct: -0.48, marketCapB: 110, volumeM: 4 },

  // ── More stocks ───────────────────────────────────────────────────────────
  { symbol: "INTC", name: "Intel Corp.", sector: "Technology", price: 24.6, changePct: -1.45, marketCapB: 106, volumeM: 60 },
  { symbol: "QCOM", name: "Qualcomm Inc.", sector: "Technology", price: 168.3, changePct: 0.52, marketCapB: 186, volumeM: 9 },
  { symbol: "TXN", name: "Texas Instruments", sector: "Technology", price: 201.7, changePct: 0.33, marketCapB: 184, volumeM: 5 },
  { symbol: "IBM", name: "IBM Corp.", sector: "Technology", price: 244.1, changePct: 0.61, marketCapB: 226, volumeM: 4 },
  { symbol: "NOW", name: "ServiceNow Inc.", sector: "Technology", price: 1012.5, changePct: 1.08, marketCapB: 208, volumeM: 2 },
  { symbol: "INTU", name: "Intuit Inc.", sector: "Technology", price: 652.4, changePct: 0.47, marketCapB: 182, volumeM: 2 },
  { symbol: "MU", name: "Micron Technology", sector: "Technology", price: 112.8, changePct: -1.9, marketCapB: 125, volumeM: 22 },
  { symbol: "TMUS", name: "T-Mobile US", sector: "Communication", price: 238.6, changePct: 0.29, marketCapB: 277, volumeM: 4 },
  { symbol: "VZ", name: "Verizon Communications", sector: "Communication", price: 43.2, changePct: -0.31, marketCapB: 182, volumeM: 17 },
  { symbol: "CMCSA", name: "Comcast Corp.", sector: "Communication", price: 38.1, changePct: -0.62, marketCapB: 146, volumeM: 18 },
  { symbol: "LOW", name: "Lowe's Companies", sector: "Consumer Discretionary", price: 256.9, changePct: 0.18, marketCapB: 146, volumeM: 3 },
  { symbol: "SBUX", name: "Starbucks Corp.", sector: "Consumer Discretionary", price: 98.4, changePct: 0.74, marketCapB: 112, volumeM: 8 },
  { symbol: "BKNG", name: "Booking Holdings", sector: "Consumer Discretionary", price: 5120.0, changePct: 0.91, marketCapB: 172, volumeM: 1 },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Staples", price: 152.7, changePct: 0.22, marketCapB: 209, volumeM: 6 },
  { symbol: "MO", name: "Altria Group", sector: "Consumer Staples", price: 58.9, changePct: 0.41, marketCapB: 99, volumeM: 9 },
  { symbol: "WFC", name: "Wells Fargo & Co.", sector: "Financials", price: 78.2, changePct: -0.28, marketCapB: 262, volumeM: 14 },
  { symbol: "MS", name: "Morgan Stanley", sector: "Financials", price: 132.5, changePct: 0.55, marketCapB: 213, volumeM: 7 },
  { symbol: "AXP", name: "American Express", sector: "Financials", price: 298.4, changePct: 0.68, marketCapB: 211, volumeM: 3 },
  { symbol: "SCHW", name: "Charles Schwab", sector: "Financials", price: 84.6, changePct: -0.44, marketCapB: 153, volumeM: 9 },
  { symbol: "BLK", name: "BlackRock Inc.", sector: "Financials", price: 1042.0, changePct: 0.37, marketCapB: 158, volumeM: 1 },
  { symbol: "MRK", name: "Merck & Co.", sector: "Health Care", price: 98.7, changePct: -0.52, marketCapB: 248, volumeM: 12 },
  { symbol: "TMO", name: "Thermo Fisher Scientific", sector: "Health Care", price: 542.1, changePct: 0.44, marketCapB: 205, volumeM: 2 },
  { symbol: "ABT", name: "Abbott Laboratories", sector: "Health Care", price: 134.8, changePct: 0.31, marketCapB: 234, volumeM: 6 },
  { symbol: "AMGN", name: "Amgen Inc.", sector: "Health Care", price: 298.2, changePct: -0.27, marketCapB: 160, volumeM: 3 },
  { symbol: "SLB", name: "Schlumberger Ltd.", sector: "Energy", price: 42.6, changePct: 1.08, marketCapB: 60, volumeM: 11 },
  { symbol: "HON", name: "Honeywell International", sector: "Industrials", price: 221.4, changePct: 0.36, marketCapB: 144, volumeM: 3 },
  { symbol: "UNP", name: "Union Pacific", sector: "Industrials", price: 242.8, changePct: -0.19, marketCapB: 146, volumeM: 3 },
  { symbol: "RTX", name: "RTX Corp.", sector: "Industrials", price: 128.6, changePct: 0.62, marketCapB: 172, volumeM: 6 },
  { symbol: "LMT", name: "Lockheed Martin", sector: "Industrials", price: 462.3, changePct: -0.41, marketCapB: 109, volumeM: 1 },
  { symbol: "SHW", name: "Sherwin-Williams", sector: "Materials", price: 358.1, changePct: 0.24, marketCapB: 90, volumeM: 2 },
  { symbol: "NEM", name: "Newmont Corp.", sector: "Materials", price: 52.4, changePct: 1.32, marketCapB: 59, volumeM: 12 },
  { symbol: "SO", name: "Southern Co.", sector: "Utilities", price: 89.7, changePct: 0.12, marketCapB: 98, volumeM: 4 },
  { symbol: "O", name: "Realty Income", sector: "Real Estate", price: 58.3, changePct: -0.38, marketCapB: 52, volumeM: 5 },

  // ── ETFs ──────────────────────────────────────────────────────────────────
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", assetType: "ETF", sector: "Financials", category: "Large Blend", price: 618.4, changePct: 0.62, marketCapB: 615, volumeM: 48 },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", assetType: "ETF", sector: "Financials", category: "Large Blend", price: 568.9, changePct: 0.61, marketCapB: 540, volumeM: 6 },
  { symbol: "IVV", name: "iShares Core S&P 500 ETF", assetType: "ETF", sector: "Financials", category: "Large Blend", price: 621.7, changePct: 0.62, marketCapB: 520, volumeM: 5 },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", assetType: "ETF", sector: "Financials", category: "Total US Market", price: 305.2, changePct: 0.58, marketCapB: 470, volumeM: 4 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", assetType: "ETF", sector: "Technology", category: "Large Growth", price: 558.1, changePct: 0.88, marketCapB: 320, volumeM: 35 },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", assetType: "ETF", sector: "Financials", category: "Small Blend", price: 231.6, changePct: -0.45, marketCapB: 72, volumeM: 28 },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial ETF", assetType: "ETF", sector: "Financials", category: "Large Value", price: 440.2, changePct: 0.31, marketCapB: 38, volumeM: 4 },
  { symbol: "VEA", name: "Vanguard FTSE Developed Markets ETF", assetType: "ETF", sector: "Financials", category: "Foreign Large Blend", price: 54.8, changePct: 0.27, marketCapB: 145, volumeM: 8 },
  { symbol: "VWO", name: "Vanguard FTSE Emerging Markets ETF", assetType: "ETF", sector: "Financials", category: "Emerging Markets", price: 48.3, changePct: -0.34, marketCapB: 88, volumeM: 9 },
  { symbol: "SCHD", name: "Schwab US Dividend Equity ETF", assetType: "ETF", sector: "Financials", category: "Large Value · Dividend", price: 28.4, changePct: 0.19, marketCapB: 70, volumeM: 12 },
  { symbol: "VUG", name: "Vanguard Growth ETF", assetType: "ETF", sector: "Technology", category: "Large Growth", price: 432.1, changePct: 0.84, marketCapB: 150, volumeM: 3 },
  { symbol: "VTV", name: "Vanguard Value ETF", assetType: "ETF", sector: "Financials", category: "Large Value", price: 178.6, changePct: 0.22, marketCapB: 135, volumeM: 3 },
  { symbol: "AGG", name: "iShares Core US Aggregate Bond ETF", assetType: "ETF", sector: "Financials", category: "Intermediate Bond", price: 99.85, changePct: 0.12, marketCapB: 122, volumeM: 9 },
  { symbol: "BND", name: "Vanguard Total Bond Market ETF", assetType: "ETF", sector: "Financials", category: "Intermediate Bond", price: 73.2, changePct: 0.1, marketCapB: 118, volumeM: 7 },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", assetType: "ETF", sector: "Financials", category: "Long Government", price: 92.4, changePct: 0.3, marketCapB: 60, volumeM: 28 },
  { symbol: "LQD", name: "iShares iBoxx Investment Grade Corp ETF", assetType: "ETF", sector: "Financials", category: "Corporate Bond", price: 110.8, changePct: 0.18, marketCapB: 32, volumeM: 9 },
  { symbol: "HYG", name: "iShares iBoxx High Yield Corp ETF", assetType: "ETF", sector: "Financials", category: "High Yield Bond", price: 80.6, changePct: 0.07, marketCapB: 18, volumeM: 30 },
  { symbol: "GLD", name: "SPDR Gold Shares", assetType: "ETF", sector: "Materials", category: "Commodities · Gold", price: 214.55, changePct: 0.4, marketCapB: 78, volumeM: 7 },
  { symbol: "VNQ", name: "Vanguard Real Estate ETF", assetType: "ETF", sector: "Real Estate", category: "Real Estate", price: 92.1, changePct: -0.48, marketCapB: 36, volumeM: 5 },
  { symbol: "XLK", name: "Technology Select Sector SPDR", assetType: "ETF", sector: "Technology", category: "Technology", price: 252.3, changePct: 0.79, marketCapB: 72, volumeM: 6 },
  { symbol: "XLF", name: "Financial Select Sector SPDR", assetType: "ETF", sector: "Financials", category: "Financials", price: 51.4, changePct: 0.24, marketCapB: 48, volumeM: 38 },
  { symbol: "XLE", name: "Energy Select Sector SPDR", assetType: "ETF", sector: "Energy", category: "Energy", price: 94.7, changePct: 0.96, marketCapB: 36, volumeM: 16 },
  { symbol: "IBIT", name: "iShares Bitcoin Trust ETF", assetType: "ETF", sector: "Financials", category: "Digital Assets", price: 58.2, changePct: 2.1, marketCapB: 70, volumeM: 40 },
  { symbol: "ARKK", name: "ARK Innovation ETF", assetType: "ETF", sector: "Technology", category: "Mid-Cap Growth", price: 62.8, changePct: -1.24, marketCapB: 8, volumeM: 14 },

  // ── Mutual funds ──────────────────────────────────────────────────────────
  { symbol: "VFIAX", name: "Vanguard 500 Index Fund Admiral", assetType: "Fund", sector: "Financials", category: "Large Blend", price: 542.6, changePct: 0.61, marketCapB: 480, volumeM: 0 },
  { symbol: "FXAIX", name: "Fidelity 500 Index Fund", assetType: "Fund", sector: "Financials", category: "Large Blend", price: 205.3, changePct: 0.61, marketCapB: 560, volumeM: 0 },
  { symbol: "VTSAX", name: "Vanguard Total Stock Market Index Admiral", assetType: "Fund", sector: "Financials", category: "Total US Market", price: 142.8, changePct: 0.58, marketCapB: 1500, volumeM: 0 },
  { symbol: "VTIAX", name: "Vanguard Total International Stock Index", assetType: "Fund", sector: "Financials", category: "Foreign Large Blend", price: 36.9, changePct: 0.21, marketCapB: 430, volumeM: 0 },
  { symbol: "VBTLX", name: "Vanguard Total Bond Market Index Admiral", assetType: "Fund", sector: "Financials", category: "Intermediate Bond", price: 9.7, changePct: 0.1, marketCapB: 320, volumeM: 0 },
  { symbol: "SWPPX", name: "Schwab S&P 500 Index Fund", assetType: "Fund", sector: "Financials", category: "Large Blend", price: 88.4, changePct: 0.61, marketCapB: 95, volumeM: 0 },
  { symbol: "FCNTX", name: "Fidelity Contrafund", assetType: "Fund", sector: "Technology", category: "Large Growth", price: 22.6, changePct: 0.73, marketCapB: 140, volumeM: 0 },
  { symbol: "DODGX", name: "Dodge & Cox Stock Fund", assetType: "Fund", sector: "Financials", category: "Large Value", price: 268.1, changePct: 0.28, marketCapB: 100, volumeM: 0 },
];

export const securities: Security[] = RAW.map((s, i) => ({
  ...s,
  assetType: s.assetType ?? "Stock",
  trend: mkTrend(s.price, s.changePct, i),
}));

/** Stocks only — the sector-based views (screener, heatmap, movers, sector perf)
 *  operate on these so ETFs/funds don't distort sector analytics. */
export const stocks: Security[] = securities.filter((s) => s.assetType === "Stock");

const bySymbol = new Map(securities.map((s) => [s.symbol, s]));
export function getSecurity(symbol: string): Security | undefined {
  return bySymbol.get(symbol);
}

export const SECTOR_ORDER: Sector[] = [
  "Technology",
  "Communication",
  "Consumer Discretionary",
  "Consumer Staples",
  "Financials",
  "Health Care",
  "Energy",
  "Industrials",
  "Materials",
  "Utilities",
  "Real Estate",
];

export interface SectorPerf {
  sector: Sector;
  changePct: number; // market-cap weighted
  marketCapB: number;
  count: number;
}

export const sectorPerformance: SectorPerf[] = SECTOR_ORDER.map((sector) => {
  const items = stocks.filter((s) => s.sector === sector);
  const mcap = items.reduce((sum, s) => sum + s.marketCapB, 0);
  const weighted = items.reduce((sum, s) => sum + s.changePct * s.marketCapB, 0) / (mcap || 1);
  return { sector, changePct: weighted, marketCapB: mcap, count: items.length };
}).sort((a, b) => b.changePct - a.changePct);

export const movers = {
  gainers: [...stocks].sort((a, b) => b.changePct - a.changePct).slice(0, 6),
  losers: [...stocks].sort((a, b) => a.changePct - b.changePct).slice(0, 6),
  mostActive: [...stocks].sort((a, b) => b.volumeM - a.volumeM).slice(0, 6),
};

/** Heatmap: sectors (largest first) each with their stocks (largest first). */
export const heatmap = SECTOR_ORDER.map((sector) => {
  const items = stocks.filter((s) => s.sector === sector).sort((a, b) => b.marketCapB - a.marketCapB);
  const marketCapB = items.reduce((sum, s) => sum + s.marketCapB, 0);
  return { sector, marketCapB, items };
})
  .filter((g) => g.items.length > 0)
  .sort((a, b) => b.marketCapB - a.marketCapB);

export interface MarketIndex {
  symbol: string;
  name: string;
  level: number;
  changePct: number;
  ytdPct: number;
  trend: number[];
}

const INDEX_RAW: Omit<MarketIndex, "trend">[] = [
  { symbol: "SPX", name: "S&P 500", level: 6184.42, changePct: 0.62, ytdPct: 12.4 },
  { symbol: "NDX", name: "Nasdaq 100", level: 22910.18, changePct: 0.88, ytdPct: 16.1 },
  { symbol: "DJI", name: "Dow Jones", level: 44021.7, changePct: 0.31, ytdPct: 7.8 },
  { symbol: "RUT", name: "Russell 2000", level: 2318.04, changePct: -0.45, ytdPct: 3.2 },
  { symbol: "VIX", name: "Volatility (VIX)", level: 13.42, changePct: -2.18, ytdPct: -18.6 },
  { symbol: "DXY", name: "US Dollar (DXY)", level: 99.18, changePct: 0.12, ytdPct: -1.4 },
];

export const indices: MarketIndex[] = INDEX_RAW.map((idx, i) => ({
  ...idx,
  trend: mkTrend(idx.level, idx.changePct, i + 3),
}));
