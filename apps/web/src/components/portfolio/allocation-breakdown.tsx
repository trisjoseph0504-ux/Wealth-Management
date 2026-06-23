/** Holdings allocation — donut + weighted legend, one colored slice per position. */
import type { Holding } from "@/data/portfolio-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money } from "@/components/ui/financial";
import { Donut, colorAt } from "@/components/ui/donut";
import { IconPie } from "@/components/ui/icons";

export function AllocationBreakdown({ holdings }: { holdings: Holding[] }) {
  const slices = [...holdings]
    .filter((h) => h.marketValue > 0)
    .sort((a, b) => b.marketValue - a.marketValue);
  const total = slices.reduce((s, h) => s + h.marketValue, 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Allocation" subtitle="By holding" icon={<IconPie size={16} />} />
      <div className="flex flex-1 flex-col items-center gap-6 px-5 py-5 sm:flex-row">
        <div className="mx-auto shrink-0">
          <Donut
            data={slices.map((h, i) => ({ key: `${h.symbol}-${i}`, label: h.symbol, value: h.weightPct }))}
            center={
              <>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Total</span>
                <Money value={total} compact className="text-lg font-semibold text-fg" />
                <span className="mt-0.5 text-[10px] text-fg-subtle">
                  {slices.length} {slices.length === 1 ? "position" : "positions"}
                </span>
              </>
            }
          />
        </div>
        <ul className="w-full min-w-0 flex-1 space-y-2.5">
          {slices.map((h, i) => (
            <li key={h.symbol}>
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-2 text-fg">
                  <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: colorAt(i) }} />
                  <span className="shrink-0 font-medium">{h.symbol}</span>
                  <span className="truncate text-fg-subtle">{h.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 whitespace-nowrap">
                  <Money value={h.marketValue} compact className="text-fg-muted" />
                  <span className="tnum w-12 text-right font-medium text-fg">{h.weightPct.toFixed(1)}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-inset">
                <div className="h-full rounded-full" style={{ width: `${h.weightPct}%`, background: colorAt(i) }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
