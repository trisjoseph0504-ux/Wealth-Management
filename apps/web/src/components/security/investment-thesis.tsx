/**
 * AI investment thesis — Phase 4 PLACEHOLDER. Shows a templated, branded thesis
 * preview from "Lewis Intelligence" with the mandatory non-advice disclaimer and
 * provenance note shipping BEFORE the live model (SECURITY.md §7). Editorial
 * serif gives it a research-note voice, not a chatbot.
 */
import type { SecurityDetail } from "@/data/security-detail-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, Button } from "@/components/ui/primitives";
import { IconSparkles, IconClock } from "@/components/ui/icons";

export function InvestmentThesis({ d }: { d: SecurityDetail }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Investment Thesis"
        subtitle="Lewis Intelligence · informational only"
        icon={<IconSparkles size={16} />}
        action={<Badge tone="emerald">AI · Draft</Badge>}
      />
      <div className="flex flex-1 flex-col px-5 py-5">
        <p
          className="text-[15px] leading-relaxed text-fg-muted"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {d.thesis}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" disabled>
            <IconSparkles size={14} /> Regenerate thesis
          </Button>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-fg-subtle">
            <IconClock size={13} /> Live model connects in a later phase
          </span>
        </div>
        <p className="mt-auto pt-5 text-[10px] leading-relaxed text-fg-subtle">
          <span className="font-medium text-fg-muted">Disclaimer.</span> AI-generated
          and illustrative only — not personalized investment advice or a
          recommendation. Stored with model, timestamp, and source-data provenance.
        </p>
      </div>
    </Card>
  );
}
