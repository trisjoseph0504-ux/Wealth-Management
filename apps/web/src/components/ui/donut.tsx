"use client";

/**
 * Allocation donut — SVG, token-colored, color-blind-safe emerald→teal→slate
 * ramp (no yellow, per DESIGN_SYSTEM.md §6). Center renders a supplied label.
 * Hovering or tapping a slice reveals which holding it is (label + sub + share).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { colorAt, type DonutDatum } from "@/components/ui/donut-colors";

export type { DonutDatum } from "@/components/ui/donut-colors";

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
  const gap = 1.5; // px gap between segments for a crisp institutional look

  const [active, setActive] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: size / 2, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  function track(e: React.PointerEvent) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  // Tap/click anywhere outside the donut dismisses a tapped-open tooltip (mobile
  // has no "pointer leave", so without this there's no way to clear it).
  useEffect(() => {
    if (active == null) return;
    const onDocDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [active]);

  // Precompute each segment's dash length + offset.
  let offset = 0;
  const segs = data.map((d, i) => {
    const frac = d.value / total;
    const len = Math.max(frac * c - gap, 0);
    const seg = { d, i, len, dashoffset: -offset };
    offset += frac * c;
    return seg;
  });

  const hot = active != null ? data[active] : null;

  return (
    <div ref={wrapRef} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--color-inset)" strokeWidth={thickness} />
        {/* Visible segments */}
        {segs.map(({ d, i, len, dashoffset }) => (
          <circle
            key={d.key}
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={colorAt(i)}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={dashoffset}
            strokeLinecap="butt"
            opacity={active == null || active === i ? 1 : 0.4}
            style={{ transition: "opacity 120ms" }}
          />
        ))}
        {/* Transparent, thicker hit areas for easy hover/tap */}
        {segs.map(({ d, i, len, dashoffset }) => (
          <circle
            key={`hit-${d.key}`}
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="transparent"
            strokeWidth={thickness + 14}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={dashoffset}
            strokeLinecap="butt"
            pointerEvents="stroke"
            style={{ cursor: "pointer" }}
            onPointerEnter={(e) => {
              setActive(i);
              track(e);
            }}
            onPointerMove={(e) => {
              setActive(i);
              track(e);
            }}
            onPointerDown={(e) => {
              setActive(i);
              track(e);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setActive(null);
            }}
          />
        ))}
      </svg>
      {center && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {center}
        </div>
      )}
      {hot && active != null && (
        <div
          className="pointer-events-none absolute z-20 whitespace-nowrap rounded-[6px] border border-hairline bg-surface-2/95 px-2 py-1.5 text-[11px] shadow-[var(--shadow-elevation)] backdrop-blur-sm"
          style={{ left: pos.x, top: pos.y, transform: "translate(-50%, calc(-100% - 8px))" }}
        >
          <span className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-[2px]" style={{ background: colorAt(active) }} />
            <span className="font-semibold text-fg">{hot.label}</span>
            <span className="tnum text-fg-muted">{hot.value.toFixed(1)}%</span>
          </span>
          {hot.sub && <span className="mt-0.5 block text-fg-subtle">{hot.sub}</span>}
        </div>
      )}
    </div>
  );
}
