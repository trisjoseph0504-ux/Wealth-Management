/** Risk score summary — composite gauge, tier, and headline risk reads. */
import type { ReactNode } from "react";
import type { RiskModel, RiskTier } from "@/data/risk-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";
import { Badge, SectionLabel } from "@/components/ui/primitives";
import { IconShield } from "@/components/ui/icons";
import { InfoPopover, type InfoContent } from "@/components/ui/info-popover";
import { RiskGauge } from "@/components/risk/risk-gauge";

const RATIO_INFO: Record<string, InfoContent> = {
  beta: {
    title: "Portfolio Beta",
    what: "How much your portfolio tends to move relative to the overall market.",
    good: "1.0 moves with the market; below 1 is steadier, above 1 swings more. Match it to your risk appetite.",
    formula: "β = Σ (weightᵢ × betaᵢ) — the value-weighted average of each holding's beta.",
  },
  vol: {
    title: "Volatility (annualized)",
    what: "How much the portfolio's value swings up and down over a year.",
    good: "Lower is calmer. A diversified stock portfolio is often ~12–20%.",
    formula: "σ = √(wᵀ Σ w), built from each holding's volatility and how they correlate.",
  },
  sharpe: {
    title: "Sharpe Ratio",
    what: "How much return you earn for the risk you take.",
    good: "Above 1 is good, above 2 is excellent, below 1 is weak.",
    formula: "(portfolio return − risk-free rate) ÷ volatility.",
  },
  drawdown: {
    title: "Max Drawdown",
    what: "The worst peak-to-bottom drop the portfolio has experienced.",
    good: "Closer to 0% is better; −10% to −20% is common for stock portfolios.",
    formula: "the most negative (value − prior peak) ÷ prior peak, over time.",
  },
  varUsd: {
    title: "1-Day VaR (95%)",
    what: "Value at Risk — on a rough day (the worst 1 in 20), the dollar loss you wouldn't expect to exceed.",
    good: "Smaller is safer; it grows with portfolio size and volatility.",
    formula: "1.645 × daily volatility × portfolio value.",
  },
  varPct: {
    title: "VaR (95%) of portfolio",
    what: "The same worst-1-in-20-day loss, shown as a percentage of the portfolio.",
    good: "Smaller is safer; driven by how volatile your holdings are.",
    formula: "1.645 × daily volatility, where daily vol = annual vol ÷ √252.",
  },
};

const TIER_TONE: Record<RiskTier, "emerald" | "info" | "warn" | "danger"> = {
  Conservative: "emerald",
  Balanced: "info",
  Growth: "warn",
  Aggressive: "danger",
};
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
          <RiskGauge score={m.riskScore} />
          <p className="mt-1 max-w-[15rem] text-center text-[11px] leading-relaxed text-fg-subtle">
            Blends beta, volatility, concentration, and drawdown into a single 0–100 read.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3">
          <Tile label="Portfolio Beta" info={RATIO_INFO.beta}>
            <span className="tnum">{m.portfolioBeta.toFixed(2)}</span>
          </Tile>
          <Tile label="Volatility" hint="annualized" info={RATIO_INFO.vol}>
            <span className="tnum">{m.portfolioVol.toFixed(1)}%</span>
          </Tile>
          <Tile label="Sharpe Ratio" info={RATIO_INFO.sharpe}>
            <span className="tnum">{m.sharpe.toFixed(2)}</span>
          </Tile>
          <Tile label="Max Drawdown" info={RATIO_INFO.drawdown}>
            <Percent value={m.maxDrawdownPct} />
          </Tile>
          <Tile label="1-Day VaR (95%)" info={RATIO_INFO.varUsd}>
            <Money value={m.var95Usd} compact className="text-neg" />
          </Tile>
          <Tile label="VaR (95%)" hint="of portfolio" info={RATIO_INFO.varPct}>
            <span className="tnum text-neg">−{m.var95Pct.toFixed(2)}%</span>
          </Tile>
        </div>
      </div>
    </Card>
  );
}

function Tile({
  label,
  hint,
  info,
  children,
}: {
  label: string;
  hint?: string;
  info?: InfoContent;
  children: ReactNode;
}) {
  return (
    <div className="bg-surface px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1">
          <SectionLabel>{label}</SectionLabel>
          {info && <InfoPopover {...info} />}
        </span>
        {hint && <span className="text-[10px] text-fg-subtle">{hint}</span>}
      </div>
      <div className="mt-1.5 text-xl font-semibold tracking-tight text-fg">{children}</div>
    </div>
  );
}
