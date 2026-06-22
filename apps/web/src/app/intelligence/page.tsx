/**
 * Advisor Intelligence Center (Phase 8). Synthesizes portfolio, market, risk,
 * screener, watchlist, and alert data into ranked, evidence-based insights.
 * Mock-data driven; no APIs, no auth, no backend.
 */
import { listHoldingsAction } from "@/server/actions/holdings";
import { buildPortfolio } from "@/data/portfolio-derive";
import { buildRiskAnalysis } from "@/data/risk-mock";
import { buildIntelligence } from "@/data/intelligence-mock";
import { IntelligenceClient } from "@/components/intelligence/intelligence-client";
import { SectionLabel } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function IntelligencePage() {
  const view = buildPortfolio(await listHoldingsAction());
  const risk = buildRiskAnalysis(view);
  const { insights, briefing } = buildIntelligence(view, risk);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Intelligence</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Advisor Intelligence Center</h1>
        <p className="text-[13px] text-fg-subtle">
          What deserves attention, why it matters, and what to consider next — synthesized from your data.
        </p>
      </div>

      <IntelligenceClient insights={insights} briefing={briefing} />
    </div>
  );
}
