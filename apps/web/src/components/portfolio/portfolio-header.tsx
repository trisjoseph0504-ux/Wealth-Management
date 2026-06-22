/** Portfolio summary header — identity, headline value, and key stat strip. */
import type { ReactNode } from "react";
import type { PortfolioSummary } from "@/data/portfolio-derive";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Money, Percent, Delta, ChangePill } from "@/components/ui/financial";
import { Badge, SectionLabel } from "@/components/ui/primitives";
import { IconBuilding } from "@/components/ui/icons";

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-1 text-base font-semibold tracking-tight text-fg sm:text-lg">{children}</div>
    </div>
  );
}

export function PortfolioHeader({ s }: { s: PortfolioSummary }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="emerald">
              <IconBuilding size={12} /> Lewis Family Office
            </Badge>
            <Badge tone="neutral">Consolidated · {s.holdingsCount} holdings</Badge>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <SectionLabel>Total Portfolio Value</SectionLabel>
          </div>
          <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-2">
            <Money value={s.totalValue} className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl" />
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <ChangePill value={s.dayChangePct} />
              <Delta value={s.dayChangeUsd} className="text-sm" />
              <span className="text-xs text-fg-subtle">today</span>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-fg-subtle">As of {s.asOf}</p>
        </div>

        <div className="flex flex-col items-start gap-1 lg:items-end">
          <SectionLabel>Total Gain / Loss</SectionLabel>
          <div className="flex items-center gap-2">
            <Money
              value={s.totalGain}
              className={cn(
                "text-2xl font-semibold tracking-tight",
                s.totalGain > 0 ? "text-pos" : s.totalGain < 0 ? "text-neg" : "text-fg",
              )}
            />
            <span className="text-lg text-fg-subtle">/</span>
            <Percent value={s.totalGainPct} withGlyph className="text-sm" />
          </div>
          <p className="inline-flex items-center gap-1 text-[11px] text-fg-subtle">
            Cost basis <Money value={s.totalCost} compact className="text-fg-muted" />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-hairline bg-hairline sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="YTD Return">
          <Percent value={s.ytdReturnPct} withGlyph />
        </Stat>
        <Stat label="Day Change">
          <Delta value={s.dayChangeUsd} />
        </Stat>
        <Stat label="Income Yield">
          <span className="tnum text-fg">{s.incomeYieldPct.toFixed(2)}%</span>
        </Stat>
        <Stat label="Cash">
          <Money value={s.cash} compact />
        </Stat>
        <Stat label="Holdings">
          <span className="tnum text-fg">{s.holdingsCount}</span>
        </Stat>
      </div>
    </Card>
  );
}
