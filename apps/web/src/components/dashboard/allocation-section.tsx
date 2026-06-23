/** Asset allocation — donut + weighted breakdown bars. */
import type { AllocationSlice } from "@/data/mock";
import { Card, CardHeader, CardLink } from "@/components/ui/card";
import { Money } from "@/components/ui/financial";
import { Donut, colorAt } from "@/components/ui/donut";
import { IconPie } from "@/components/ui/icons";

export function AllocationSection({ allocation }: { allocation: AllocationSlice[] }) {
  const total = allocation.reduce((s, a) => s + a.valueUsd, 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Asset Allocation"
        subtitle="Across all accounts"
        icon={<IconPie size={16} />}
        action={<CardLink label="Rebalance" />}
      />
      <div className="flex flex-1 flex-col gap-6 px-5 py-5 sm:flex-row sm:items-center">
        <div className="mx-auto shrink-0">
          <Donut
            data={allocation.map((a) => ({ key: a.key, label: a.label, value: a.weightPct }))}
            center={
              <>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
                  Total
                </span>
                <Money value={total} compact className="text-lg font-semibold text-fg" />
                <span className="mt-0.5 text-[10px] text-fg-subtle">{allocation.length} classes</span>
              </>
            }
          />
        </div>

        <ul className="min-w-0 flex-1 space-y-2.5">
          {allocation.map((a, i) => (
            <li key={a.key} className="group">
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-2 text-fg">
                  <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: colorAt(i) }} />
                  <span className="truncate">{a.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 whitespace-nowrap">
                  <span className="tnum text-fg-muted">
                    <Money value={a.valueUsd} compact />
                  </span>
                  <span className="tnum w-12 text-right font-medium text-fg">
                    {a.weightPct.toFixed(1)}%
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-inset">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${a.weightPct}%`, background: colorAt(i) }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
