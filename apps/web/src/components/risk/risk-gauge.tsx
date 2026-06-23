"use client";

/**
 * Composite-risk gauge — a half-donut that animates filling up to the score on
 * mount, with the number counting up. Higher score = more risk, so the fill is
 * a green→yellow→red gradient (the leading edge fades into the next color as the
 * score climbs), and the number is tinted to match the level. Common pattern in
 * financial dashboards. Respects prefers-reduced-motion.
 */
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";

const R = 84;
const ARC = Math.PI * R; // length of the semicircle stroke

/** Interpolated traffic-light color for a 0–100 score (green→yellow→red). */
export function riskColor(score: number): string {
  const s = Math.max(0, Math.min(100, score)) / 100;
  const hue = s <= 0.5 ? 145 - (145 - 52) * (s / 0.5) : 52 - (52 - 4) * ((s - 0.5) / 0.5);
  return `hsl(${Math.round(hue)} 72% 46%)`;
}

export function RiskGauge({
  score,
  width = 200,
  numberClass = "text-4xl",
}: {
  score: number;
  width?: number;
  numberClass?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const target = Math.max(0, Math.min(100, score)) / 100;
  const [fill, setFill] = useState(0);
  const [display, setDisplay] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setFill(target);
      setDisplay(score);
      setShown(true);
      return;
    }
    setShown(true);
    // Shoot up fast, then creep into the final value (credit-score style) — drive
    // both the arc fill and the number off one easeOutExpo loop so they stay synced.
    const dur = 2200;
    const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
    let start: number | null = null;
    let id = 0;
    const step = (t: number) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = easeOutExpo(p);
      setFill(target * e);
      setDisplay(Math.round(score * e));
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [score, target]);

  const color = riskColor(score);

  return (
    <div className="relative" style={{ width, height: width * 0.55 }}>
      <svg viewBox="0 0 200 110" className="h-full w-full">
        <defs>
          <linearGradient id={`risk-grad-${gid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(145 68% 42%)" />
            <stop offset="50%" stopColor="hsl(50 88% 52%)" />
            <stop offset="100%" stopColor="hsl(5 78% 52%)" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path d="M16 102 A84 84 0 0 1 184 102" fill="none" stroke="var(--color-inset)" strokeWidth="12" strokeLinecap="round" />
        {/* Animated fill */}
        <path
          d="M16 102 A84 84 0 0 1 184 102"
          fill="none"
          stroke={`url(#risk-grad-${gid})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={ARC}
          strokeDashoffset={ARC * (1 - fill)}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span
          className={cn("tnum font-semibold tracking-tight", numberClass)}
          style={{
            color,
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0) scale(1)" : "translateY(6px) scale(0.9)",
            transition: "opacity 600ms ease-out, transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {display}
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-fg-subtle">Composite Risk</span>
      </div>
    </div>
  );
}
