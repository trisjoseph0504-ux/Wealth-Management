"use client";

/**
 * Price chart with timeframe toggles. In-house SVG (area + line), token-colored,
 * direction-aware. Series are deterministic per symbol/range and their endpoints
 * match the performance metrics, so the chart and the numbers agree. Production
 * (intraday, crosshair, volume) lands behind the same data seam in a later phase.
 */
import { useMemo, useState } from "react";
import { buildSeries, type SecurityDetail } from "@/data/security-detail-mock";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";
import { Badge } from "@/components/ui/primitives";
import { InteractiveChart } from "@/components/ui/interactive-chart";
import { rangePointLabels } from "@/lib/chart-time";
import { IconChart } from "@/components/ui/icons";

export function SecurityChart({ d }: { d: SecurityDetail }) {
  const [rangeKey, setRangeKey] = useState("3M");
  const range = d.chartRanges.find((r) => r.key === rangeKey) ?? d.chartRanges[0]!;

  const { data, labels, up } = useMemo(() => {
    const series = buildSeries(d.symbol, d.price, range.returnPct, range.points);
    return { data: series, labels: rangePointLabels(range.key, series.length), up: range.returnPct >= 0 };
  }, [d.symbol, d.price, range]);

  const stroke = up ? "var(--color-emerald)" : "var(--color-neg)";
  const fmtPrice = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Card>
      <CardHeader
        title="Price"
        subtitle={`${d.exchange} · ${d.currency} · delayed`}
        icon={<IconChart size={16} />}
        action={<Badge tone="info">Illustrative</Badge>}
      />
      <div className="px-5 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-end gap-3">
            <Money value={d.price} className="text-2xl font-semibold tracking-tight text-fg" />
            <span className="mb-1 inline-flex items-center gap-1.5 text-[12px] text-fg-subtle">
              {range.label} <Percent value={range.returnPct} withGlyph className="font-medium" />
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-[6px] border border-hairline bg-inset p-0.5">
            {d.chartRanges.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRangeKey(r.key)}
                className={cn(
                  "reduce-motion-safe rounded-[4px] px-2.5 py-1 text-[11px] font-medium transition",
                  rangeKey === r.key ? "bg-surface-2 text-fg" : "text-fg-subtle hover:text-fg",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <InteractiveChart
          series={[{ values: data, color: stroke, label: d.symbol, area: true }]}
          xLabels={labels}
          height={280}
          yFormat={fmtPrice}
          yAxisTitle="Price (USD)"
          xAxisTitle={range.label}
        />
      </div>
    </Card>
  );
}
