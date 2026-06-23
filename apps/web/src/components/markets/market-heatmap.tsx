/**
 * Market heatmap — securities grouped by sector, tiles sized by market cap and
 * colored by day change intensity (emerald gains / red losses, never yellow).
 * In-house, dependency-free; a true treemap can replace it later behind the same
 * data shape. The intensity ramp is a documented viz palette (DESIGN_SYSTEM §6).
 */
import Link from "next/link";
import type { HeatmapGroup } from "@/server/market/markets-live";
import { Card, CardHeader } from "@/components/ui/card";
import { IconGrid } from "@/components/ui/icons";

/** Map a % change to a tinted background. ±2.5% saturates the ramp. */
function heatStyle(changePct: number): string {
  const clamped = Math.max(-2.5, Math.min(2.5, changePct)) / 2.5; // -1..1
  const alpha = (0.12 + Math.abs(clamped) * 0.5).toFixed(3);
  return changePct >= 0
    ? `rgba(16, 185, 129, ${alpha})`
    : `rgba(242, 85, 90, ${alpha})`;
}

export function MarketHeatmap({ heatmap }: { heatmap: HeatmapGroup[] }) {
  return (
    <Card>
      <CardHeader
        title="Market Heatmap"
        subtitle="By sector · sized by market cap, shaded by day change"
        icon={<IconGrid size={16} />}
        action={
          <div className="hidden items-center gap-2 text-[10px] text-fg-subtle sm:flex">
            <span>−2.5%</span>
            <span className="h-2 w-24 rounded-full" style={{ background: "linear-gradient(90deg, rgba(242,85,90,0.62), rgba(155,168,166,0.18), rgba(16,185,129,0.62))" }} />
            <span>+2.5%</span>
          </div>
        }
      />
      <div className="space-y-3 p-4">
        {heatmap.map((group) => (
          <div key={group.sector}>
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
              {group.sector}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.items.map((s) => (
                <Link
                  key={s.symbol}
                  href={`/security/${encodeURIComponent(s.symbol)}`}
                  title={`${s.name} · $${s.price.toFixed(2)} · ${s.changePct >= 0 ? "+" : ""}${s.changePct.toFixed(2)}%`}
                  className="reduce-motion-safe flex h-14 min-w-[64px] flex-col justify-center rounded-[4px] border border-hairline/60 px-2 transition hover:border-emerald/50 hover:ring-1 hover:ring-emerald/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/50"
                  style={{ flexGrow: s.marketCapB, flexBasis: 0, background: heatStyle(s.changePct) }}
                >
                  <span className="text-[12px] font-semibold tracking-tight text-fg">{s.symbol}</span>
                  <span className="tnum text-[11px] text-fg">
                    {s.changePct >= 0 ? "+" : ""}
                    {s.changePct.toFixed(2)}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
