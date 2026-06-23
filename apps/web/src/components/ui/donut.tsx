/**
 * Allocation donut — SVG, token-colored, color-blind-safe emerald→teal→slate
 * ramp (no yellow, per DESIGN_SYSTEM.md §6). Center renders a supplied label.
 */
import type { ReactNode } from "react";
// NOTE: pure SVG, no hooks → safe to render as a Server Component.

export interface DonutDatum {
  key: string;
  label: string;
  value: number;
}

/**
 * Categorical palette for allocation slices. Broadened from the original
 * emerald→teal→slate ramp into a wider cool-toned set (greens, teals, cyans,
 * blues, indigos, violets, magentas, slates), interleaved so adjacent slices
 * contrast. Still never introduces yellow/gold (DESIGN_SYSTEM.md §6).
 */
export const ALLOCATION_COLORS = [
  "#10b981", // emerald
  "#3b82c4", // blue
  "#b5589f", // magenta
  "#2bb39b", // teal
  "#6d6fd4", // indigo
  "#cf6a90", // rose
  "#1aa6b5", // cyan
  "#9560c4", // violet
  "#5183b3", // steel blue
  "#3f9bb0", // teal-blue
  "#6e8ba8", // slate
  "#8a93a3", // slate gray
] as const;

/**
 * Color for the slice at `index`. Uses the curated palette first; beyond it,
 * spreads further hues by the golden angle (dodging the excluded warm
 * yellow/gold band) so any number of holdings stays visually distinct.
 */
export function colorAt(index: number): string {
  if (index < ALLOCATION_COLORS.length) return ALLOCATION_COLORS[index]!;
  let hue = (index * 137.508) % 360; // golden angle → well-spread hues
  if (hue >= 40 && hue <= 75) hue = (hue + 60) % 360; // skip yellow/gold
  return `hsl(${Math.round(hue)} 45% 55%)`;
}

export function Donut({
  data,
  size = 168,
  thickness = 16,
  center,
}: {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  center?: ReactNode;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;

  let offset = 0;
  const gap = 1.5; // px gap between segments for a crisp institutional look

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--color-inset)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const len = Math.max(frac * c - gap, 0);
          const seg = (
            <circle
              key={d.key}
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={colorAt(i)}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += frac * c;
          return seg;
        })}
      </svg>
      {center && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {center}
        </div>
      )}
    </div>
  );
}
