/**
 * Market News & Impact — real headlines (Finnhub) paired with a written
 * explanation of how each one tends to affect the market and which sectors move,
 * with watchlist names flagged. Server-rendered; informational only.
 */
import type { AnalyzedNews, Stance } from "@/data/news-analysis";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { IconGlobe, IconChevronRight, IconStar } from "@/components/ui/icons";

const STANCE: Record<Stance, { dot: string; label: string }> = {
  "risk-on": { dot: "bg-emerald", label: "Risk-on" },
  "risk-off": { dot: "bg-neg", label: "Risk-off" },
  mixed: { dot: "bg-info", label: "Mixed" },
  neutral: { dot: "bg-fg-subtle", label: "Neutral" },
};

export function NewsImpactFeed({ items }: { items: AnalyzedNews[] }) {
  const watchCount = items.filter((i) => i.watchlistSymbols.length > 0).length;
  // Prioritize substantive stories: a real macro/sector topic (+2) and/or a
  // watchlist name (+1) rank above generic "Broad Market" filler. Sort is stable,
  // so recency order is preserved within each tier (items arrive newest-first).
  const score = (n: AnalyzedNews) => (n.topic.id !== "market" ? 2 : 0) + (n.watchlistSymbols.length > 0 ? 1 : 0);
  const ordered = [...items].sort((a, b) => score(b) - score(a));
  const substantive = ordered.filter((n) => n.topic.id !== "market" || n.watchlistSymbols.length > 0);
  const pool = substantive.length >= 8 ? substantive : ordered;
  // Cap watchlist company news (Finnhub free-tier aggregates it from a single
  // source) so it doesn't crowd out macro news that carries real, varied
  // publishers — the feed stays a mix of named sources, not all one outlet.
  const shown: AnalyzedNews[] = [];
  let companyCount = 0;
  for (const n of pool) {
    if (n.watchlistSymbols.length > 0) {
      if (companyCount >= 5) continue;
      companyCount++;
    }
    shown.push(n);
    if (shown.length >= 16) break;
  }

  return (
    <Card>
      <CardHeader
        title="Market News & Impact"
        subtitle="Live headlines with sector impact · informational only"
        icon={<IconGlobe size={16} />}
        action={
          watchCount > 0 ? (
            <Badge tone="emerald">
              <IconStar size={11} /> {watchCount} on watchlist
            </Badge>
          ) : (
            <Badge tone="neutral">{shown.length} stories</Badge>
          )
        }
      />

      {shown.length === 0 ? (
        <EmptyState
          icon={<IconGlobe size={18} />}
          title="News feed is momentarily unavailable"
          description="Live market news loads here with an explanation of how each story affects the market and your watchlist. Check back shortly."
        />
      ) : (
        <ul className="divide-y divide-hairline">
          {shown.map((n) => {
            const s = STANCE[n.topic.stance];
            return (
              <li key={n.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-inset px-2 py-0.5 text-[10px] font-medium text-fg-muted">
                    <span className={`size-1.5 rounded-full ${s.dot}`} />
                    {n.topic.label}
                  </span>
                  {n.watchlistSymbols.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald/30 bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-bright"
                    >
                      <IconStar size={10} /> {sym}
                    </span>
                  ))}
                  <span className="ml-auto shrink-0 text-[11px] text-fg-subtle">
                    {n.source}
                    {n.ageLabel ? ` · ${n.ageLabel}` : ""}
                  </span>
                </div>

                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-2 flex items-start gap-1.5 text-[14px] font-semibold leading-snug tracking-tight text-fg transition hover:text-emerald-bright"
                >
                  <span>{n.headline}</span>
                  <IconChevronRight size={14} className="mt-0.5 shrink-0 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </a>

                <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-muted">
                  <span className="font-medium text-fg-subtle">Why it matters — </span>
                  {n.topic.why}
                </p>

                {n.topic.sectors.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-fg-subtle">Sectors in focus</span>
                    {n.topic.sectors.map((sec) => (
                      <span key={sec} className="rounded-[4px] border border-hairline bg-inset px-1.5 py-0.5 text-[10px] text-fg-muted">
                        {sec}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="border-t border-hairline px-5 py-3 text-[10px] leading-relaxed text-fg-subtle">
        <span className="font-medium text-fg-muted">Note.</span> Headlines are sourced live; the impact commentary is a
        general, rules-based explanation of typical market relationships — informational only, not personalized investment
        advice or a recommendation to buy or sell any security.
      </p>
    </Card>
  );
}
