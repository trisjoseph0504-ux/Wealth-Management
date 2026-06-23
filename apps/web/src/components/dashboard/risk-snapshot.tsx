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
import { RiskGauge } from "@/components/risk/risk-gauge";

// Same tier→tone mapping as the Risk Analytics page, so a hot book reads red here too.
const TIER_TONE: Record<string, "emerald" | "info" | "warn" | "danger"> = {
  Conservative: "emerald",
  Balanced: "info",
  Growth: "warn",
  Aggressive: "danger",
};

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
        action={<Badge tone={TIER_TONE[risk.tier] ?? "info"}>{risk.tier}</Badge>}
      />
      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="flex items-center justify-center pt-1">
          <RiskGauge score={risk.riskScore} width={168} numberClass="text-3xl" />
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
