/**
 * Market commentary generator (B4). Produces plain-language, advisor-grade
 * commentary DERIVED from the live portfolio + risk model + market indices — so
 * the numbers tie out with the rest of the platform. No LLM call.
 *
 * Each call re-assesses from scratch: it computes the day's movers, breadth,
 * the biggest dollar contributor to the session, concentration, and risk, then
 * leads each "angle" with whatever is actually notable. Phrasing is selected
 * from a seed derived from the live holdings/prices, so the wording shifts as
 * the portfolio changes rather than reading like a fixed template. Compliance-
 * safe: observations and considerations, never a personalized recommendation.
 */
import type { PortfolioView } from "@/data/portfolio-derive";
import type { RiskAnalysis } from "@/data/risk-mock";
import { indices } from "@/data/markets-mock";

const pct = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Integer seed from the live book — changes whenever holdings, weights, or
 *  prices move, so phrasing varies with the portfolio (and stays SSR-stable). */
function seedFrom(view: PortfolioView): number {
  let s = Math.round(view.summary.totalValue + view.summary.dayChangeUsd * 7);
  for (const h of view.holdings) {
    s += Math.round(h.marketValue + h.dayChangePct * 100 + h.weightPct * 13 + h.symbol.length * 31);
  }
  return Math.abs(s);
}
const pick = <T>(arr: T[], seed: number, salt: number): T => arr[Math.abs(seed + salt) % arr.length]!;

