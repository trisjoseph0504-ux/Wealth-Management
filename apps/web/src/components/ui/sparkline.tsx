"use client";

/**
 * Dependency-free SVG sparkline. Phase 1 keeps charts in-house and token-colored
 * (DESIGN_SYSTEM.md §6 — no library default palettes). Real price charts move to
 * TradingView Lightweight Charts in Phase 3; analytics to Visx.
 *
 * Client component: uses useId for an SSR-stable, collision-free gradient id.
 */
import { useId } from "react";

export function Sparkline({
  data,
  width = 96,
  height = 28,
  tone = "auto",
  strokeWidth = 1.5,
  fill = true,
  fluid = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  tone?: "auto" | "pos" | "neg" | "flat";
  strokeWidth?: number;
  fill?: boolean;
  /** Stretch to the container width (viewBox coords stay `width`×`height`). */
  fluid?: boolean;
}) {
  // Strip colons from React's useId output so it is safe inside url(#…).
  const id = useId().replace(/:/g, "");
  if (data.length < 2) return <svg width={width} height={height} aria-hidden />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = strokeWidth;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + (height - pad * 2) * (1 - (v - min) / span);
    return [x, y] as const;
  });

  const dir =
    tone !== "auto"
      ? tone
      : data[data.length - 1]! >= data[0]!
        ? "pos"
        : "neg";
  const color =
    dir === "pos"
      ? "var(--color-emerald)"
      : dir === "neg"
        ? "var(--color-neg)"
        : "var(--color-flat)";

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={fluid ? "100%" : width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={fluid ? "none" : "xMidYMid meet"}
      aria-hidden
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#spark-${id})`} />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
