/**
 * Market commentary generator (B4). Produces plain-language, advisor-grade
 * commentary DERIVED from the live portfolio + risk model + market indices — so
 * the numbers tie out with the rest of the platform. Templated and compliance-
 * safe (observations and considerations, never a personalized recommendation);
 * no LLM call. Returns several "angles" so the UI can regenerate a fresh take.
 */
import type { PortfolioView } from "@/data/portfolio-derive";
import type { RiskAnalysis } from "@/data/risk-mock";
import { indices } from "@/data/markets-mock";

const pct = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function buildMarketCommentary(view: PortfolioView, risk: RiskAnalysis): string[] {
  const m = risk.riskModel;
  const investable = view.holdings.filter((h) => h.assetClass !== "Cash");

  if (investable.length === 0) {
    return [
      "The portfolio is currently unfunded — there are no investable positions to assess. Add holdings on the Portfolio tab and this commentary will summarize how your allocation, concentration, and risk posture relate to prevailing market conditions.",
    ];
  }

  const top = [...investable].sort((a, b) => b.weightPct - a.weightPct)[0]!;
  const sector = view.sectorAllocation[0];
  const spx = indices.find((i) => i.symbol === "SPX");
  const vix = indices.find((i) => i.symbol === "VIX");
  const ndx = indices.find((i) => i.symbol === "NDX");
  const spx10 = risk.scenarios.find((s) => s.id === "spx10");
  const dayDir = view.summary.dayChangeUsd >= 0 ? "higher" : "lower";

  const positioning =
    `The book is valued at ${usd(view.summary.totalValue)} and finished the session ${dayDir} by ${usd(Math.abs(view.summary.dayChangeUsd))} (${pct(view.summary.dayChangePct)}). ` +
    `${top.symbol} remains the largest single position at ${top.weightPct.toFixed(1)}% of the portfolio, and ${sector ? `${sector.label.toLowerCase()} is the heaviest sector at ${sector.weightPct.toFixed(1)}%` : "sector exposure is broadly spread"}. ` +
    `Composite risk reads ${m.riskScore} (${m.riskTier}) on a beta of ${m.portfolioBeta.toFixed(2)} — a posture that participates in upside while carrying above-average sensitivity to a broad drawdown.`;

  const backdrop =
    `Against a tape where the S&P 500 is ${spx ? pct(spx.changePct, 2) : "little changed"}${ndx ? ` and the Nasdaq 100 ${pct(ndx.changePct, 2)}` : ""}, volatility is ${vix ? `subdued near ${vix.level.toFixed(1)} on the VIX` : "contained"}. ` +
    `With the portfolio's beta at ${m.portfolioBeta.toFixed(2)}, a calm-but-rich backdrop means downside protection is comparatively inexpensive here — a reasonable moment to review hedges rather than react. ` +
    `A modeled 10% S&P decline would imply roughly ${spx10 ? `${pct(spx10.portfolioImpactPct)} (${usd(spx10.portfolioImpactUsd)})` : "a meaningful drawdown"} for the book.`;

  const riskLens =
    `Annualized volatility is running near ${m.portfolioVol.toFixed(1)}% with a one-day 95% value-at-risk of ${usd(m.var95Usd)}. ` +
    `Concentration is the dominant theme: the top five holdings represent ${risk.concentration.top5Pct.toFixed(1)}% of the portfolio, so outcomes are increasingly tied to a handful of names. ` +
    `Trimming the largest position or broadening into lower-correlation sleeves would lower the portfolio's dependence on any single outcome without abandoning its growth tilt.`;

  return [positioning, backdrop, riskLens];
}
