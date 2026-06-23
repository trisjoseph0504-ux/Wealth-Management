"use server";

/**
 * Compare "winner" analysis action. Tries Claude (Anthropic API) for a fresh,
 * grounded read on the selected securities; falls back to the deterministic
 * rules-based generator when no ANTHROPIC_API_KEY is set or the call fails.
 * `ai` flags which path produced it.
 */
import type { CompareCard } from "@/server/actions/compare";
import { buildCompareAnalysis } from "@/data/compare-analysis";
import { aiCompareAnalysis } from "@/server/ai/compare-analysis";

export interface CompareAnalysisResult {
  winner: string;
  paragraphs: string[];
  ai: boolean;
}

export async function generateCompareAnalysisAction(
  cards: CompareCard[],
): Promise<CompareAnalysisResult | null> {
  if (!cards || cards.length < 2) return null;

  const ai = await aiCompareAnalysis(cards);
  if (ai) return { winner: ai.winner, paragraphs: ai.paragraphs, ai: true };

  const rules = buildCompareAnalysis(cards);
  if (!rules) return null;
  return { winner: rules.winner, paragraphs: rules.paragraphs, ai: false };
}
