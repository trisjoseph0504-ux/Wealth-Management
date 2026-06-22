/**
 * Risk snapshot — Phase 1 placeholder metrics over mock data. A semicircular
 * gauge plus key risk figures. Methodology labels are explicit (no false
 * precision); real computation arrives in Phase 4 (ARCHITECTURE §4).
 */
import type { ReactNode } from "react";
import type { RiskSnapshot as RiskSnapshotData } from "@/data/mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";
import { Badge } from "@/components/ui/primitives";
import { IconShield } from "@/components/ui/icons";

function RiskGauge({ score }: { score: number }) {
  // Semicircle gauge, 180° sweep. Token-colored emerald arc; no yellow zone.
  const r = 56;
  const c = Math.PI * r; // half-circumference
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  return (
    <div className="relative h-[78px] w-[140px]">
      <svg viewBox="0 0 140 78" className="h-full w-full">
        <path d="M12 72 A58 58 0 0 1 128 72" fill="none" stroke="var(--color-inset)" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M12 72 A58 58 0 0 1 128 72"
          fill="none"
          stroke="var(--color-emerald)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="tnum text-2xl font-semibold text-fg">{score}</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-fg-subtle">Risk Score</span>
      </div>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="rounded-[8px] border border-hairline bg-inset/50 px-3.5 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-fg-subtle">{label}</p>
      <p className="mt-1 text-[15px] font-semibold tracking-tight text-fg">{value}</p>
      {note && <p className="text-[10px] text-fg-subtle">{note}</p>}
    </div>
  );
}

export function RiskSnapshot({ risk }: { risk: RiskSnapshotData }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Risk Snapshot"
        subtitle="Trailing 12 months"
        icon={<IconShield size={16} />}
        action={<Badge tone="info">{risk.tier}</Badge>}
      />
      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="flex items-center justify-center">
          <RiskGauge score={risk.riskScore} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Metric label="Volatility" value={<span className="tnum">{risk.volatilityPct.toFixed(1)}%</span>} note="Annualized σ" />
          <Metric label="Beta" value={<span className="tnum">{risk.beta.toFixed(2)}</span>} note="vs S&P 500" />
          <Metric label="Sharpe" value={<span className="tnum">{risk.sharpe.toFixed(2)}</span>} note="Risk-adjusted" />
          <Metric label="Max Drawdown" value={<Percent value={risk.maxDrawdownPct} />} note="Peak-to-trough" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-hairline bg-inset/50 px-3.5 py-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-fg-subtle">Value at Risk (95%)</p>
            <p className="text-[10px] text-fg-subtle">1-day, parametric</p>
          </div>
          <Money value={risk.var95Usd} className="text-[15px] font-semibold text-neg" />
        </div>
      </div>
    </Card>
  );
}
