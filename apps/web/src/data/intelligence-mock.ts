/**
 * Phase 8 / Backend B4 — Advisor Intelligence Center. Synthesizes the LIVE
 * portfolio + risk model (and market data) into ranked, evidence-backed insights
 * via `buildIntelligence(view, risk)`. The structural insights (largest single
 * name, largest sector, risk posture, fixed-income gap) are derived from the
 * actual book, so they reflect whatever is held; specific catalysts (a watchlist
 * price target, a tape read) are clearly illustrative.
 *
 * Commentary is mock, in compliance-safe language: it observes and offers
 * considerations, never a personalized recommendation. Deterministic, no network.
 */
import type { PortfolioView } from "@/data/portfolio-derive";
import type { RiskAnalysis } from "@/data/risk-mock";
import { getSecurity, indices } from "@/data/markets-mock";

export type InsightCategory = "risk" | "opportunity" | "watchlist" | "rebalance" | "market";
export type Priority = "high" | "medium" | "low";

export interface Evidence {
  label: string;
  value: string;
  tone?: "pos" | "neg" | "warn" | "neutral";
  symbol?: string;
  href?: string;
}
export interface NextAction {
  label: string;
  kind: "link" | "alert" | "note";
  href?: string;
}
export interface Insight {
  id: string;
  category: InsightCategory;
  priority: Priority;
  score: number; // ranking (higher = more important)
  title: string;
  thesis: string;
  clientExplanation: string;
  evidence: Evidence[];
  actions: NextAction[];
}

export interface Briefing {
  dateLabel: string;
  summary: string;
  highlights: { label: string; value: string }[];
}

export interface IntelligenceModel {
  insights: Insight[];
  briefing: Briefing;
}

