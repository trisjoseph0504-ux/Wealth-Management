/** Asset-class allocation — donut + weighted legend, from portfolio holdings. */
import type { Allocation } from "@/data/portfolio-derive";
import { Card, CardHeader } from "@/components/ui/card";
import { Money } from "@/components/ui/financial";
import { Donut, colorAt } from "@/components/ui/donut";
import { IconPie } from "@/components/ui/icons";

export function AllocationBreakdown({ assetAllocation }: { assetAllocation: Allocation[] }) {
  const total = assetAllocation.reduce((s, a) => s + a.value, 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Asset Allocation" subtitle="By asset class" icon={<IconPie size={16} />} />
      <div className="flex flex-1 flex-col items-center gap-6 px-5 py-5 sm:flex-row">
        <div className="mx-auto shrink-0">
          <Donut
            data={assetAllocation.map((a, i) => ({ key: `${a.label}-${i}`, label: a.label, value: a.weightPct }))}
            center={
              <>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Total</span>
                <Money value={total} compact className="text-lg font-semibold text-fg" />
                <span className="mt-0.5 text-[10px] text-fg-subtle">{assetAllocation.length} classes</span>
              </>
            }
          />
        </div>
        <ul className="w-full min-w-0 flex-1 space-y-2.5">
          {assetAllocation.map((a, i) => (
            <li key={a.label}>
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-2 text-fg">
                  <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: colorAt(i) }} />
                  <span className="truncate">{a.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 whitespace-nowrap">
                  <Money value={a.value} compact className="text-fg-muted" />
                  <span className="tnum w-12 text-right font-medium text-fg">{a.weightPct.toFixed(1)}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-inset">
                <div className="h-full rounded-full" style={{ width: `${a.weightPct}%`, background: colorAt(i) }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
