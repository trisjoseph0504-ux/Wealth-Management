"use client";

/**
 * Price chart with timeframe toggles. In-house SVG (area + line), token-colored,
 * direction-aware. Series are deterministic per symbol/range and their endpoints
 * match the performance metrics, so the chart and the numbers agree. Production
 * (intraday, crosshair, volume) lands behind the same data seam in a later phase.
 */
import { useId, useMemo, useState } from "react";
import { buildSeries, type SecurityDetail } from "@/data/security-detail-mock";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";
import { Badge } from "@/components/ui/primitives";
import { IconChart } from "@/components/ui/icons";

const W = 760;
const H = 260;
const PAD = 8;

export function SecurityChart({ d }: { d: SecurityDetail }) {
  const gid = useId().replace(/:/g, "");
  const [rangeKey, setRangeKey] = useState("3M");
  const range = d.chartRanges.find((r) => r.key === rangeKey) ?? d.chartRanges[0]!;

  const { line, area, up } = useMemo(() => {
    const data = buildSeries(d.symbol, d.price, range.returnPct, range.points);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const stepX = (W - PAD * 2) / (data.length - 1 || 1);
    const pts = data.map((v, i) => {
      const x = PAD + i * stepX;
      const y = PAD + (H - PAD * 2) * (1 - (v - min) / span);
      return [x, y] as const;
    });
    const lp = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    return { line: lp, area: `${lp} L${W - PAD},${H} L${PAD},${H} Z`, up: range.returnPct >= 0 };
  }, [d.symbol, d.price, range]);

  const stroke = up ? "var(--color-emerald)" : "var(--color-neg)";

  return (
    <Card>
      <CardHeader
        title="Price"
        subtitle={`${d.exchange} · ${d.currency} · delayed`}
        icon={<IconChart size={16} />}
        action={<Badge tone="info">Placeholder</Badge>}
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

        <div className="h-[260px] w-full">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id={`sec-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.20" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line
                key={g}
                x1={PAD}
                x2={W - PAD}
                y1={PAD + (H - PAD * 2) * g}
                y2={PAD + (H - PAD * 2) * g}
                stroke="var(--color-hairline)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={area} fill={`url(#sec-${gid})`} />
            <path
              d={line}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
}
