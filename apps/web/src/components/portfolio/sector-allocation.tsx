/** Sector allocation — ranked horizontal bars with weight + value. */
import type { Allocation } from "@/data/portfolio-derive";
import { Card, CardHeader } from "@/components/ui/card";
import { Money } from "@/components/ui/financial";
import { colorAt } from "@/components/ui/donut-colors";
import { IconLayers } from "@/components/ui/icons";

export function SectorAllocation({ sectorAllocation }: { sectorAllocation: Allocation[] }) {
  const max = Math.max(...sectorAllocation.map((s) => s.weightPct), 1);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Sector Allocation" subtitle="Look-through exposure" icon={<IconLayers size={16} />} />
      <ul className="flex-1 space-y-3 px-5 py-5">
        {sectorAllocation.map((s, i) => (
          <li key={s.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
            <span className="min-w-0 truncate text-[13px] text-fg">{s.label}</span>
            <span className="flex shrink-0 items-center gap-3 whitespace-nowrap text-[13px]">
              <Money value={s.value} compact className="text-fg-subtle" />
              <span className="tnum w-12 text-right font-medium text-fg">{s.weightPct.toFixed(1)}%</span>
            </span>
            <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-inset">
              <div
                className="h-full rounded-full"
                style={{ width: `${(s.weightPct / max) * 100}%`, background: colorAt(i) }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
