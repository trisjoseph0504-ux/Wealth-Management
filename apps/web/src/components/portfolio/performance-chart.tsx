"use client";

/**
 * Performance chart — Phase 2 PLACEHOLDER. In-house SVG (portfolio vs benchmark,
 * indexed to 100). Range tabs actually slice the series so the interaction feels
 * real. The production chart (zoom, crosshair, intraday) arrives in Phase 3 via
 * TradingView Lightweight Charts — this component's props are the seam.
 */
import { useMemo, useState } from "react";
import { performanceSeries as series } from "@/data/portfolio-mock";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { Percent } from "@/components/ui/financial";
import { Badge } from "@/components/ui/primitives";
import { InteractiveChart } from "@/components/ui/interactive-chart";
import { IconChart } from "@/components/ui/icons";

const RANGE_POINTS: Record<(typeof series.ranges)[number], number> = {
  "1M": 2,
  "3M": 4,
  "6M": 7,
  "1Y": 13,
  ALL: 13,
};

export function PerformanceChart() {
  const [range, setRange] = useState<(typeof series.ranges)[number]>("1Y");

  const view = useMemo(() => {
    const n = RANGE_POINTS[range];
    const portfolio = series.portfolio.slice(-n);
    const benchmark = series.benchmark.slice(-n);
    const labels = series.labels.slice(-n);
    const startP = portfolio[0] ?? 100;
    const endP = portfolio[portfolio.length - 1] ?? 100;
    const startB = benchmark[0] ?? 100;
    const endB = benchmark[benchmark.length - 1] ?? 100;
    return {
      portfolio,
      benchmark,
      labels,
      portfolioReturn: ((endP - startP) / startP) * 100,
      benchmarkReturn: ((endB - startB) / startB) * 100,
    };
  }, [range]);

  return (
    <Card>
      <CardHeader
        title="Performance"
        subtitle="Portfolio vs. benchmark · indexed to 100"
        icon={<IconChart size={16} />}
        action={<Badge tone="info">Illustrative</Badge>}
      />
      <div className="px-5 py-5">
        {/* Range tabs + return readout */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-[6px] border border-hairline bg-inset p-0.5">
            {series.ranges.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "reduce-motion-safe rounded-[4px] px-2.5 py-1 text-[11px] font-medium transition",
                  range === r ? "bg-surface-2 text-fg" : "text-fg-subtle hover:text-fg",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            <span className="inline-flex items-center gap-1.5 text-fg-muted">
              <span className="h-0.5 w-4 rounded-full bg-emerald" /> Portfolio
              <Percent value={view.portfolioReturn} className="font-medium" />
            </span>
            <span className="inline-flex items-center gap-1.5 text-fg-muted">
              <span className="h-0.5 w-4 rounded-full bg-line-strong" /> Benchmark
              <Percent value={view.benchmarkReturn} className="font-medium" />
            </span>
          </div>
        </div>

        <InteractiveChart
          series={[
            { values: view.portfolio, color: "var(--color-emerald)", label: "Portfolio", area: true },
            { values: view.benchmark, color: "var(--color-line-strong)", label: "Benchmark", dashed: true, width: 1.5 },
          ]}
          xLabels={view.labels}
          height={250}
          yFormat={(v) => v.toFixed(1)}
          yAxisTitle="Index"
        />
      </div>
    </Card>
  );
}
