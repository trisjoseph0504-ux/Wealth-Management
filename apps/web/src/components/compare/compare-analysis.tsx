"use client";

/**
 * AI Winner Analysis for the Compare page. On "Generate" it asks Claude (Anthropic
 * API) for a grounded read on the selected securities — which is strongest and the
 * scenarios each thrives in, folding in bull/bear — and falls back to a rules-based
 * synthesis when no API key is configured. Informational-only. Re-generate after
 * changing the set (the result is tied to the exact symbols it was generated for).
 */
import { useState, type ReactNode } from "react";
import {
  generateCompareAnalysisAction,
  type CompareAnalysisResult,
} from "@/server/actions/compare-analysis";
import type { CompareCard } from "@/server/actions/compare";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { IconSparkles, IconShield } from "@/components/ui/icons";

function rich(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((seg, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-fg">
        {seg}
      </strong>
    ) : (
      <span key={i}>{seg}</span>
    ),
  );
}

export function CompareAnalysis({ cards }: { cards: CompareCard[] }) {
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{ data: CompareAnalysisResult; sig: string } | null>(null);

  const hasEnough = cards.length >= 2;
  const sig = cards.map((c) => c.symbol).join(",");
  const shown = out && out.sig === sig ? out.data : null;

  async function generate() {
    setBusy(true);
    try {
      const res = await generateCompareAnalysisAction(cards);
      if (res) setOut({ data: res, sig });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="AI Winner Analysis"
        subtitle="High-level read on the selected securities"
        icon={<IconSparkles size={16} />}
        action={
          shown ? (
            <Badge tone={shown.ai ? "emerald" : "neutral"}>{shown.ai ? "Live AI" : "Illustrative"}</Badge>
          ) : (
            <Badge tone="emerald">Beta</Badge>
          )
        }
      />

      {!hasEnough ? (
        <EmptyState
          icon={<IconShield size={18} />}
          title="Add two or more to analyze"
          description="Once you've added at least two securities, generate a high-level take on which is strongest and where each one shines."
        />
      ) : (
        <div className="px-5 py-5">
          {!shown ? (
            <div className="rounded-[8px] border border-dashed border-line-strong bg-inset/40 px-5 py-6 text-center">
              <p className="text-[13px] text-fg-muted">
                Generate a high-level analysis of {cards.map((c) => c.symbol).join(", ")} — which is the strongest
                all-rounder, and the market scenarios each would thrive in.
              </p>
              <Button variant="primary" onClick={generate} disabled={busy} className="mt-4">
                <IconSparkles size={14} />
                {busy ? "Analyzing…" : "Generate analysis"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-fg-subtle">Strongest</span>
                <Badge tone="emerald">{shown.winner}</Badge>
                <Button variant="outline" onClick={generate} disabled={busy} className="ml-auto">
                  <IconSparkles size={14} />
                  {busy ? "Analyzing…" : "Regenerate"}
                </Button>
              </div>
              {shown.paragraphs.map((p, i) => (
                <p key={i} className="text-[14px] leading-relaxed text-fg-muted" style={{ fontFamily: "var(--font-serif)" }}>
                  {rich(p)}
                </p>
              ))}
            </div>
          )}

          <p className="mt-5 text-[10px] leading-relaxed text-fg-subtle">
            <span className="font-medium text-fg-muted">Disclaimer.</span> {shown?.ai ? "AI-generated" : "A rules-based"} synthesis
            of the metrics shown, for informational purposes only — may be inaccurate, and is not personalized investment advice
            or a recommendation to buy or sell.
          </p>
        </div>
      )}
    </Card>
  );
}
