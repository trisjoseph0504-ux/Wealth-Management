/** News & catalysts — Phase 4 placeholder feed (mock headlines, clearly labeled). */
import type { SecurityDetail } from "@/data/security-detail-mock";
import { Card, CardHeader, CardLink } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { IconBell } from "@/components/ui/icons";

export function NewsFeed({ d }: { d: SecurityDetail }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="News & Catalysts"
        subtitle="Headlines · placeholder"
        icon={<IconBell size={16} />}
        action={<CardLink label="All news" />}
      />
      <ul className="flex-1 divide-y divide-hairline/60">
        {d.news.map((n, i) => (
          <li key={i} className="reduce-motion-safe flex flex-col gap-1.5 px-5 py-3.5 transition hover:bg-surface-2/40">
            <div className="flex items-center gap-2 text-[11px] text-fg-subtle">
              <span className="font-medium text-fg-muted">{n.source}</span>
              <span>·</span>
              <span>{n.time}</span>
              <Badge tone="neutral" className="ml-auto">{n.tag}</Badge>
            </div>
            <p className="text-[13px] leading-snug text-fg">{n.headline}</p>
          </li>
        ))}
      </ul>
      <p className="border-t border-hairline px-5 py-3 text-[10px] text-fg-subtle">
        Headlines are illustrative mock data — a live news/catalyst feed connects in a later phase.
      </p>
    </Card>
  );
}
