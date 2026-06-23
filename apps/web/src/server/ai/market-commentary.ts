/**
 * Real Claude-powered market commentary. Sends the LIVE portfolio + risk figures
 * to the Anthropic API and returns a genuine, plain-language commentary grounded
 * in those numbers. Server-only (the API key never leaves the server).
 *
 * Returns null when no ANTHROPIC_API_KEY is configured or the call fails — callers
 * fall back to the rules-based generator, so the app still works without a key.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { PortfolioView } from "@/data/portfolio-derive";
import type { RiskAnalysis } from "@/data/risk-mock";

const ANGLES = [
  "Lead with today's session: which holdings drove the move, and why the day landed where it did.",
  "Focus on positioning and concentration: the largest holdings, how much rides on them, and the sector tilt.",
  "Focus on the risk posture: beta, volatility, value-at-risk, and what a broad drawdown would mean for this book.",
  "Focus on diversification and what to keep an eye on next, given the current mix.",
];

const SYSTEM = `You are a markets analyst writing a brief, plain-language portfolio commentary for the portfolio's owner.

Rules:
- One paragraph, 4–6 sentences. No markdown, no headings, no bullet points — just the paragraph.
- Ground every claim in the figures provided. Reference specific holdings by ticker.
- Only discuss the portfolio data you are given. Do NOT assert specific market-index levels, external prices, or news you were not provided, and never invent numbers.
- This is informational commentary only: make observations and considerations, never a recommendation to buy or sell any security.
- Be concrete and readable; lead with what matters most.`;

function buildContext(view: PortfolioView, risk: RiskAnalysis) {
  const m = risk.riskModel;
  const c = risk.concentration;
  const investable = view.holdings.filter((h) => h.assetClass !== "Cash" && h.marketValue > 0);
  const holdings = [...investable]
    .sort((a, b) => b.weightPct - a.weightPct)
    .map((h) => ({
      symbol: h.symbol,
      name: h.name,
      weightPct: Number(h.weightPct.toFixed(1)),
      dayChangePct: Number(h.dayChangePct.toFixed(2)),
      dayChangeUsd: Math.round((h.marketValue * h.dayChangePct) / 100),
      totalGainPct: Number(h.gainPct.toFixed(1)),
    }));

  return {
    asOf: view.summary.asOf,
    totalValueUsd: Math.round(view.summary.totalValue),
    dayChangeUsd: Math.round(view.summary.dayChangeUsd),
    dayChangePct: Number(view.summary.dayChangePct.toFixed(2)),
    holdings,
    sectorTilt: view.sectorAllocation
      .slice(0, 3)
      .map((s) => ({ sector: s.label, weightPct: Number(s.weightPct.toFixed(1)) })),
    risk: {
      compositeScore: m.riskScore,
      tier: m.riskTier,
      beta: Number(m.portfolioBeta.toFixed(2)),
      annualVolatilityPct: Number(m.portfolioVol.toFixed(1)),
      oneDayVar95Usd: Math.round(m.var95Usd),
      topHoldingPct: Number(c.top1Pct.toFixed(1)),
      topFivePct: Number(c.top5Pct.toFixed(1)),
      effectiveHoldings: Number(c.effectiveN.toFixed(1)),
    },
  };
}

export async function aiMarketCommentary(
  view: PortfolioView,
  risk: RiskAnalysis,
  angle: number,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });
    const steer = ANGLES[((angle % ANGLES.length) + ANGLES.length) % ANGLES.length]!;
    const context = buildContext(view, risk);

    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
      max_tokens: 700,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Write the commentary. ${steer}\n\nPortfolio data (JSON):\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    });

    const block = response.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text.trim() : null;
  } catch {
    // Network error, bad key, rate limit, refusal, etc. → let caller fall back.
    return null;
  }
}
