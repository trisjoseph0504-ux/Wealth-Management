/**
 * Daily intelligence briefing — the editorial "memo" lede from Lewis Intelligence.
 * Mock AI commentary in compliance-safe language, with a prominent disclaimer.
 */
import type { Briefing } from "@/data/intelligence-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { IconSparkles } from "@/components/ui/icons";

export function BriefingCard({ briefing }: { briefing: Briefing }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Daily Intelligence Briefing"
        subtitle={`Lewis Intelligence · ${briefing.dateLabel}`}
        icon={<IconSparkles size={16} />}
        action={<Badge tone="emerald">AI · Draft</Badge>}
      />
      <div className="px-5 py-5 sm:px-6">
        <p
          className="text-[15.5px] leading-relaxed text-fg"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {briefing.summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-hairline bg-hairline sm:grid-cols-4">
        {briefing.highlights.map((h) => (
          <div key={h.label} className="bg-surface px-4 py-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">{h.label}</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-fg">{h.value}</p>
          </div>
        ))}
      </div>

      <p className="border-t border-hairline px-5 py-3 text-[10px] leading-relaxed text-fg-subtle sm:px-6">
        <span className="font-medium text-fg-muted">Disclaimer.</span> AI-generated and for
        educational/informational purposes only — not personalized investment advice or a
        recommendation to buy or sell any security. Figures are illustrative. Review with a
        qualified advisor before acting.
      </p>
    </Card>
  );
}
