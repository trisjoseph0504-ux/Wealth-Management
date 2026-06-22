"use client";

/**
 * Stress testing / scenario analysis. Select a shock; see the modeled portfolio
 * P&L and the worst contributing holdings ("risk drivers") — each links back to
 * its security detail. Impacts derive from per-holding beta + asset-class/sector
 * sensitivities (risk-mock), so they tie out with the rest of the platform.
 */
import { useState } from "react";
import type { ScenarioResult, ScenarioContribution } from "@/data/risk-mock";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent, Delta } from "@/components/ui/financial";
import { Badge } from "@/components/ui/primitives";
import { TickerLink } from "@/components/ui/ticker-link";
import { IconShield } from "@/components/ui/icons";

function tone(pct: number): "neg" | "warn" | "flat" | "pos" {
  if (pct <= -12) return "neg";
  if (pct <= -5) return "warn";
  if (pct >= 0.5) return "pos";
  return "flat";
}
const TONE_CLASS: Record<string, string> = { neg: "text-neg", warn: "text-warn", pos: "text-pos", flat: "text-fg-muted" };

export function ScenarioAnalysis({
  scenarios,
  portfolioValue,
}: {
  scenarios: ScenarioResult[];
  portfolioValue: number;
}) {
  const [activeId, setActiveId] = useState(scenarios[0]!.id);
  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0]!;
  const worst = Math.min(...active.drivers.map((d) => d.impactUsd), -1);

  return (
    <Card>
      <CardHeader
        title="Stress Testing & Scenario Analysis"
        subtitle="Modeled 1-day portfolio shock"
        icon={<IconShield size={16} />}
        action={<Badge tone="info">Scenario</Badge>}
      />
      <div className="grid gap-px bg-hairline lg:grid-cols-[300px_1fr]">
        {/* Scenario list */}
        <ul className="bg-surface">
          {scenarios.map((s) => {
            const on = s.id === activeId;
            const t = tone(s.portfolioImpactPct);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={cn(
                    "reduce-motion-safe flex w-full items-center justify-between gap-3 border-b border-hairline px-5 py-3.5 text-left transition",
                    on ? "bg-emerald/[0.06]" : "hover:bg-surface-2/40",
                  )}
                >
                  <div className="min-w-0">
                    <p className={cn("text-[13px] font-semibold tracking-tight", on ? "text-fg" : "text-fg-muted")}>
                      {s.name}
                    </p>
                    <p className="truncate text-[11px] text-fg-subtle">{s.description}</p>
                  </div>
                  <span className={cn("tnum shrink-0 text-[13px] font-semibold", TONE_CLASS[t])}>
                    {formatPercent(s.portfolioImpactPct)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Selected scenario detail */}
        <div className="bg-surface px-5 py-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">Modeled Impact</p>
              <div className="mt-1 flex items-end gap-3">
                <span className={cn("tnum text-3xl font-semibold tracking-tight", TONE_CLASS[tone(active.portfolioImpactPct)])}>
                  {formatPercent(active.portfolioImpactPct)}
                </span>
                <Delta value={active.portfolioImpactUsd} className="mb-1 text-sm" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-fg-subtle">Post-shock value</p>
              <Money
                value={portfolioValue + active.portfolioImpactUsd}
                compact
                className="text-lg font-semibold text-fg"
              />
            </div>
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            Largest risk drivers
          </p>
          <ul className="mt-2 space-y-2">
            {active.drivers.map((d) => (
              <DriverRow key={d.symbol} d={d} worst={worst} />
            ))}
          </ul>
          <p className="mt-4 text-[10px] leading-relaxed text-fg-subtle">
            Illustrative parametric estimate from per-holding sensitivities — not a forecast. Click a
            driver to inspect the holding.
          </p>
        </div>
      </div>
    </Card>
  );
}

function DriverRow({ d, worst }: { d: ScenarioContribution; worst: number }) {
  const width = Math.max(4, (d.impactUsd / worst) * 100); // worst is negative → ratio 0..1
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <TickerLink symbol={d.symbol} className="w-16 text-[13px] font-semibold text-fg" />
      <div className="h-1.5 overflow-hidden rounded-full bg-inset">
        <div className="h-full rounded-full bg-neg" style={{ width: `${Math.min(width, 100)}%` }} />
      </div>
      <div className="flex items-center gap-3 text-right">
        <Percent value={d.impactPct} className="w-16 justify-end text-[12px]" />
        <Delta value={d.impactUsd} currency="USD" className="w-20 justify-end text-[12px]" />
      </div>
    </li>
  );
}
