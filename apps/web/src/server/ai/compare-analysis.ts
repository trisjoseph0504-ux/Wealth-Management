/**
 * Real Claude-powered "winner" analysis for the Compare page. Sends the selected
 * securities' metrics + bull/bear cases to the Anthropic API and returns a
 * grounded, plain-language comparison. Server-only (the API key never leaves the
 * server). Returns null only when no ANTHROPIC_API_KEY is set or the call fails,
 * so callers fall back to the rules-based generator.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { CompareCard } from "@/server/actions/compare";

const SYSTEM = `You are an equity analyst writing a brief, plain-language comparison for an investor weighing a few stocks.

- Write 2–3 short paragraphs. No markdown, no bullet points, no headings.
- In your very first sentence, name the single strongest all-rounder by its ticker (e.g. "AAPL screens as the strongest all-rounder...").
- Explain why it leads, the market scenarios where each name would thrive, and fold in each name's bull/bear case where provided.
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

    // Winner: an explicit "winner/strongest TICKER" cue if present, else the first
    // ticker mentioned near the top, else the first card. Never fail on this.
    const cue = raw.match(/(?:winner|strongest)[^A-Za-z0-9]{0,12}([A-Za-z][A-Za-z0-9.\-]{0,5})/i);
    let winner = cue && cards.find((c) => c.symbol.toUpperCase() === cue[1]!.toUpperCase())?.symbol;
    if (!winner) {
      const lead = raw.slice(0, 200).toUpperCase();
      winner = cards.find((c) => lead.includes(c.symbol.toUpperCase()))?.symbol;
    }
    if (!winner) winner = cards[0]!.symbol;

    // Drop a leading "WINNER:"/"Strongest:" label line if the model emitted one.
    let body = raw.replace(/^\s*\**\s*(?:winner|strongest)\s*\**\s*[:\-—]\s*[A-Za-z0-9.\-]+\s*\n+/i, "").trim();
    if (!body) body = raw;
    const paragraphs = body
      .split(/\n{2,}/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    return { winner, paragraphs: paragraphs.length ? paragraphs : [body] };
  } catch {
    return null;
  }
}
