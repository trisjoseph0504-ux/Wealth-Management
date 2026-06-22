/** Portfolio overview — hero value + day move, trend, and key stat cards. */
import { portfolio } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Money, Percent, Delta, ChangePill } from "@/components/ui/financial";
import { SectionLabel } from "@/components/ui/primitives";
import { Sparkline } from "@/components/ui/sparkline";

export function PortfolioOverview() {
  const p = portfolio;
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-px bg-hairline lg:grid-cols-[1.4fr_1fr]">
        {/* Hero */}
        <div className="bg-surface px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Total Portfolio Value</SectionLabel>
            <span className="shrink-0 text-[11px] text-fg-subtle">{p.asOf}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2">
            <Money
              value={p.totalValueUsd}
              className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
            />
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <ChangePill value={p.dayChangePct} />
              <Delta value={p.dayChangeUsd} className="text-sm" />
              <span className="text-xs text-fg-subtle">today</span>
            </div>
          </div>

          <div className="mt-5 h-20 w-full">
            <Sparkline data={p.valueTrend} width={620} height={80} tone="pos" strokeWidth={2} fluid />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-subtle">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-4 bg-emerald" /> Portfolio
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-4 border-t border-dashed border-line-strong" /> Benchmark (S&amp;P 500)
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5">
              All-time <Percent value={p.totalGainPct} withGlyph />
            </span>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-px bg-hairline">
          {(
            [
              {
                label: "Total Gain / Loss",
                node: <Money value={p.totalGainUsd} compact />,
                hint: <Percent value={p.totalGainPct} withGlyph />,
              },
              {
                label: "Day Change",
                node: <Delta value={p.dayChangeUsd} />,
                hint: <Percent value={p.dayChangePct} />,
              },
              {
                label: "Cash & Equivalents",
                node: <Money value={p.cashUsd} compact />,
                hint: <span className="text-fg-subtle">5.1% of portfolio</span>,
              },
              {
                label: "Buying Power",
                node: <Money value={p.buyingPowerUsd} compact />,
                hint: <span className="text-fg-subtle">Margin available</span>,
              },
            ] as const
          ).map((s) => (
            <div key={s.label} className="bg-surface px-4 py-4 sm:px-5">
              <SectionLabel>{s.label}</SectionLabel>
              <div className="mt-1.5 text-lg font-semibold tracking-tight text-fg sm:text-xl">{s.node}</div>
              <div className="mt-1 text-xs">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
