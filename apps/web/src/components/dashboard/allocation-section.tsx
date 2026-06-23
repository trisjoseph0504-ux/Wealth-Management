/** Allocation — donut + weighted breakdown bars, one colored slice per holding. */
import type { Holding } from "@/data/portfolio-mock";
import { Card, CardHeader, CardLink } from "@/components/ui/card";
import { Money } from "@/components/ui/financial";
import { Donut } from "@/components/ui/donut";
import { colorAt } from "@/components/ui/donut-colors";
import { IconPie } from "@/components/ui/icons";

export function AllocationSection({ holdings }: { holdings: Holding[] }) {
  const slices = [...holdings]
    .filter((h) => h.marketValue > 0)
    .sort((a, b) => b.marketValue - a.marketValue);
  const total = slices.reduce((s, h) => s + h.marketValue, 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Allocation"
        subtitle="By holding"
        icon={<IconPie size={16} />}
        action={<CardLink label="Rebalance" />}
      />
      <div className="flex flex-1 flex-col gap-6 px-5 py-5 sm:flex-row sm:items-center">
        <div className="mx-auto shrink-0">
          <Donut
            data={slices.map((h, i) => ({ key: `${h.symbol}-${i}`, label: h.symbol, value: h.weightPct, sub: h.name }))}
            center={
              <>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
                  Total
                </span>
                <Money value={total} compact className="text-lg font-semibold text-fg" />
                <span className="mt-0.5 text-[10px] text-fg-subtle">
                  {slices.length} {slices.length === 1 ? "position" : "positions"}
                </span>
              </>
            }
          />
        </div>

        <ul className="min-w-0 flex-1 space-y-2.5">
          {slices.map((h, i) => (
            <li key={h.symbol} className="group">
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-2 text-fg">
                  <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: colorAt(i) }} />
                  <span className="truncate font-medium">{h.symbol}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 whitespace-nowrap">
                  <span className="tnum text-fg-muted">
                    <Money value={h.marketValue} compact />
                  </span>
                  <span className="tnum w-14 text-right font-medium text-fg">
                    {h.weightPct.toFixed(1)}%
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-inset">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${h.weightPct}%`, background: colorAt(i) }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
