/**
 * Compare "winner" analysis (rules-based). Scores the selected securities across
 * return/value/income/scale metrics, picks the strongest all-rounder, and writes
 * a high-level paragraph on why it leads and the scenarios each name thrives in —
 * folding in each security's bull/bear case. Deterministic, no LLM. Recomputes
 * from whatever set is passed, so it stays in sync as securities are added/removed.
 */
import type { CompareCard } from "@/server/actions/compare";

type ProfileTag = "growth" | "income" | "value" | "stability" | "momentum";

interface Scored {
  key: keyof CompareCard;
  dir: "max" | "min";
  label: string;
  tag: ProfileTag;
}

const SCORED: Scored[] = [
  { key: "perf1Y", dir: "max", label: "1-year return", tag: "growth" },
  { key: "perfYTD", dir: "max", label: "YTD return", tag: "growth" },
  { key: "perf1M", dir: "max", label: "recent momentum", tag: "momentum" },
  { key: "dividendYieldPct", dir: "max", label: "dividend yield", tag: "income" },
  { key: "peRatio", dir: "min", label: "valuation", tag: "value" },
  { key: "marketCapB", dir: "max", label: "scale", tag: "stability" },
];

const SCENARIO: Record<ProfileTag, string> = {
  growth: "growth-led, risk-on markets where investors pay up for expansion",
  momentum: "momentum-driven tapes that reward recent strength",
  income: "income-focused or higher-for-longer rate environments where yield matters",
  value: "a value rotation, when investors favor cheaper multiples over rich ones",
  stability: "uncertain, defensive conditions and flight-to-quality",
};

export interface CompareInsight {
  winner: string;
  paragraphs: string[];
}

const unique = (a: string[]) => [...new Set(a)];
const stripPeriod = (s: string) => s.replace(/\s*\.\s*$/, "");
const lowerFirst = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
function formatList(a: string[]): string {
  if (a.length <= 1) return a[0] ?? "";
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")}, and ${a[a.length - 1]}`;
}

export function buildCompareAnalysis(cards: CompareCard[]): CompareInsight | null {
  if (cards.length < 2) return null;

  const wins: Record<string, { count: number; labels: string[]; tags: ProfileTag[] }> = {};
  for (const c of cards) wins[c.symbol] = { count: 0, labels: [], tags: [] };

  for (const m of SCORED) {
    const entries = cards
      .map((c) => ({ sym: c.symbol, v: c[m.key] as number }))
      .filter((e) => Number.isFinite(e.v) && (m.dir === "max" || e.v > 0));
    if (entries.length === 0) continue;
    const target = m.dir === "max" ? Math.max(...entries.map((e) => e.v)) : Math.min(...entries.map((e) => e.v));
    for (const e of entries) {
      if (e.v === target) {
        const w = wins[e.sym]!;
        w.count++;
        w.labels.push(m.label);
        w.tags.push(m.tag);
      }
    }
  }

  const ranked = [...cards].sort(
    (a, b) => wins[b.symbol]!.count - wins[a.symbol]!.count || b.perf1Y - a.perf1Y,
  );
  const winner = ranked[0]!;

  const dominantTag = (c: CompareCard): ProfileTag => {
    const tags = wins[c.symbol]!.tags;
    if (tags.length) {
      const counts: Record<string, number> = {};
      for (const t of tags) counts[t] = (counts[t] ?? 0) + 1;
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]![0] as ProfileTag;
    }
    if (c.dividendYieldPct >= 2.5) return "income";
    if (c.beta >= 1.15) return "growth";
    if (c.beta <= 0.85) return "stability";
    return "value";
  };

  const list = formatList(cards.map((c) => c.symbol));
  const wl = wins[winner.symbol]!.labels;

  const p1 =
    `Across ${list}, **${winner.symbol}** (${winner.name}) screens as the strongest all-rounder` +
    (wl.length ? `, leading on ${formatList(unique(wl))}. ` : ". ") +
    `It would thrive in ${SCENARIO[dominantTag(winner)]}.`;

  const others = ranked.slice(1).map((c) => {
    const edge = wins[c.symbol]!.labels[0];
    return `**${c.symbol}** is the better fit for ${SCENARIO[dominantTag(c)]}${edge ? ` — its edge here is ${edge}` : ""}.`;
  });
  const p2 = others.length ? `By contrast, ${others.join(" ")}` : "";

  const p3 =
    (winner.bull ? `Bull case for ${winner.symbol}: ${stripPeriod(winner.bull)}. ` : "") +
    (winner.bear ? `The main watch-out: ${lowerFirst(stripPeriod(winner.bear))}.` : "");

  return { winner: winner.symbol, paragraphs: [p1, p2, p3].filter(Boolean) };
}
