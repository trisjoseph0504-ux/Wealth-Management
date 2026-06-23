/**
 * Risk Analytics page (Phase 6 / Backend B4). Portfolio-level risk intelligence,
 * derived live from the user's actual holdings (data seam → mock or Postgres).
 * Add or remove a position and every metric here recomputes.
 */
import { listHoldingsAction } from "@/server/actions/holdings";
import { buildPortfolio } from "@/data/portfolio-derive";
import { fetchHoldingQuotes } from "@/server/market/holding-quotes";
import { buildRiskAnalysis, buildRebalanceAdvice } from "@/data/risk-mock";
import { RiskSummary } from "@/components/risk/risk-summary";
import { RebalanceAlert } from "@/components/risk/rebalance-alert";
import { RiskTrend } from "@/components/risk/risk-trend";
import { Concentration } from "@/components/risk/concentration";
import { SectorExposure } from "@/components/risk/sector-exposure";
import { CorrelationMatrix } from "@/components/risk/correlation-matrix";
import { ScenarioAnalysis } from "@/components/risk/scenario-analysis";
import { Card } from "@/components/ui/card";
import { EmptyState, SectionLabel } from "@/components/ui/primitives";
import { IconShield } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function RiskPage() {
  const raw = await listHoldingsAction();
  const quotes = await fetchHoldingQuotes(raw.map((h) => h.symbol));
  const view = buildPortfolio(raw, quotes);
  const risk = buildRiskAnalysis(view);
  const rebalance = buildRebalanceAdvice(view, risk);
  const hasData = risk.holdingRisks.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Intelligence</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Risk Analytics</h1>
        <p className="text-[13px] text-fg-subtle">
          Portfolio-level risk intelligence and decision support across the Lewis Family Office.
        </p>
      </div>

      {!hasData ? (
        <Card>
          <EmptyState
            icon={<IconShield size={18} />}
            title="No risk data available"
            description="Risk analytics require at least one funded holding. Once positions are added, beta, volatility, concentration, and stress tests populate here."
          />
        </Card>
      ) : (
        <>
          {rebalance && <RebalanceAlert advice={rebalance} />}
          <RiskSummary model={risk.riskModel} />
          <RiskTrend trend={risk.riskTrend} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Concentration concentration={risk.concentration} holdings={risk.concentrationHoldings} />
            <SectorExposure sectorAllocation={view.sectorAllocation} />
          </div>
          <CorrelationMatrix matrix={risk.correlationMatrix} />
          <ScenarioAnalysis scenarios={risk.scenarios} portfolioValue={risk.riskModel.portfolioValue} />
        </>
      )}
    </div>
  );
}
