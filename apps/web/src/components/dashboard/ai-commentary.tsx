"use client";

/**
 * AI Market Commentary. Each click re-assesses the LIVE portfolio + risk and asks
 * Claude (Anthropic API) for a fresh, grounded commentary — falling back to a
 * rules-based take when no API key is configured. Clearly labeled informational-
 * only; the mandatory non-advice disclaimer ships with the feature (SECURITY.md
 * §7). "Regenerate" rotates the analytical angle and re-prompts.
 */
import { useState } from "react";
import { generateCommentaryAction } from "@/server/actions/commentary";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, Button } from "@/components/ui/primitives";
import { IconSparkles, IconClock } from "@/components/ui/icons";

export function AiCommentary() {
  const [text, setText] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [stamp, setStamp] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  async function generate(nextIdx: number) {
    setBusy(true);
    setText(null);
    try {
      const res = await generateCommentaryAction(nextIdx);
      setText(res.text);
      setLive(res.ai);
      setIdx(nextIdx);
      setStamp(
        new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date()),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="AI Market Commentary"
        subtitle="Generated from your live data · informational only"
        icon={<IconSparkles size={16} />}
        action={
          stamp ? (
            <span className="inline-flex items-center gap-2 text-[11px] text-fg-subtle">
              <Badge tone={live ? "emerald" : "neutral"}>{live ? "Live AI" : "Illustrative"}</Badge>
              <IconClock size={12} /> {stamp}
            </span>
          ) : (
            <Badge tone="emerald">Beta</Badge>
          )
        }
      />
      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="rounded-[8px] border border-hairline bg-inset/40 px-5 py-5">
          {text ? (
            <p className="text-[15px] leading-relaxed text-fg" style={{ fontFamily: "var(--font-serif)" }}>
              {text}
            </p>
          ) : (
            <p className="text-[15px] leading-relaxed text-fg-muted" style={{ fontFamily: "var(--font-serif)" }}>
              {busy ? (
                <span className="inline-flex items-center gap-2 text-fg-subtle">
                  <IconSparkles size={14} className="animate-pulse" /> Synthesizing commentary from your holdings, allocation, and risk…
                </span>
              ) : (
                <>
                  <span className="text-fg">Generate commentary</span> to see how your holdings, allocation, and risk posture
                  relate to current market conditions — in plain, advisor-grade language.
                </>
              )}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!text ? (
              <Button variant="primary" onClick={() => generate(0)} disabled={busy}>
                <IconSparkles size={14} />
                {busy ? "Generating…" : "Generate commentary"}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => generate(idx + 1)} disabled={busy}>
                  <IconSparkles size={14} />
                  Regenerate
                </Button>
                <span className="text-[11px] text-fg-subtle">
                  Angle {(idx % 4) + 1} of 4 · {live ? "Claude" : "rules-based"}
                </span>
              </>
            )}
          </div>
        </div>

        <p className="mt-auto pt-5 text-[10px] leading-relaxed text-fg-subtle">
          <span className="font-medium text-fg-muted">Disclaimer.</span> AI-generated content is informational only, may be
          inaccurate, and is not personalized investment advice or a recommendation to buy or sell any security. Figures are
          derived from your platform data and are illustrative.
        </p>
      </div>
    </Card>
  );
}
