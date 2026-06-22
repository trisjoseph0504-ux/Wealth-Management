/**
 * Phase 7 / Backend B4 — Alerts & notifications. Alert *values* are derived from
 * the LIVE platform data (holdings weights, risk model, sector allocation) via
 * `buildAlerts(view, risk)`, so they tie out with the Portfolio and Risk pages —
 * the largest-position overweight and largest-sector concentration are computed
 * from the actual book, not invented. Specific catalysts (a watchlist price
 * target, an earnings date) are clearly illustrative. Deterministic, no network.
 *
 * Severity → token ramp: info → info (cool), caution → warn (amber), critical → red.
 */
import type { PortfolioView } from "@/data/portfolio-derive";
import type { RiskAnalysis } from "@/data/risk-mock";

export type Severity = "info" | "caution" | "critical";
export type AlertCategory =
  | "drift"
  | "concentration"
  | "risk"
  | "price"
  | "earnings"
  | "watchlist"
  | "rebalance";

export interface Alert {
  id: string;
  category: AlertCategory;
  severity: Severity;
  title: string;
  description: string;
  symbol?: string;
  sector?: string;
  time: string; // relative label
  ageMin: number; // minutes ago (for sorting)
  read: boolean;
  archived: boolean;
  actionLabel?: string;
  actionHref?: string;
}

function fmtAge(min: number): string {
  if (min < 60) return `${min}m ago`;
  if (min < 1440) return `${Math.round(min / 60)}h ago`;
  return `${Math.round(min / 1440)}d ago`;
}

type Seed = Omit<Alert, "id" | "time"> & { id?: string };

