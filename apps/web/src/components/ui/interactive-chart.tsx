"use client";

/**
 * Interactive line chart — defined X/Y axes with tick labels + titles, gridlines,
 * and a hover crosshair that reads out the value (and time) at the cursor. Renders
 * at true pixel size (measured via ResizeObserver) so text stays crisp and the
 * crosshair math is exact. Supports multiple series (e.g. portfolio vs benchmark).
 *
 * Pure presentation: feed it `series` (numeric values) + per-point `xLabels`.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface ChartSeries {
  values: number[];
  color: string; // CSS color, e.g. "var(--color-emerald)"
  label: string;
  dashed?: boolean;
  area?: boolean; // gradient fill under the line (primary series)
  width?: number;
}

export interface InteractiveChartProps {
  series: ChartSeries[];
  xLabels: string[]; // one label per data index (used by axis + tooltip)
  height?: number;
  yTicks?: number;
  xTickCount?: number;
  yFormat?: (v: number) => string;
  yAxisTitle?: string;
  xAxisTitle?: string;
}

const M = { top: 12, right: 16, bottom: 38, left: 60 };

export function InteractiveChart({
  series,
  xLabels,
  height = 280,
  yTicks = 5,
  xTickCount = 6,
  yFormat = (v) => v.toFixed(2),
  yAxisTitle,
  xAxisTitle,
}: InteractiveChartProps) {
  const gid = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(Math.max(280, e.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = series[0]?.values.length ?? 0;
  const plotW = Math.max(1, width - M.left - M.right);
  const plotH = Math.max(1, height - M.top - M.bottom);

  const { domainMin, domainMax } = useMemo(() => {
    const all = series.flatMap((s) => s.values);
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const pad = (hi - lo || Math.abs(hi) || 1) * 0.06;
    return { domainMin: lo - pad, domainMax: hi + pad };
  }, [series]);

  const span = domainMax - domainMin || 1;
  const xAt = (i: number) => M.left + (plotW * i) / (n - 1 || 1);
  const yAt = (v: number) => M.top + plotH * (1 - (v - domainMin) / span);

  const yTickVals = useMemo(
    () => Array.from({ length: yTicks }, (_, i) => domainMin + (span * i) / (yTicks - 1)),
    [domainMin, span, yTicks],
  );

  const xTickIdx = useMemo(() => {
    if (n <= 1) return [0];
    const count = Math.min(xTickCount, n);
    return Array.from({ length: count }, (_, i) => Math.round((i * (n - 1)) / (count - 1)));
  }, [n, xTickCount]);

  function paths(values: number[]) {
    const line = values
      .map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(v).toFixed(2)}`)
      .join(" ");
    const area = `${line} L${xAt(n - 1).toFixed(2)},${(M.top + plotH).toFixed(2)} L${xAt(0).toFixed(2)},${(M.top + plotH).toFixed(2)} Z`;
    return { line, area };
  }

  function onMove(e: React.PointerEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || n === 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round(((x - M.left) / (plotW || 1)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, idx)));
  }

  const hoverX = hover != null ? xAt(hover) : 0;
  const tooltipLeftPct = width > 0 ? (hoverX / width) * 100 : 0;
  const flip = tooltipLeftPct > 62;

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block touch-none select-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, si) =>
            s.area ? (
              <linearGradient key={si} id={`ic-${gid}-${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.20" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ) : null,
          )}
        </defs>

        {/* Y gridlines + labels */}
        {yTickVals.map((v, i) => {
          const y = yAt(v);
          return (
            <g key={i}>
              <line x1={M.left} x2={width - M.right} y1={y} y2={y} stroke="var(--color-hairline)" strokeWidth={1} />
              <text x={M.left - 8} y={y + 3} textAnchor="end" className="tnum" fontSize={10} fill="var(--color-fg-subtle)">
                {yFormat(v)}
              </text>
            </g>
          );
        })}

        {/* Axis lines */}
        <line x1={M.left} x2={M.left} y1={M.top} y2={M.top + plotH} stroke="var(--color-line-strong)" strokeWidth={1} />
        <line x1={M.left} x2={width - M.right} y1={M.top + plotH} y2={M.top + plotH} stroke="var(--color-line-strong)" strokeWidth={1} />

        {/* X tick labels */}
        {xTickIdx.map((idx) => (
          <text key={idx} x={xAt(idx)} y={M.top + plotH + 16} textAnchor="middle" fontSize={10} fill="var(--color-fg-subtle)">
            {xLabels[idx] ?? ""}
          </text>
        ))}

        {/* Series */}
        {series.map((s, si) => {
          const { line, area } = paths(s.values);
          return (
            <g key={si}>
              {s.area && <path d={area} fill={`url(#ic-${gid}-${si})`} />}
              <path
                d={line}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width ?? 2}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}

        {/* Crosshair */}
        {hover != null && (
          <g pointerEvents="none">
            <line x1={hoverX} x2={hoverX} y1={M.top} y2={M.top + plotH} stroke="var(--color-fg-subtle)" strokeWidth={1} strokeDasharray="3 3" />
            {series.map((s, si) => (
              <circle key={si} cx={hoverX} cy={yAt(s.values[hover]!)} r={3.5} fill="var(--color-surface)" stroke={s.color} strokeWidth={2} />
            ))}
          </g>
        )}

        {/* Axis titles */}
        {yAxisTitle && (
          <text transform={`translate(14 ${M.top + plotH / 2}) rotate(-90)`} textAnchor="middle" fontSize={10} fill="var(--color-fg-subtle)" letterSpacing="0.08em">
            {yAxisTitle.toUpperCase()}
          </text>
        )}
        {xAxisTitle && (
          <text x={M.left + plotW / 2} y={height - 4} textAnchor="middle" fontSize={10} fill="var(--color-fg-subtle)" letterSpacing="0.08em">
            {xAxisTitle.toUpperCase()}
          </text>
        )}
      </svg>

      {/* Tooltip */}
      {hover != null && (
        <div
          className="pointer-events-none absolute top-1 z-10 min-w-[120px] rounded-[6px] border border-hairline bg-surface-2/95 px-2.5 py-2 text-[11px] shadow-[var(--shadow-elevation)] backdrop-blur-sm"
          style={{ left: `${tooltipLeftPct}%`, transform: flip ? "translateX(-100%) translateX(-10px)" : "translateX(10px)" }}
        >
          <div className="mb-1 font-medium text-fg-subtle">{xLabels[hover] ?? ""}</div>
          {series.map((s, si) => (
            <div key={si} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-fg-muted">
                <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="tnum font-semibold text-fg">{yFormat(s.values[hover]!)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
