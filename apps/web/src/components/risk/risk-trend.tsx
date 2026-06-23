"use client";

/** Risk trend — composite risk score over the trailing 12 months, with a labeled
 *  y-axis (score) and a hover crosshair via the shared interactive chart. */
import type { RiskTrendPoint } from "@/data/risk-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { InteractiveChart } from "@/components/ui/interactive-chart";
import { IconActivity } from "@/components/ui/icons";

export function RiskTrend({ trend }: { trend: RiskTrendPoint[] }) {
  const scores = trend.map((d) => d.score);
  const start = scores[0] ?? 0;
  const end = scores[scores.length - 1] ?? 0;
  const delta = end - start;

  return (
    <Card>
      <CardHeader
        title="Risk Trend"
        subtitle="Composite score · trailing 12 months"
        icon={<IconActivity size={16} />}
        action={
          <Badge tone={delta > 0 ? "warn" : delta < 0 ? "emerald" : "neutral"}>
            {delta > 0 ? "+" : ""}
            {delta} vs. 12M ago
          </Badge>
        }
      />
      <div className="px-5 py-5">
        <div className="mb-3 flex items-end gap-3">
          <span className="tnum text-2xl font-semibold tracking-tight text-fg">{end}</span>
          <span className="mb-1 text-[12px] text-fg-subtle">current composite risk score</span>
        </div>
        <InteractiveChart
          series={[{ values: scores, color: "var(--color-warn)", label: "Risk score", area: true }]}
          xLabels={trend.map((d) => d.label)}
          height={220}
          yFormat={(v) => v.toFixed(0)}
          yAxisTitle="Score"
        />
      </div>
    </Card>
  );
}
