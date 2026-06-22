/**
 * AI market commentary — Phase 1 PLACEHOLDER. No model call yet.
 *
 * The mandatory non-advice disclaimer + provenance footer are present from day
 * one by design (SECURITY.md §7): the guardrail ships before the feature, so it
 * can never be retrofitted as an afterthought. Editorial serif gives it a
 * "research note" voice rather than a chatbot feel (DESIGN_SYSTEM.md §3).
 */
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, Button } from "@/components/ui/primitives";
import { IconSparkles, IconClock } from "@/components/ui/icons";

export function AiCommentary() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="AI Market Commentary"
        subtitle="Generated insight · informational only"
        icon={<IconSparkles size={16} />}
        action={<Badge tone="emerald">Beta</Badge>}
      />
      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="rounded-[8px] border border-dashed border-line-strong bg-inset/40 px-5 py-6">
          <p
            className="text-[15px] leading-relaxed text-fg-muted"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <span className="text-fg">Commentary will appear here.</span> Once
            connected, <span className="text-fg">Lewis Intelligence</span> summarizes
            how your holdings, allocation, and risk posture relate to current
            market conditions — in plain, advisor-grade language.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="primary" disabled>
              <IconSparkles size={14} />
              Generate commentary
            </Button>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-fg-subtle">
              <IconClock size={13} />
              Connects in Phase 5
            </span>
          </div>
        </div>

        <p className="mt-auto pt-5 text-[10px] leading-relaxed text-fg-subtle">
          <span className="font-medium text-fg-muted">Disclaimer.</span>{" "}
          AI-generated content is informational only, may be inaccurate, and is
          not personalized investment advice or a recommendation to buy or sell
          any security. Every generation is stored with its model, timestamp, and
          source-data provenance.
        </p>
      </div>
    </Card>
  );
}
