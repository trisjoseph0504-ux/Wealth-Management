/** Risk score summary — composite gauge, tier, and headline risk reads. */
import type { ReactNode } from "react";
import type { RiskModel, RiskTier } from "@/data/risk-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";
import { Badge, SectionLabel } from "@/components/ui/primitives";
import { IconShield } from "@/components/ui/icons";

const TIER_TONE: Record<RiskTier, "emerald" | "info" | "warn" | "danger"> = {
  Conservative: "emerald",
  Balanced: "info",
  Growth: "warn",
  Aggressive: "danger",
};
const TIER_COLOR: Record<RiskTier, string> = {
  Conservative: "var(--color-pos)",
  Balanced: "var(--color-info)",
  Growth: "var(--color-warn)",
  Aggressive: "var(--color-neg)",
};

function Gauge({ score, color }: { score: number; color: string }) {
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  return (
    <div className="relative h-[110px] w-[200px]">
      <svg viewBox="0 0 200 110" className="h-full w-full">
        <path d="M16 102 A84 84 0 0 1 184 102" fill="none" stroke="var(--color-inset)" strokeWidth="12" strokeLinecap="round" />
        <path
          d="M16 102 A84 84 0 0 1 184 102"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={Math.PI * 84}
          strokeDashoffset={Math.PI * 84 * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="tnum text-4xl font-semibold tracking-tight text-fg">{score}</span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-fg-subtle">Composite Risk</span>
      </div>
    </div>
  );
}

export function RiskSummary({ model }: { model: RiskModel }) {
  const m = model;
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Portfolio Risk Score"
        subtitle={`Lewis Family Office · ${m.asOf}`}
        icon={<IconShield size={16} />}
        action={<Badge tone={TIER_TONE[m.riskTier]}>{m.riskTier}</Badge>}
      />
      <div className="grid gap-px bg-hairline lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col items-center justify-center gap-1 bg-surface px-6 py-6">
          <Gauge score={m.riskScore} color={TIER_COLOR[m.riskTier]} />
          <p className="mt-1 max-w-[15rem] text-center text-[11px] leading-relaxed text-fg-subtle">
            Blends beta, volatility, concentration, and drawdown into a single 0–100 read.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3">
          <Tile label="Portfolio Beta">
            <span className="tnum">{m.portfolioBeta.toFixed(2)}</span>
          </Tile>
          <Tile label="Volatility" hint="annualized">
            <span className="tnum">{m.portfolioVol.toFixed(1)}%</span>
          </Tile>
          <Tile label="Sharpe Ratio">
            <span className="tnum">{m.sharpe.toFixed(2)}</span>
          </Tile>
          <Tile label="Max Drawdown">
            <Percent value={m.maxDrawdownPct} />
          </Tile>
          <Tile label="1-Day VaR (95%)">
            <Money value={m.var95Usd} compact className="text-neg" />
          </Tile>
          <Tile label="VaR (95%)" hint="of portfolio">
            <span className="tnum text-neg">−{m.var95Pct.toFixed(2)}%</span>
          </Tile>
        </div>
      </div>
    </Card>
  );
}

function Tile({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="bg-surface px-4 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <SectionLabel>{label}</SectionLabel>
        {hint && <span className="text-[10px] text-fg-subtle">{hint}</span>}
      </div>
      <div className="mt-1.5 text-xl font-semibold tracking-tight text-fg">{children}</div>
    </div>
  );
}
