/** Screener summary — aggregate stats for the current filtered result set. */
import type { ReactNode } from "react";
import type { ScreenSummary } from "@/data/screener-mock";
import { Card } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";

export function SummaryStats({ s, total }: { s: ScreenSummary; total: number }) {
  return (
    <Card>
      <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Matches">
          <span className="tnum text-fg">
            {s.count}
            <span className="ml-1 text-[12px] font-normal text-fg-subtle">/ {total}</span>
          </span>
        </Stat>
        <Stat label="Avg P/E">
          <span className="tnum">{s.count ? `${s.avgPe.toFixed(1)}×` : "—"}</span>
        </Stat>
        <Stat label="Avg Div Yield">
          <span className="tnum">{s.count ? `${s.avgDiv.toFixed(2)}%` : "—"}</span>
        </Stat>
        <Stat label="Median Mkt Cap">
          {s.count ? <Money value={s.medianMcapB * 1e9} compact /> : <span>—</span>}
        </Stat>
        <Stat label="Avg 1Y Return">
          {s.count ? <Percent value={s.avgPerf1Y} /> : <span>—</span>}
        </Stat>
        <Stat label="Advancing">
          <span className="tnum text-fg">{s.count ? `${s.advancingPct.toFixed(0)}%` : "—"}</span>
        </Stat>
      </div>
    </Card>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-surface px-4 py-3.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">{label}</p>
      <div className="mt-1 text-[15px] font-semibold tracking-tight text-fg">{children}</div>
    </div>
  );
}
