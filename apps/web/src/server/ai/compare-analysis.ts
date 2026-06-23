/**
 * Real Claude-powered "winner" analysis for the Compare page. Sends the selected
 * securities' metrics + bull/bear cases to the Anthropic API and returns a
 * grounded, plain-language comparison. Server-only (the API key never leaves the
 * server). Returns null when no ANTHROPIC_API_KEY is set or the call fails, so
 * callers fall back to the rules-based generator.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { CompareCard } from "@/server/actions/compare";

const SYSTEM = `You are an equity analyst writing a brief, plain-language comparison for an investor weighing a few stocks.

Format your reply EXACTLY like this:
- First line: "WINNER: <TICKER>" — the single strongest all-rounder among the options.
- Then a blank line.
- Then 2–3 short paragraphs (no markdown, no bullets, no headings).

Content rules:
- Explain why the winner leads, the market scenarios where each name would thrive, and fold in each name's bull/bear case where provided.
- Ground every claim in the figures provided and reference tickers. Do NOT invent numbers, prices, or external news.
- Informational only: observations and considerations, never a recommendation to buy or sell any security.`;

export interface CompareInsightAI {
  winner: string;
  paragraphs: string[];
}

export async function aiCompareAnalysis(cards: CompareCard[]): Promise<CompareInsightAI | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || cards.length < 2) return null;

  try {
    const client = new Anthropic({ apiKey });
    const data = cards.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      perfYTDpct: Number(c.perfYTD.toFixed(1)),
      perf1Ypct: Number(c.perf1Y.toFixed(1)),
      perf1Mpct: Number(c.perf1M.toFixed(1)),
      peRatio: Number(c.peRatio.toFixed(1)),
      dividendYieldPct: Number(c.dividendYieldPct.toFixed(2)),
      marketCapB: Math.round(c.marketCapB),
      beta: Number(c.beta.toFixed(2)),
      bull: c.bull,
      bear: c.bear,
    }));

    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
      max_tokens: 900,
      system: SYSTEM,
      messages: [
        { role: "user", content: `Compare these securities and pick the strongest all-rounder:\n${JSON.stringify(data, null, 2)}` },
      ],
    });

    const block = response.content.find((b) => b.type === "text");
    const raw = block && block.type === "text" ? block.text.trim() : "";
    if (!raw) return null;

    const match = raw.match(/^WINNER:\s*([A-Za-z0-9.\-]+)/i);
    const claimed = match ? match[1]!.toUpperCase() : "";
    const valid = cards.find((c) => c.symbol.toUpperCase() === claimed);

    const body = raw.replace(/^WINNER:\s*[A-Za-z0-9.\-]+\s*/i, "").trim();
    const paragraphs = body
      .split(/\n{2,}/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    if (paragraphs.length === 0) return null;

    return { winner: (valid ?? cards[0]!).symbol, paragraphs };
  } catch {
    return null;
  }
}
