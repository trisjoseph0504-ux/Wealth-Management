"use client";

/**
 * Per-stock Outlook — a read across time horizons (Daily → All-time). Each tab
 * shows the return over that window plus a short, rules-based outlook on trend,
 * momentum, range position, and risk. Illustrative/informational, not a forecast.
 */
import { useState } from "react";
import type { SecurityDetail } from "@/data/security-detail-mock";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { Percent } from "@/components/ui/financial";
import { Badge } from "@/components/ui/primitives";
import { IconActivity } from "@/components/ui/icons";

export function StockOutlook({ d }: { d: SecurityDetail }) {
  const [key, setKey] = useState(d.outlook[0]?.key ?? "1D");
  const active = d.outlook.find((o) => o.key === key) ?? d.outlook[0];
  if (!active) return null;

  return (
    <Card>
      <CardHeader
        title="Outlook"
        subtitle={`${d.symbol} · by time horizon`}
        icon={<IconActivity size={16} />}
        action={<Badge tone="info">Illustrative</Badge>}
      />
      <div className="px-5 py-5">
        <div className="flex flex-wrap items-center gap-1 rounded-[6px] border border-hairline bg-inset p-0.5">
          {d.outlook.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setKey(o.key)}
              className={cn(
                "reduce-motion-safe rounded-[4px] px-2.5 py-1 text-[11px] font-medium transition",
                key === o.key ? "bg-surface-2 text-fg" : "text-fg-subtle hover:text-fg",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-fg-subtle">{active.label} return</span>
          <Percent value={active.returnPct} withGlyph className="text-lg font-semibold" />
        </div>

        <p className="mt-2.5 text-[14px] leading-relaxed text-fg-muted" style={{ fontFamily: "var(--font-serif)" }}>
          {active.summary}
        </p>

        <p className="mt-4 text-[10px] leading-relaxed text-fg-subtle">
          Illustrative, rules-based read across time horizons — informational only, not a forecast or a recommendation.
        </p>
      </div>
    </Card>
  );
}
