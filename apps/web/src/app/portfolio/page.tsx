/**
 * Portfolio page (Phase 2 · Backend B3). Loads the user's holdings through the
 * data seam (mock now, Postgres when DATA_SOURCE=db), derives the full view, and
 * renders. Holdings are editable (add/remove) and persist to the database.
 */
import { listHoldingsAction } from "@/server/actions/holdings";
import { buildPortfolio } from "@/data/portfolio-derive";
import { fetchHoldingQuotes } from "@/server/market/holding-quotes";
import { PortfolioHeader } from "@/components/portfolio/portfolio-header";
import { PerformanceChart } from "@/components/portfolio/performance-chart";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { AllocationBreakdown } from "@/components/portfolio/allocation-breakdown";
import { SectorAllocation } from "@/components/portfolio/sector-allocation";
import { Movers } from "@/components/portfolio/movers";
import { SectionLabel } from "@/components/ui/primitives";

// User-owned holdings: render per request so add/remove show immediately.
export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const raw = await listHoldingsAction();
  const quotes = await fetchHoldingQuotes(raw.map((h) => h.symbol));
  const view = buildPortfolio(raw, quotes);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Wealth</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Portfolio</h1>
        <p className="text-[13px] text-fg-subtle">Your holdings, valued live and saved to your account.</p>
      </div>

      <PortfolioHeader s={view.summary} />
      <PerformanceChart />
      <HoldingsTable holdings={view.holdings} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AllocationBreakdown assetAllocation={view.assetAllocation} />
        <SectorAllocation sectorAllocation={view.sectorAllocation} />
      </div>

      <Movers winners={view.movers.winners} losers={view.movers.losers} />
    </div>
  );
}
