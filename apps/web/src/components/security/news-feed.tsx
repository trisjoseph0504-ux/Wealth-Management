/** News & Catalysts — live company headlines (Finnhub) for this security, each
 *  linking out to the source, with the impact topic as a tag. */
import type { AnalyzedNews } from "@/data/news-analysis";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { IconBell, IconChevronRight } from "@/components/ui/icons";

export function NewsFeed({ symbol, news }: { symbol: string; news: AnalyzedNews[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="News & Catalysts"
        subtitle={news.length > 0 ? `Live headlines for ${symbol}` : "Live headlines"}
        icon={<IconBell size={16} />}
        action={<Badge tone="emerald">Live</Badge>}
      />
      {news.length === 0 ? (
        <EmptyState
          icon={<IconBell size={18} />}
          title="No recent headlines"
          description={`No company news for ${symbol} in the last two weeks. New stories appear here as they're published.`}
        />
      ) : (
        <ul className="flex-1 divide-y divide-hairline/60">
          {news.map((n) => (
            <li key={n.id}>
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group reduce-motion-safe flex flex-col gap-1.5 px-5 py-3.5 transition hover:bg-surface-2/40"
              >
                <div className="flex items-center gap-2 text-[11px] text-fg-subtle">
                  <span className="font-medium text-fg-muted">{n.source}</span>
                  {n.ageLabel && (
                    <>
                      <span>·</span>
                      <span>{n.ageLabel}</span>
                    </>
                  )}
                  <Badge tone="neutral" className="ml-auto">{n.topic.label}</Badge>
                </div>
                <p className="flex items-start gap-1 text-[13px] leading-snug text-fg transition group-hover:text-emerald-bright">
                  <span>{n.headline}</span>
                  <IconChevronRight size={13} className="mt-0.5 shrink-0 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-hairline px-5 py-3 text-[10px] text-fg-subtle">
        Live company news via Finnhub. Headlines link to their source; the topic tag is a rules-based impact label.
      </p>
    </Card>
  );
}
