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
import { IconChart } from "@/components/ui/icons";

const RANGE_POINTS: Record<(typeof series.ranges)[number], number> = {
  "1M": 2,
  "3M": 4,
  "6M": 7,
  "1Y": 13,
  ALL: 13,
};

const W = 800;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 24, left: 40 };

function buildPath(values: number[], min: number, max: number): string {
  const span = max - min || 1;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const stepX = plotW / (values.length - 1 || 1);
  return values
    .map((v, i) => {
      const x = PAD.left + i * stepX;
      const y = PAD.top + plotH * (1 - (v - min) / span);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function PerformanceChart() {
  const [range, setRange] = useState<(typeof series.ranges)[number]>("1Y");

  const view = useMemo(() => {
    const n = RANGE_POINTS[range];
    const portfolio = series.portfolio.slice(-n);
    const benchmark = series.benchmark.slice(-n);
    const labels = series.labels.slice(-n);
    const all = [...portfolio, ...benchmark];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const startP = portfolio[0] ?? 100;
    const endP = portfolio[portfolio.length - 1] ?? 100;
    const startB = benchmark[0] ?? 100;
    const endB = benchmark[benchmark.length - 1] ?? 100;
    return {
      portfolio,
      benchmark,
      labels,
      min,
      max,
      portfolioReturn: ((endP - startP) / startP) * 100,
      benchmarkReturn: ((endB - startB) / startB) * 100,
    };
  }, [range]);

  const gridY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <Card>
      <CardHeader
        title="Performance"
        subtitle="Portfolio vs. benchmark · indexed to 100"
        icon={<IconChart size={16} />}
        action={<Badge tone="info">Placeholder</Badge>}
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

        <div className="h-[240px] w-full">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
            {/* Gridlines */}
            {gridY.map((g) => {
              const y = PAD.top + (H - PAD.top - PAD.bottom) * g;
              return (
                <line
                  key={g}
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="var(--color-hairline)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {/* Benchmark (muted, dashed) */}
            <path
              d={buildPath(view.benchmark, view.min, view.max)}
              fill="none"
              stroke="var(--color-line-strong)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Portfolio (emerald) */}
            <path
              d={buildPath(view.portfolio, view.min, view.max)}
              fill="none"
              stroke="var(--color-emerald)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* X labels */}
        <div className="mt-2 flex justify-between pl-9 text-[10px] text-fg-subtle">
          {view.labels.map((l, i) => (
            <span key={`${l}-${i}`} className={cn(view.labels.length > 8 && i % 2 !== 0 && "hidden sm:inline")}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