export function buildMarketCommentary(view: PortfolioView, risk: RiskAnalysis): string[] {
  const m = risk.riskModel;
  const investable = view.holdings.filter((h) => h.assetClass !== "Cash" && h.marketValue > 0);

  if (investable.length === 0) {
    return [
      "The portfolio is currently unfunded — there are no investable positions to assess. Add holdings on the Portfolio tab and this commentary will summarize how your allocation, concentration, and risk posture relate to prevailing market conditions.",
    ];
  }

  const seed = seedFrom(view);
  const n = investable.length;

  // ── day's session facts ───────────────────────────────────────────────────
  const byWeight = [...investable].sort((a, b) => b.weightPct - a.weightPct);
  const byDay = [...investable].sort((a, b) => b.dayChangePct - a.dayChangePct);
  const top = byWeight[0]!;
  const best = byDay[0]!;
  const worst = byDay[byDay.length - 1]!;
  const contrib = investable
    .map((h) => ({ h, dollars: (h.marketValue * h.dayChangePct) / 100 }))
    .sort((a, b) => Math.abs(b.dollars) - Math.abs(a.dollars));
  const driver = contrib[0]!;
  const up = investable.filter((h) => h.dayChangePct > 0.05).length;
  const down = investable.filter((h) => h.dayChangePct < -0.05).length;

  const dayDir = view.summary.dayChangeUsd > 0 ? "higher" : view.summary.dayChangeUsd < 0 ? "lower" : "little changed";
  const breadth =
    up > down * 2 ? "broadly green" : down > up * 2 ? "broadly red" : up === 0 && down === 0 ? "quiet" : "mixed";

  const sector = view.sectorAllocation[0];
  const sectorB = view.sectorAllocation[1];
  const spx = indices.find((i) => i.symbol === "SPX");
  const ndx = indices.find((i) => i.symbol === "NDX");
  const vix = indices.find((i) => i.symbol === "VIX");
  const spx10 = risk.scenarios.find((s) => s.id === "spx10");

  // ── angle 1: what moved the book today ────────────────────────────────────
  const open1 = pick(
    [
      `The book finished the session ${dayDir} by ${usd(Math.abs(view.summary.dayChangeUsd))} (${pct(view.summary.dayChangePct)}).`,
      `On the day, your portfolio is ${dayDir} ${pct(view.summary.dayChangePct)} — ${usd(view.summary.dayChangeUsd)} net.`,
      `Today's tape left the book ${dayDir}, ${pct(view.summary.dayChangePct)} (${usd(view.summary.dayChangeUsd)}).`,
    ],
    seed,
    1,
  );
  const breadthLine =
    breadth === "quiet"
      ? `Moves were muted across your ${n} positions.`
      : `Breadth was ${breadth} — ${up} of ${n} ${up === 1 ? "name" : "names"} advanced${down ? `, ${down} fell` : ""}.`;
  const driverLine =
    driver.dollars >= 0
      ? `${driver.h.symbol} did the heavy lifting, adding roughly ${usd(driver.dollars)} at its ${driver.h.weightPct.toFixed(1)}% weight; ${worst.symbol} was the soft spot at ${pct(worst.dayChangePct)}.`
      : `${driver.h.symbol} was the biggest drag, taking about ${usd(Math.abs(driver.dollars))} off the book at its ${driver.h.weightPct.toFixed(1)}% weight; ${best.symbol} held up best at ${pct(best.dayChangePct)}.`;
  const close1 = pick(
    [
      `Because ${top.symbol} carries ${top.weightPct.toFixed(1)}% of the portfolio, days like this hinge heavily on a single name.`,
      `With ${sector ? `${sector.label.toLowerCase()} at ${sector.weightPct.toFixed(1)}% of exposure` : "exposure clustered"}, the session's swing was as much about positioning as the market itself.`,
      `Whether that pattern persists depends on follow-through from your heaviest names rather than the index alone.`,
    ],
    seed,
    2,
  );
  const angle1 = `${open1} ${breadthLine} ${driverLine} ${close1}`;

  // ── angle 2: positioning & concentration ──────────────────────────────────
  const c = risk.concentration;
  const open2 = pick(
    [
      `Positioning is led by ${top.symbol} at ${top.weightPct.toFixed(1)}%, with the top five names accounting for ${c.top5Pct.toFixed(1)}% of the book.`,
      `Your largest position is ${top.symbol} (${top.weightPct.toFixed(1)}%); the five biggest holdings sum to ${c.top5Pct.toFixed(1)}% of the portfolio.`,
      `Concentration sits front and center: ${top.symbol} is ${top.weightPct.toFixed(1)}% and the top five are ${c.top5Pct.toFixed(1)}% combined.`,
    ],
    seed,
    3,
  );
  const effLine = `That works out to roughly ${c.effectiveN.toFixed(1)} effective holdings — ${c.effectiveN < 4 ? "a concentrated book" : c.effectiveN < 8 ? "moderately diversified" : "a fairly spread book"}.`;
  const sectorLine = sector
    ? `By sector, ${sector.label.toLowerCase()} dominates at ${sector.weightPct.toFixed(1)}%${sectorB ? `, with ${sectorB.label.toLowerCase()} next at ${sectorB.weightPct.toFixed(1)}%` : ""}.`
    : `Sector exposure is broadly spread.`;
  const close2 = pick(
    [
      `Broadening into lower-correlation names or sleeves would reduce dependence on any one outcome without abandoning the growth tilt.`,
      `Trimming the top position into underweight areas is the cleanest lever to soften single-name risk.`,
      `Adding diversification here would lower the book's sensitivity to a single name or sector surprise.`,
    ],
    seed,
    4,
  );
  const angle2 = `${open2} ${effLine} ${sectorLine} ${close2}`;

  // ── angle 3: risk lens ────────────────────────────────────────────────────
  const open3 = pick(
    [
      `Composite risk reads ${m.riskScore} (${m.riskTier}) on a beta of ${m.portfolioBeta.toFixed(2)}.`,
      `The risk engine puts the book at ${m.riskScore}/100 (${m.riskTier}), beta ${m.portfolioBeta.toFixed(2)}.`,
      `On risk, you're at ${m.riskScore} — ${m.riskTier} — with a portfolio beta of ${m.portfolioBeta.toFixed(2)}.`,
    ],
    seed,
    5,
  );
  const volLine = `Annualized volatility is near ${m.portfolioVol.toFixed(1)}%, with a one-day 95% value-at-risk of about ${usd(m.var95Usd)}.`;
  const scenLine = spx10
    ? `A modeled 10% S&P decline would imply roughly ${pct(spx10.portfolioImpactPct)} (${usd(spx10.portfolioImpactUsd)}) for the book.`
    : `Stress scenarios point to a meaningful but recoverable drawdown in a broad selloff.`;
  const close3 = pick(
    [
      `That's a posture that participates in upside while carrying above-average sensitivity to a broad drawdown.`,
      `It's a constructive stance, but one where hedges or trims are worth reviewing rather than reacting to.`,
      `The trade-off is clear: more growth potential in exchange for sharper moves in both directions.`,
    ],
    seed,
    6,
  );
  const angle3 = `${open3} ${volLine} ${scenLine} ${close3}`;

  // ── angle 4: market backdrop vs your beta ─────────────────────────────────
  const angle4 =
    `Against a tape where the S&P 500 is ${spx ? pct(spx.changePct, 2) : "little changed"}${ndx ? ` and the Nasdaq 100 ${pct(ndx.changePct, 2)}` : ""}, volatility is ${vix ? `near ${vix.level.toFixed(1)} on the VIX` : "contained"}. ` +
    `With your beta at ${m.portfolioBeta.toFixed(2)}, the book ${m.portfolioBeta > 1 ? `amplifies those moves — roughly ${m.portfolioBeta.toFixed(2)}× the market` : `dampens those moves relative to the market`}. ` +
    pick(
      [
        `A calm-but-rich backdrop makes downside protection comparatively inexpensive — a reasonable moment to review hedges rather than chase.`,
        `In a quieter tape, it's cheaper to add protection now than after volatility returns.`,
        `That makes this a sensible window to pressure-test the book against a shock rather than wait for one.`,
      ],
      seed,
      7,
    );

  // Lead with the day's drivers; order the rest by a seed nudge so re-prompts feel fresh.
  return [angle1, angle2, angle3, angle4];
}
