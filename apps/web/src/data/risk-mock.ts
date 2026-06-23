/**
 * Phase 6 / Backend B4 — Portfolio risk engine. Every metric is DERIVED from the
 * LIVE portfolio (whatever holdings are in the data seam: mock or Postgres) via
 * `buildRiskAnalysis(view)`, plus per-security betas (security-detail-mock). So
 * the risk page ties out with the Portfolio and Security pages and recomputes
 * whenever holdings change. Pure, deterministic, no network, no Math.random.
 * Plain numbers are mock display only (CLAUDE.md §5).
 *
 * Method (mock but methodologically honest):
 *  - Each holding gets a beta + annualized volatility.
 *  - Portfolio beta   = Σ wᵢ·βᵢ
 *  - Portfolio vol    = √(wᵀ Σ w), Σᵢⱼ = ρᵢⱼ·σᵢ·σⱼ  (correlation-aware)
 *  - VaR (parametric) = z·σ_daily·value
 *  - Concentration    = Herfindahl index + effective N
 *  - Scenarios        = per-holding shock(βᵢ, asset class, sector) → portfolio P&L
 */
import type { PortfolioView } from "@/data/portfolio-derive";
import type { Holding } from "@/data/portfolio-mock";
import { getSecurityDetail } from "@/data/security-detail-mock";

const RISK_FREE = 4.3; // annualized %
const REALIZED_RETURN = 14.8; // trailing 1Y portfolio return (matches perf series)

/* ── per-holding beta + volatility ────────────────────────────────────────── */
// Non-equity sleeves (ETFs, cash) aren't in the equity universe — assign directly.
const OVERRIDE: Record<string, { beta: number; vol: number }> = {
  AGG: { beta: 0.08, vol: 5 },
  TLT: { beta: 0.15, vol: 12 },
  GLD: { beta: 0.1, vol: 13 },
  VNQ: { beta: 0.85, vol: 18 },
  IBIT: { beta: 2.4, vol: 55 },
  USD: { beta: 0, vol: 0.2 },
};

function riskFor(h: Holding): { beta: number; vol: number } {
  const o = OVERRIDE[h.symbol];
  if (o) return o;
  if (h.assetClass === "Cash") return { beta: 0, vol: 0.2 };
  const beta = getSecurityDetail(h.symbol)?.beta ?? 1;
  return { beta, vol: Number((9 + beta * 12).toFixed(1)) };
}

export interface HoldingRisk {
  symbol: string;
  name: string;
  sector: string;
  assetClass: string;
  weightPct: number;
  marketValue: number;
  beta: number;
  vol: number;
}

/* ── correlations ─────────────────────────────────────────────────────────── */
const ACORR: Record<string, number> = {
  "Equities|Fixed Income": -0.2, "Equities|Real Assets": 0.3, "Equities|Cash": 0, "Equities|Digital Assets": 0.5,
  "Fixed Income|Real Assets": 0.15, "Fixed Income|Cash": 0.1, "Fixed Income|Digital Assets": -0.1,
  "Real Assets|Cash": 0, "Real Assets|Digital Assets": 0.25, "Cash|Digital Assets": 0,
};
function assetCorr(a: string, b: string): number {
  if (a === b) return 1;
  return ACORR[`${a}|${b}`] ?? ACORR[`${b}|${a}`] ?? 0;
}
function holdingCorr(a: HoldingRisk, b: HoldingRisk): number {
  if (a.symbol === b.symbol) return 1;
  if (a.sector === b.sector) return 0.8;
  if (a.assetClass === b.assetClass) return 0.45;
  return assetCorr(a.assetClass, b.assetClass);
}

export type RiskTier = "Conservative" | "Balanced" | "Growth" | "Aggressive";

export interface RiskModel {
  portfolioValue: number;
  portfolioBeta: number;
  portfolioVol: number;
  sharpe: number;
  maxDrawdownPct: number;
  var95Pct: number;
  var99Pct: number;
  var95Usd: number;
  var99Usd: number;
  riskScore: number;
  riskTier: RiskTier;
  asOf: string;
}

