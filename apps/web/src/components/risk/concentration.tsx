/** Concentration risk — position-level concentration, HHI, and the largest
 *  drivers (clickable → security detail). Warning states scale with severity. */
import type { Concentration as ConcentrationData, HoldingRisk } from "@/data/risk-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money } from "@/components/ui/financial";
import { Badge, SectionLabel } from "@/components/ui/primitives";
import { TickerLink } from "@/components/ui/ticker-link";
import { IconLayers } from "@/components/ui/icons";

/** Severity → bar color (functional risk ramp; emerald→warn→red). */
function weightColor(weightPct: number): string {
  if (weightPct >= 15) return "var(--color-neg)";
  if (weightPct >= 9) return "var(--color-warn)";
  return "var(--color-emerald)";
}

export function Concentration({
  concentration,
  holdings,
}: {
  concentration: ConcentrationData;
  holdings: HoldingRisk[];
}) {
  const c = concentration;
  const top = holdings.filter((h) => h.assetClass !== "Cash").slice(0, 8);
  const maxW = Math.max(...top.map((h) => h.weightPct), 1);
  const concentrated = c.top1Pct >= 12 || c.top5Pct >= 45;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Concentration Risk"
        subtitle="Position-level exposure"
        icon={<IconLayers size={16} />}
        action={
          <Badge tone={concentrated ? "warn" : "emerald"}>
            {concentrated ? "Elevated" : "Diversified"}
          </Badge>
        }
      />

      <div className="grid grid-cols-3 gap-px border-b border-hairline bg-hairline">
        <Mini label="Effective Holdings" value={c.effectiveN.toFixed(1)} />
        <Mini label="Top-5 Weight" value={`${c.top5Pct.toFixed(1)}%`} />
        <Mini label="HHI" value={(c.hhi * 10000).toFixed(0)} hint="0–10,000" />
      </div>

      <ul className="flex-1 space-y-2.5 px-5 py-5">
        {top.map((h) => (
          <li key={h.symbol}>
            <div className="flex items-center justify-between text-[13px]">
              <TickerLink symbol={h.symbol} className="font-medium text-fg" />
              <span className="flex items-center gap-3">
                <Money value={h.marketValue} compact className="text-fg-subtle" />
                <span className="tnum w-12 text-right font-medium text-fg">{h.weightPct.toFixed(1)}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-inset">
              <div
                className="h-full rounded-full"
                style={{ width: `${(h.weightPct / maxW) * 100}%`, background: weightColor(h.weightPct) }}
              />
            </div>
          </li>
        ))}
      </ul>

      {concentrated && (
        <div className="border-t border-hairline px-5 py-3">
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-warn">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-warn" />
            Top holding is {c.top1Pct.toFixed(1)}% of the book — consider trimming single-name risk.
          </p>
        </div>
      )}
    </Card>
  );
}

function Mini({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-1 text-base font-semibold tracking-tight text-fg">{value}</div>
      {hint && <div className="text-[10px] text-fg-subtle">{hint}</div>}
    </div>
  );
}