/** Build the alert inbox + history from the live portfolio + risk model. */
export function buildAlerts(view: PortfolioView, risk: RiskAnalysis): Alert[] {
  const { riskModel, concentration } = risk;

  const investable = view.holdings.filter((h) => h.assetClass !== "Cash");
  const topHolding = [...investable].sort((a, b) => b.weightPct - a.weightPct)[0];
  const topSym = topHolding?.symbol ?? "—";
  const topW = topHolding?.weightPct ?? 0;
  const topTarget = 11;
  const topDrift = topW - topTarget;
  const topSector = view.sectorAllocation[0];
  const sectorLabel = topSector?.label ?? "—";
  const sectorW = topSector?.weightPct ?? 0;
  const beta = riskModel.portfolioBeta;
  const betaTarget = 0.9;
  const top5 = concentration.top5Pct;
  const fixedIncomeWeight = view.holdings
    .filter((h) => h.assetClass === "Fixed Income")
    .reduce((s, h) => s + h.weightPct, 0);
  const fiTarget = 20;
  const fiUnder = fiTarget - fixedIncomeWeight;

  const SEEDS: Seed[] = [
    {
      category: "concentration",
      severity: topDrift >= 4 ? "critical" : "caution",
      title: `${topSym} exceeds target allocation by ${topDrift.toFixed(1)}%`,
      description: `Position is ${topW.toFixed(1)}% of the book vs a ${topTarget}% policy target — single-name concentration is elevated.`,
      symbol: topSym,
      ageMin: 45,
      read: false,
      archived: false,
      actionLabel: "Review holding",
      actionHref: `/security/${topSym}`,
    },
    {
      category: "rebalance",
      severity: "caution",
      title: "Rebalancing recommended — portfolio drift exceeds policy",
      description: `Aggregate drift from target weights now exceeds the 5% band. Top-5 holdings represent ${top5.toFixed(1)}% of the portfolio.`,
      ageMin: 90,
      read: false,
      archived: false,
      actionLabel: "Review rebalance",
      actionHref: "/portfolio",
    },
    {
      category: "concentration",
      severity: sectorW >= 30 ? "caution" : "info",
      title: `${sectorLabel} sector concentration at ${sectorW.toFixed(1)}%`,
      description: `Look-through ${sectorLabel.toLowerCase()} exposure ${sectorW >= 30 ? "exceeds" : "is approaching"} the 30% concentration threshold — consider diversifying sector risk.`,
      sector: sectorLabel,
      ageMin: 150,
      read: false,
      archived: false,
      actionLabel: "Open risk analytics",
      actionHref: "/risk",
    },
    {
      category: "risk",
      severity: beta > betaTarget ? "caution" : "info",
      title: `Portfolio beta ${beta.toFixed(2)} ${beta > betaTarget ? "above" : "near"} ${betaTarget.toFixed(2)} target`,
      description: `Market sensitivity is running ${beta > betaTarget ? "hot" : "in line"} relative to the policy beta ceiling. A 10% index drawdown would model a meaningful drag.`,
      ageMin: 220,
      read: false,
      archived: false,
      actionLabel: "Open risk analytics",
      actionHref: "/risk",
    },
    {
      category: "price",
      severity: "info",
      title: "AAPL reached price target of $240.00",
      description: "Apple Inc. traded through your $240 watchlist target, now at $241.18 (+1.12% today).",
      symbol: "AAPL",
      ageMin: 280,
      read: false,
      archived: false,
      actionLabel: "View security",
      actionHref: "/security/AAPL",
    },
    {
      category: "watchlist",
      severity: "caution",
      title: "TSLA fell 2.1% — largest watchlist mover",
      description: "Tesla Inc. is the steepest decliner across your watchlists today, now at $348.90.",
      symbol: "TSLA",
      ageMin: 320,
      read: true,
      archived: false,
      actionLabel: "View security",
      actionHref: "/security/TSLA",
    },
    {
      category: "earnings",
      severity: "info",
      title: "MSFT reports earnings in 3 days",
      description: "Microsoft Corp. reports after the close on the upcoming session — review exposure ahead of the print.",
      symbol: "MSFT",
      ageMin: 420,
      read: false,
      archived: false,
      actionLabel: "View security",
      actionHref: "/security/MSFT",
    },
    {
      category: "drift",
      severity: "info",
      title: `Fixed income underweight by ${fiUnder.toFixed(1)}% vs policy`,
      description: `Bond sleeve is ${fixedIncomeWeight.toFixed(1)}% vs a ${fiTarget}% target — duration exposure is light heading into the rate decision.`,
      ageMin: 1100,
      read: true,
      archived: false,
      actionLabel: "Review portfolio",
      actionHref: "/portfolio",
    },
    {
      category: "risk",
      severity: "info",
      title: `Composite risk score rose to ${riskModel.riskScore} (${riskModel.riskTier})`,
      description: `The blended risk read ticked higher this week, driven by concentration and beta. Still within the ${riskModel.riskTier} band.`,
      ageMin: 1500,
      read: true,
      archived: false,
      actionLabel: "Open risk analytics",
      actionHref: "/risk",
    },
    {
      category: "watchlist",
      severity: "info",
      title: "GOOGL crossed above its 50-day average",
      description: "Alphabet Inc. reclaimed its 50-day moving average on improving momentum.",
      symbol: "GOOGL",
      ageMin: 1900,
      read: true,
      archived: false,
      actionLabel: "View security",
      actionHref: "/security/GOOGL",
    },
    {
      category: "price",
      severity: "info",
      title: "META approaching $720 resistance",
      description: "Meta Platforms is within 1% of your noted $720 level, now at $712.50.",
      symbol: "META",
      ageMin: 2600,
      read: true,
      archived: false,
      actionLabel: "View security",
      actionHref: "/security/META",
    },
    // History / archived
    {
      category: "price",
      severity: "info",
      title: "XOM reached price target of $115.00",
      description: "Exxon Mobil traded through the $115 target earlier this week (resolved).",
      symbol: "XOM",
      ageMin: 4300,
      read: true,
      archived: true,
      actionLabel: "View security",
      actionHref: "/security/XOM",
    },
    {
      category: "risk",
      severity: "caution",
      title: "VaR breached limit during volatility spike",
      description: "1-day 95% VaR briefly exceeded the −$160k limit during last week's drawdown (resolved).",
      ageMin: 7200,
      read: true,
      archived: true,
      actionLabel: "Open risk analytics",
      actionHref: "/risk",
    },
  ];

  return SEEDS.map((s, i) => ({
    ...s,
    id: s.id ?? `alert-${i + 1}`,
    time: fmtAge(s.ageMin),
  }));
}

export const CATEGORY_LABEL: Record<AlertCategory, string> = {
  drift: "Allocation Drift",
  concentration: "Concentration",
  risk: "Risk Threshold",
  price: "Price",
  earnings: "Earnings",
  watchlist: "Watchlist",
  rebalance: "Rebalancing",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  info: "Info",
  caution: "Caution",
  critical: "Critical",
};
