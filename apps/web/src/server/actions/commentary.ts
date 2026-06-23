"use server";

/**
 * Market commentary action. Each call re-pulls the live portfolio + risk, then
 * asks Claude for a fresh, grounded commentary. If no ANTHROPIC_API_KEY is set
 * (or the call fails) it falls back to the deterministic rules-based generator,
 * so the dashboard always returns something. `ai` flags which path produced it.
 */
import { listHoldingsAction } from "@/server/actions/holdings";
import { fetchHoldingQuotes } from "@/server/market/holding-quotes";
import { buildPortfolio } from "@/data/portfolio-derive";
import { buildRiskAnalysis } from "@/data/risk-mock";
import { buildMarketCommentary } from "@/data/commentary";
import { aiMarketCommentary } from "@/server/ai/market-commentary";

export interface CommentaryResult {
  text: string;
  ai: boolean; // true = generated live by Claude; false = rules-based fallback
}

export async function generateCommentaryAction(angle: number): Promise<CommentaryResult> {
  const raw = await listHoldingsAction();
  const quotes = await fetchHoldingQuotes(raw.map((h) => h.symbol));
  const view = buildPortfolio(raw, quotes);
  const risk = buildRiskAnalysis(view);

  const ai = await aiMarketCommentary(view, risk, angle);
  if (ai) return { text: ai, ai: true };

  const variants = buildMarketCommentary(view, risk);
  const i = ((angle % variants.length) + variants.length) % variants.length;
  return { text: variants[i] ?? variants[0] ?? "", ai: false };
}
