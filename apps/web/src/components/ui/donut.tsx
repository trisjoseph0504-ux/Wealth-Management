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

/** Categorical ramp: emerald → teal → slate. Never introduces gold/yellow. */
export const ALLOCATION_COLORS = [
  "#10b981",
  "#2bb39b",
  "#3f9bb0",
  "#5183b3",
  "#6e8ba8",
  "#8a93a3",
] as const;

export function colorAt(index: number): string {
  return ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]!;
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
