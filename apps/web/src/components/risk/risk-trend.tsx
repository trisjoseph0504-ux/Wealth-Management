/** Risk trend — composite risk score over the trailing 12 months (static SVG). */
import type { RiskTrendPoint } from "@/data/risk-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { IconActivity } from "@/components/ui/icons";

const W = 760;
const H = 200;
const PAD = { top: 12, right: 10, bottom: 22, left: 28 };

export function RiskTrend({ trend }: { trend: RiskTrendPoint[] }) {
  const data = trend;
  const scores = data.map((d) => d.score);
  const start = scores[0]!;
  const end = scores[scores.length - 1]!;
  const delta = end - start;

  const min = Math.max(0, Math.min(...scores) - 8);
  const max = Math.min(100, Math.max(...scores) + 8);
  const span = max - min || 1;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const stepX = plotW / (data.length - 1 || 1);

  const pts = data.map((d, i) => {
    const x = PAD.left + i * stepX;
    const y = PAD.top + plotH * (1 - (d.score - min) / span);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${PAD.left + plotW},${PAD.top + plotH} L${PAD.left},${PAD.top + plotH} Z`;

  // Threshold guide for the "Growth → Aggressive" boundary (75).
  const threshY = PAD.top + plotH * (1 - (75 - min) / span);
  const showThresh = 75 >= min && 75 <= max;

  return (
    <Card>
      <CardHeader
        title="Risk Trend"
        subtitle="Composite score · trailing 12 months"
        icon={<IconActivity size={16} />}
        action={
          <Badge tone={delta > 0 ? "warn" : delta < 0 ? "emerald" : "neutral"}>
            {delta > 0 ? "+" : ""}
            {delta} vs. 12M ago
          </Badge>
        }
      />
      <div className="px-5 py-5">
        <div className="mb-3 flex items-end gap-3">
          <span className="tnum text-2xl font-semibold tracking-tight text-fg">{end}</span>
          <span className="mb-1 text-[12px] text-fg-subtle">current composite risk score</span>
        </div>
        <div className="h-[200px] w-full">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="risk-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-warn)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--color-warn)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {showThresh && (
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={threshY}
                y2={threshY}
                stroke="var(--color-neg)"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.5}
                vectorEffect="non-scaling-stroke"
              />
            )}
            <path d={area} fill="url(#risk-trend)" />
            <path
              d={line}
              fill="none"
              stroke="var(--color-warn)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="mt-1 flex justify-between pl-6 text-[10px] text-fg-subtle">
          {data.map((d, i) => (
            <span key={d.label} className={i % 2 !== 0 ? "hidden sm:inline" : ""}>
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