export interface Concentration {
  hhi: number;
  effectiveN: number;
  top1Pct: number;
  top5Pct: number;
  topSectorPct: number;
  topSectorLabel: string;
}

export interface RiskTrendPoint {
  label: string;
  score: number;
}

export interface CorrelationMatrix {
  symbols: string[];
  rows: number[][];
}

/* ── scenario / stress testing ────────────────────────────────────────────── */
interface ScenarioDef {
  id: string;
  name: string;
  description: string;
  market: number; // applied as βᵢ·market to every holding
  byClass?: Record<string, number>;
  bySector?: Record<string, number>;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: "spx10",
    name: "S&P 500 −10%",
    description: "Broad equity drawdown; flight to bonds & gold.",
    market: -10,
    byClass: { "Fixed Income": 1.0, "Real Assets": 0.4, "Digital Assets": -3 },
    bySector: { Commodities: 2.5 },
  },
  {
    id: "rates100",
    name: "Rates +100 bps",
    description: "Duration repricing; pressure on rate-sensitive sleeves.",
    market: -2,
    byClass: { "Fixed Income": -6, "Digital Assets": -4 },
    bySector: { "Real Estate": -4.5, Utilities: -2.5, Financials: 1.5, Commodities: -0.5 },
  },
  {
    id: "techsell",
    name: "Tech Sector Selloff",
    description: "Multiple compression concentrated in mega-cap tech.",
    market: -3,
    byClass: { "Digital Assets": -10 },
    bySector: { Technology: -12, Communication: -7 },
  },
  {
    id: "recession",
    name: "Recession Shock",
    description: "Severe risk-off; earnings cuts, credit stress.",
    market: -22,
    byClass: { "Fixed Income": 4, "Real Assets": 1, "Digital Assets": -30 },
    bySector: { Commodities: 3, Energy: -15, Financials: -6 },
  },
  {
    id: "inflation",
    name: "Energy / Inflation Spike",
    description: "Commodity spike; sticky inflation, real-rate shock.",
    market: -6,
    byClass: { "Fixed Income": -3, "Digital Assets": -5 },
    bySector: { Energy: 14, Commodities: 8, "Consumer Discretionary": -5, Technology: -4 },
  },
];

export interface ScenarioContribution {
  symbol: string;
  name: string;
  sector: string;
  impactPct: number;
  impactUsd: number;
}
export interface ScenarioResult {
  id: string;
  name: string;
  description: string;
  portfolioImpactPct: number;
  portfolioImpactUsd: number;
  contributions: ScenarioContribution[];
  drivers: ScenarioContribution[]; // worst 5
}

function runScenario(def: ScenarioDef, holdingRisks: HoldingRisk[], portfolioValue: number): ScenarioResult {
  const contributions: ScenarioContribution[] = holdingRisks.map((h) => {
    const impactPct =
      def.market * h.beta + (def.byClass?.[h.assetClass] ?? 0) + (def.bySector?.[h.sector] ?? 0);
    return {
      symbol: h.symbol,
      name: h.name,
      sector: h.sector,
      impactPct,
      impactUsd: (h.marketValue * impactPct) / 100,
    };
  });
  const portfolioImpactUsd = contributions.reduce((s, c) => s + c.impactUsd, 0);
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    portfolioImpactUsd,
    portfolioImpactPct: portfolioValue > 0 ? (portfolioImpactUsd / portfolioValue) * 100 : 0,
    contributions: [...contributions].sort((a, b) => a.impactUsd - b.impactUsd),
    drivers: [...contributions].sort((a, b) => a.impactUsd - b.impactUsd).slice(0, 5),
  };
}

const TREND_SHAPE = [0.86, 0.9, 0.95, 1.06, 1.14, 1.07, 0.99, 0.92, 0.94, 1.0, 0.97, 1.0];
const TREND_MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function clamp(v: number, lo = 0, hi = 100) {
  return Math.min(hi, Math.max(lo, v));
}

