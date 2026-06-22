"use client";

/**
 * AI Winner Analysis for the Compare page. Reads the selected securities and
 * writes a high-level take on which is the strongest and the scenarios each
 * thrives in (folding in bull/bear). Rules-based and informational-only; the
 * "Generate" action gives it an on-demand feel. Stays in sync with the set.
 */
import { useState, type ReactNode } from "react";
import { buildCompareAnalysis } from "@/data/compare-analysis";
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
  const [generated, setGenerated] = useState(false);
  const [busy, setBusy] = useState(false);

  const analysis = buildCompareAnalysis(cards);

  function generate() {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setGenerated(true);
    }, 550);
  }

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="AI Winner Analysis"
        subtitle="High-level read on the selected securities"
        icon={<IconSparkles size={16} />}
        action={<Badge tone="emerald">Beta</Badge>}
      />

      {!analysis ? (
        <EmptyState
          icon={<IconShield size={18} />}
          title="Add two or more to analyze"
          description="Once you've added at least two securities, generate a high-level take on which is strongest and where each one shines."
        />
      ) : (
        <div className="px-5 py-5">
          {!generated ? (
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
                <Badge tone="emerald">{analysis.winner}</Badge>
              </div>
              {analysis.paragraphs.map((p, i) => (
                <p key={i} className="text-[14px] leading-relaxed text-fg-muted" style={{ fontFamily: "var(--font-serif)" }}>
                  {rich(p)}
                </p>
              ))}
            </div>
          )}

          <p className="mt-5 text-[10px] leading-relaxed text-fg-subtle">
            <span className="font-medium text-fg-muted">Disclaimer.</span> A rules-based synthesis of the metrics shown,
            for informational purposes only — not personalized investment advice or a recommendation to buy or sell.
          </p>
        </div>
      )}
    </Card>
  );
}