const pct = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
const usd = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Build ranked insights + the daily briefing from the live portfolio + risk. */
export function buildIntelligence(view: PortfolioView, risk: RiskAnalysis): IntelligenceModel {
  const { riskModel, concentration, scenarios } = risk;

  const investable = view.holdings.filter((h) => h.assetClass !== "Cash");
  const topHolding = [...investable].sort((a, b) => b.weightPct - a.weightPct)[0];
  const topSector = view.sectorAllocation[0];
  const beta = riskModel.portfolioBeta;
  const vol = riskModel.portfolioVol;
  const score = riskModel.riskScore;
  const tier = riskModel.riskTier;
  const top5 = concentration.top5Pct;
  const topW = topHolding?.weightPct ?? 0;
  const topSym = topHolding?.symbol ?? "—";
  const sectorLabel = topSector?.label ?? "—";
  const sectorW = topSector?.weightPct ?? 0;
  const fiW = view.holdings.filter((h) => h.assetClass === "Fixed Income").reduce((s, h) => s + h.weightPct, 0);
  const staplesW = view.sectorAllocation.find((s) => s.label === "Consumer Staples")?.weightPct ?? 0;
  const spx10 = scenarios.find((s) => s.id === "spx10");
  const recession = scenarios.find((s) => s.id === "recession");
  const spxIdx = indices.find((i) => i.symbol === "SPX");
  const vixIdx = indices.find((i) => i.symbol === "VIX");
  const aapl = getSecurity("AAPL");
  const aaplHeld = view.holdings.find((h) => h.symbol === "AAPL");

  const insights: Insight[] = [
    {
      id: "concentration-top",
      category: "risk",
      priority: topW >= 11 ? "high" : "medium",
      score: 96,
      title: `Single-name concentration in ${topSym} is elevated`,
      thesis:
        `${topSym} now represents ${topW.toFixed(1)}% of the portfolio — ${topW >= 11 ? "above" : "near"} a typical 5–11% single-name guardrail. The position has compounded with recent strength, so portfolio outcomes are increasingly tied to one name's idiosyncratic risk.`,
      clientExplanation:
        `One holding (${topHolding?.name ?? topSym}) has grown into a large share of the portfolio. That means results are unusually tied to a single company. We're flagging it so we can decide together whether to rebalance — nothing needs to change today.`,
      evidence: [
        { label: `${topSym} weight`, value: `${topW.toFixed(1)}%`, tone: "warn", symbol: topSym, href: `/security/${topSym}` },
        { label: "Top-5 concentration", value: `${top5.toFixed(1)}%`, tone: "warn", href: "/risk" },
        { label: "Largest sector", value: `${sectorLabel} ${sectorW.toFixed(0)}%`, tone: "neutral", href: "/risk" },
      ],
      actions: [
        { label: `Review ${topSym} position`, kind: "link", href: `/security/${topSym}` },
        { label: "Set a drift alert", kind: "alert" },
        { label: "Model a trim toward target weight", kind: "note" },
      ],
    },
    {
      id: "sector-top",
      category: "risk",
      priority: sectorW >= 30 ? "high" : "medium",
      score: 90,
      title: `${sectorLabel} exposure ${sectorW >= 30 ? "exceeds" : "approaches"} the concentration threshold`,
      thesis:
        `Look-through ${sectorLabel.toLowerCase()} weight is ${sectorW.toFixed(1)}%, ${sectorW >= 30 ? "above" : "near"} the 30% policy threshold. The largest names in a single sector are often highly correlated, so the sleeve provides less diversification than its position count suggests — a single-factor drawdown would propagate across the group.`,
      clientExplanation:
        `A large part of the portfolio is in ${sectorLabel.toLowerCase()}, and those companies tend to move together. That can amplify both gains and losses. Broadening exposure across other areas could make the portfolio steadier without giving up its long-term goals.`,
      evidence: [
        { label: `${sectorLabel} weight`, value: `${sectorW.toFixed(1)}%`, tone: "warn", href: "/risk" },
        { label: "Pairwise correlation", value: "0.80", tone: "warn", href: "/risk" },
      ],
      actions: [
        { label: "Open correlation analysis", kind: "link", href: "/risk" },
        { label: "Screen quality diversifiers", kind: "link", href: "/screener" },
        { label: "Monitor sector drift", kind: "alert" },
      ],
    },
    {
      id: "risk-posture",
      category: "risk",
      priority: "high",
      score: 84,
      title: `Portfolio is positioned for a ${tier === "Conservative" || tier === "Balanced" ? "measured" : "risk-on"} regime`,
      thesis:
        `Beta is ${beta.toFixed(2)}, annualized volatility ${vol.toFixed(1)}%, and the composite risk score is ${score} (${tier}). A modeled 10% S&P drawdown implies roughly ${pct(spx10?.portfolioImpactPct ?? 0)} (${usd(spx10?.portfolioImpactUsd ?? 0)}). With volatility subdued, downside hedges are comparatively inexpensive.`,
      clientExplanation:
        "The portfolio's current tilt has helped in a rising market but adds sensitivity if markets fall. Because market 'insurance' is relatively cheap right now, it may be a good time to discuss protecting some of the gains.",
      evidence: [
        { label: "Portfolio beta", value: beta.toFixed(2), tone: "warn", href: "/risk" },
        { label: "Volatility", value: `${vol.toFixed(1)}%`, tone: "neutral", href: "/risk" },
        { label: "−10% S&P scenario", value: pct(spx10?.portfolioImpactPct ?? 0), tone: "neg", href: "/risk" },
        { label: "VIX", value: vixIdx ? vixIdx.level.toFixed(2) : "—", tone: "pos", href: "/markets" },
      ],
      actions: [
        { label: "Open scenario analysis", kind: "link", href: "/risk" },
        { label: "Review hedging options", kind: "note" },
      ],
    },
    {
      id: "rebalance-fi",
      category: "rebalance",
      priority: "medium",
      score: 72,
      title: "Fixed income is light into the rate decision",
      thesis:
        `The bond sleeve is ${fiW.toFixed(1)}% versus a 20% policy target — an underweight of ${(20 - fiW).toFixed(1)}%. Adding high-quality duration could improve the portfolio's defensive profile and lower its correlation to equities ahead of the next rate decision.`,
      clientExplanation:
        "The portfolio holds fewer bonds than its long-term plan calls for. Bonds can act as a stabilizer when stocks are volatile, so topping up this allocation could make the overall portfolio more resilient.",
      evidence: [
        { label: "Fixed income weight", value: `${fiW.toFixed(1)}%`, tone: "warn", href: "/portfolio" },
        { label: "Policy target", value: "20.0%", tone: "neutral", href: "/portfolio" },
      ],
      actions: [
        { label: "Open rebalancing view", kind: "link", href: "/portfolio" },
        { label: "Model adding duration", kind: "note" },
      ],
    },
    {
      id: "opportunity-defensives",
      category: "opportunity",
      priority: "medium",
      score: 66,
      title: "Defensive sectors are underrepresented",
      thesis:
        `The portfolio holds ${staplesW <= 0 ? "no" : `${staplesW.toFixed(1)}%`} consumer-staples exposure. In a risk-off scenario — a modeled recession shock implies ${pct(recession?.portfolioImpactPct ?? 0)} — defensives have historically cushioned drawdowns. The screener surfaces several large, dividend-paying candidates for research.`,
      clientExplanation:
        "The portfolio has little exposure to 'defensive' companies — think household staples and utilities — that tend to hold up better in downturns. Adding some could smooth the ride. We'd research specific names together before any decision.",
      evidence: [
        { label: "Consumer staples", value: staplesW <= 0 ? "0.0%" : `${staplesW.toFixed(1)}%`, tone: "warn", href: "/portfolio" },
        { label: "Recession scenario", value: pct(recession?.portfolioImpactPct ?? 0), tone: "neg", href: "/risk" },
        { label: "Screener: dividend defensives", value: "candidates", tone: "neutral", href: "/screener" },
      ],
      actions: [
        { label: "Open dividend-defensive screen", kind: "link", href: "/screener" },
        { label: "Build a research watchlist", kind: "link", href: "/watchlists" },
      ],
    },
    {
      id: "watchlist-aapl",
      category: "watchlist",
      priority: "medium",
      score: 58,
      title: "AAPL reached its watchlist price target",
      thesis:
        `Apple traded through the $240 level noted on the watchlist and is now ${aapl ? `$${aapl.price.toFixed(2)}` : "—"}. ${aaplHeld ? "As an existing holding, this is a checkpoint to revisit the thesis and position sizing rather than a fresh entry signal." : "It is on the watchlist rather than in the portfolio — a prompt to revisit the thesis before any entry."}`,
      clientExplanation:
        "Apple hit a price level on the watchlist. This is simply a good moment to review whether it fits the plan — not a prompt to act.",
      evidence: [
        { label: "AAPL price", value: aapl ? `$${aapl.price.toFixed(2)}` : "—", tone: "pos", symbol: "AAPL", href: "/security/AAPL" },
        { label: "Watchlist target", value: "$240.00", tone: "neutral", href: "/watchlists" },
        { label: "Status", value: aaplHeld ? `Held ${aaplHeld.weightPct.toFixed(1)}%` : "Watchlist", tone: "neutral", href: "/portfolio" },
      ],
      actions: [
        { label: "Review AAPL", kind: "link", href: "/security/AAPL" },
        { label: "Set a new price alert", kind: "alert" },
      ],
    },
    {
      id: "market-context",
      category: "market",
      priority: "low",
      score: 42,
      title: "Tape is constructive; volatility remains subdued",
      thesis:
        `Major indices are higher — the S&P 500 is ${pct(spxIdx?.changePct ?? 0, 2)} with VIX near ${vixIdx ? vixIdx.level.toFixed(1) : "—"}. Breadth is reasonable and the backdrop favors measured positioning over reactive changes.`,
      clientExplanation:
        "Markets are calm and broadly higher today. There's nothing here that calls for action — it's context to keep in mind as we weigh the items above.",
      evidence: [
        { label: "S&P 500", value: pct(spxIdx?.changePct ?? 0, 2), tone: "pos", href: "/markets" },
        { label: "VIX", value: vixIdx ? vixIdx.level.toFixed(2) : "—", tone: "pos", href: "/markets" },
      ],
      actions: [{ label: "Open markets", kind: "link", href: "/markets" }],
    },
  ];

  // Only surface portfolio insights when there's actually a portfolio — otherwise
  // the page shows concentration/risk "filler" about an empty book. The
  // market-context read is portfolio-independent and always stays.
  const funded = investable.length > 0;
  const PORTFOLIO_IDS = new Set([
    "concentration-top",
    "sector-top",
    "risk-posture",
    "rebalance-fi",
    "opportunity-defensives",
    "watchlist-aapl",
  ]);
  const finalInsights = funded ? insights : insights.filter((i) => !PORTFOLIO_IDS.has(i.id));
  const highCount = finalInsights.filter((i) => i.priority === "high").length;
  const oppCount = finalInsights.filter((i) => i.category === "opportunity").length;

  const briefing: Briefing = funded
    ? {
        dateLabel: view.summary.asOf,
        summary:
          `Today's review surfaces ${finalInsights.length} items for consideration, ${highCount} of them high priority. The dominant theme is concentration: ${topSym} and the ${sectorLabel.toLowerCase()} sleeve carry single-name and sector exposure near or above policy thresholds. Risk posture is ${tier.toLowerCase()} (score ${score}) into a subdued-volatility tape, which keeps potential hedges comparatively inexpensive. Fixed income remains ${fiW < 20 ? "light" : "in line"} heading into the rate decision.`,
        highlights: [
          { label: "High-priority items", value: String(highCount) },
          { label: "Composite risk", value: `${score} · ${tier}` },
          { label: "−10% S&P impact", value: pct(spx10?.portfolioImpactPct ?? 0) },
          { label: "Opportunities", value: String(oppCount) },
        ],
      }
    : {
        dateLabel: view.summary.asOf,
        summary:
          `No funded positions yet — once you add holdings, this briefing summarizes single-name and sector concentration, risk posture, and rebalancing priorities for your book. For now the market backdrop is the main read: the S&P 500 is ${pct(spxIdx?.changePct ?? 0, 2)} with the VIX near ${vixIdx ? vixIdx.level.toFixed(1) : "—"}. See Market News & Impact above for the headlines that matter.`,
        highlights: [
          { label: "Funded positions", value: "0" },
          { label: "S&P 500", value: pct(spxIdx?.changePct ?? 0, 2) },
          { label: "VIX", value: vixIdx ? vixIdx.level.toFixed(2) : "—" },
          { label: "Watchlists", value: "active" },
        ],
      };

  return { insights: finalInsights, briefing };
}

export const CATEGORY_LABEL: Record<InsightCategory, string> = {
  risk: "Risk",
  opportunity: "Opportunity",
  watchlist: "Watchlist",
  rebalance: "Rebalancing",
  market: "Market",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High priority",
  medium: "Medium",
  low: "Low",
};