/* ── the live analysis bundle the pages consume ───────────────────────────── */
export interface RiskAnalysis {
  holdingRisks: HoldingRisk[];
  concentrationHoldings: HoldingRisk[];
  concentration: Concentration;
  correlationMatrix: CorrelationMatrix;
  scenarios: ScenarioResult[];
  riskTrend: RiskTrendPoint[];
  riskModel: RiskModel;
}

/**
 * Build the full risk analysis from a live PortfolioView. Generic over any
 * holdings set — add or remove a position and every metric below recomputes.
 */
export function buildRiskAnalysis(view: PortfolioView): RiskAnalysis {
  const holdingRisks: HoldingRisk[] = view.holdings.map((h) => {
    const { beta, vol } = riskFor(h);
    return {
      symbol: h.symbol,
      name: h.name,
      sector: h.sector,
      assetClass: h.assetClass,
      weightPct: h.weightPct,
      marketValue: h.marketValue,
      beta,
      vol,
    };
  });

  const portfolioValue = view.summary.totalValue;
  const w = holdingRisks.map((h) => h.weightPct / 100);

  const portfolioBeta = holdingRisks.reduce((s, h, i) => s + w[i]! * h.beta, 0);

  let variance = 0;
  for (let i = 0; i < holdingRisks.length; i++) {
    for (let j = 0; j < holdingRisks.length; j++) {
      variance += w[i]! * w[j]! * holdingCorr(holdingRisks[i]!, holdingRisks[j]!) * holdingRisks[i]!.vol * holdingRisks[j]!.vol;
    }
  }
  const portfolioVol = Math.sqrt(Math.max(variance, 0));
  const sharpe = portfolioVol > 0 ? (REALIZED_RETURN - RISK_FREE) / portfolioVol : 0;

  // Drawdown from a representative equity-curve index (programmatic max DD).
  const equityCurve = [100, 103, 106, 104, 108, 112, 109, 102, 96, 99, 104, 108, 111, 109, 113, 117];
  let peak = equityCurve[0]!;
  let mdd = 0;
  for (const v of equityCurve) {
    peak = Math.max(peak, v);
    mdd = Math.min(mdd, (v - peak) / peak);
  }
  const maxDrawdownPct = mdd * 100;

  // Parametric VaR (1-day).
  const dailyVol = portfolioVol / Math.sqrt(252);
  const var95Pct = 1.645 * dailyVol;
  const var99Pct = 2.326 * dailyVol;
  const var95Usd = -(portfolioValue * var95Pct) / 100;
  const var99Usd = -(portfolioValue * var99Pct) / 100;

  // Concentration.
  const concentrationHoldings = [...holdingRisks].sort((a, b) => b.weightPct - a.weightPct);
  const hhi = w.reduce((s, x) => s + x * x, 0); // fraction² (0..1)
  const concentration: Concentration = {
    hhi,
    effectiveN: hhi > 0 ? 1 / hhi : 0,
    top1Pct: concentrationHoldings[0]?.weightPct ?? 0,
    top5Pct: concentrationHoldings.slice(0, 5).reduce((s, h) => s + h.weightPct, 0),
    topSectorPct: view.sectorAllocation[0]?.weightPct ?? 0,
    topSectorLabel: view.sectorAllocation[0]?.label ?? "—",
  };

  // Risk score + tier.
  const riskScore = Math.round(
    clamp(portfolioBeta * 18 + portfolioVol * 1.9 + hhi * 100 * 1.3 + Math.abs(maxDrawdownPct) * 0.5),
  );
  const riskTier: RiskTier =
    riskScore < 35 ? "Conservative" : riskScore < 55 ? "Balanced" : riskScore < 75 ? "Growth" : "Aggressive";

  const riskTrend: RiskTrendPoint[] = TREND_SHAPE.map((f, i) => ({
    label: TREND_MONTHS[i]!,
    score: Math.round(clamp(riskScore * f)),
  }));

  // Correlation matrix (top holdings, ex-cash).
  const corrUniverse = concentrationHoldings.filter((h) => h.assetClass !== "Cash").slice(0, 8);
  const correlationMatrix: CorrelationMatrix = {
    symbols: corrUniverse.map((h) => h.symbol),
    rows: corrUniverse.map((a) => corrUniverse.map((b) => holdingCorr(a, b))),
  };

  const scenarios = SCENARIOS.map((def) => runScenario(def, holdingRisks, portfolioValue));

  const riskModel: RiskModel = {
    portfolioValue,
    portfolioBeta,
    portfolioVol,
    sharpe,
    maxDrawdownPct,
    var95Pct,
    var99Pct,
    var95Usd,
    var99Usd,
    riskScore,
    riskTier,
    asOf: view.summary.asOf,
  };

  return {
    holdingRisks,
    concentrationHoldings,
    concentration,
    correlationMatrix,
    scenarios,
    riskTrend,
    riskModel,
  };
}

