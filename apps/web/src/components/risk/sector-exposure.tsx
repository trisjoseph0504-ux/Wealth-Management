/** Sector concentration — look-through sector weights with severity shading.
 *  Sector labels route to Markets for sector context. */
import Link from "next/link";
import type { Allocation } from "@/data/portfolio-derive";
import { Card, CardHeader } from "@/components/ui/card";
import { Money } from "@/components/ui/financial";
import { Badge } from "@/components/ui/primitives";
import { IconPie } from "@/components/ui/icons";

function sectorColor(weightPct: number): string {
  if (weightPct >= 35) return "var(--color-neg)";
  if (weightPct >= 22) return "var(--color-warn)";
  return "var(--color-info)";
}

export function SectorExposure({ sectorAllocation }: { sectorAllocation: Allocation[] }) {
  const max = Math.max(...sectorAllocation.map((s) => s.weightPct), 1);
  const top = sectorAllocation[0];
  const concentrated = (top?.weightPct ?? 0) >= 30;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Sector Concentration"
        subtitle="Look-through exposure"
        icon={<IconPie size={16} />}
        action={<Badge tone={concentrated ? "warn" : "info"}>{concentrated ? "Concentrated" : "Balanced"}</Badge>}
      />
      <ul className="flex-1 space-y-3 px-5 py-5">
        {sectorAllocation.map((s) => (
          <li key={s.label} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
            <Link
              href="/markets"
              className="reduce-motion-safe w-fit text-[13px] text-fg transition hover:text-emerald"
            >
              {s.label}
            </Link>
            <span className="flex items-center gap-3 text-[13px]">
              <Money value={s.value} compact className="text-fg-subtle" />
              <span className="tnum w-12 text-right font-medium text-fg">{s.weightPct.toFixed(1)}%</span>
            </span>
            <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-inset">
              <div
                className="h-full rounded-full"
                style={{ width: `${(s.weightPct / max) * 100}%`, background: sectorColor(s.weightPct) }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
