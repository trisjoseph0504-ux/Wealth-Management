"use client";

/**
 * Composite-risk gauge — a half-donut that animates filling up to the score on
 * mount, with the number counting up. Higher score = more risk, so the fill is
 * a green→yellow→red gradient (the leading edge fades into the next color as the
 * score climbs), and the number is tinted to match the level. Common pattern in
 * financial dashboards. Respects prefers-reduced-motion.
 */
import { useEffect, useState } from "react";

const R = 84;
const ARC = Math.PI * R; // length of the semicircle stroke

/** Interpolated traffic-light color for a 0–100 score (green→yellow→red). */
export function riskColor(score: number): string {
  const s = Math.max(0, Math.min(100, score)) / 100;
  const hue = s <= 0.5 ? 145 - (145 - 52) * (s / 0.5) : 52 - (52 - 4) * ((s - 0.5) / 0.5);
  return `hsl(${Math.round(hue)} 72% 46%)`;
}

export function RiskGauge({ score }: { score: number }) {
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
    const rafShow = requestAnimationFrame(() => {
      setShown(true);
      setFill(target); // CSS transition tweens the arc fill
    });
    // Count the number up with an easeOutCubic over ~950ms.
    const dur = 950;
    let start: number | null = null;
    let id = 0;
    const step = (t: number) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(score * eased));
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafShow);
      cancelAnimationFrame(id);
    };
  }, [score, target]);

  const color = riskColor(score);

  return (
    <div className="relative h-[110px] w-[200px]">
      <svg viewBox="0 0 200 110" className="h-full w-full">
        <defs>
          <linearGradient id="risk-grad" x1="0" y1="0" x2="1" y2="0">
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
          stroke="url(#risk-grad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={ARC}
          strokeDashoffset={ARC * (1 - fill)}
          style={{ transition: "stroke-dashoffset 1050ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span
          className="tnum text-4xl font-semibold tracking-tight"
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