/* ── rebalance guidance ───────────────────────────────────────────────────── */
export interface RebalanceAdvice {
  level: "elevated" | "high";
  targetTier: string;
  reasons: string[]; // why risk is flagged
  suggestions: string[]; // what to consider rebalancing toward
}

/**
 * If the book's risk is running hot, return a plain-language explanation of WHY
 * plus what to consider rebalancing toward — all derived from the live model.
 * Returns null when nothing is flagged (so the UI shows no alert).
 */
export function buildRebalanceAdvice(view: PortfolioView, risk: RiskAnalysis): RebalanceAdvice | null {
  const m = risk.riskModel;
  const c = risk.concentration;
  const top = risk.concentrationHoldings.find((h) => h.assetClass !== "Cash");
  const sector = view.sectorAllocation[0];
  const spx10 = risk.scenarios.find((s) => s.id === "spx10");
  const usd = (n: number) =>
    `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const highScore = m.riskScore >= 70;
  const highConc = c.top1Pct >= 30 || c.effectiveN < 4;
  const highBeta = m.portfolioBeta >= 1.15;
  const highVol = m.portfolioVol >= 24;
  if (!(highScore || highConc || highBeta || highVol)) return null;

  const level: "elevated" | "high" = m.riskScore >= 80 || c.top1Pct >= 45 ? "high" : "elevated";

  const reasons: string[] = [];
  if (highScore)
    reasons.push(`Composite risk is ${m.riskScore} (${m.riskTier}) — toward the aggressive end of the 0–100 scale.`);
  if (top && c.top1Pct >= 30)
    reasons.push(`${top.symbol} alone is ${c.top1Pct.toFixed(1)}% of the book, so a single name drives much of the outcome.`);
  if (c.top5Pct >= 70 || c.effectiveN < 4)
    reasons.push(`The top five holdings are ${c.top5Pct.toFixed(1)}% of the portfolio — about ${c.effectiveN.toFixed(1)} effective positions.`);
  if (highBeta)
    reasons.push(
      `Portfolio beta is ${m.portfolioBeta.toFixed(2)}, so the book swings more than the market${spx10 ? ` — a 10% S&P drop models to roughly ${spx10.portfolioImpactPct.toFixed(1)}% (${usd(spx10.portfolioImpactUsd)})` : ""}.`,
    );
  if (highVol) reasons.push(`Annualized volatility is about ${m.portfolioVol.toFixed(0)}%, on the higher side.`);

  const cap = Math.max(15, Math.round((c.top1Pct * 0.6) / 5) * 5);
  const suggestions: string[] = [];
  if (top && c.top1Pct >= 25)
    suggestions.push(`Trim ${top.symbol} toward a ~${cap}% cap to cut single-name dependence.`);
  suggestions.push(`Add lower-beta or defensive sleeves — broad bonds (AGG), Treasuries (TLT), gold (GLD), or consumer staples — to dampen swings.`);
  if (sector)
    suggestions.push(`Spread across more sectors; ${sector.label.toLowerCase()} is ${sector.weightPct.toFixed(0)}% of exposure today.`);
  suggestions.push(`Raise cash as dry powder to lower risk quickly without picking new names.`);

  const targetTier = m.riskScore >= 78 ? "Growth" : "Balanced";
  return { level, targetTier, reasons, suggestions };
}
