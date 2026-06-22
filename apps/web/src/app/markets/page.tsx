/**
 * Markets page (Phase 3). Composition only, mock-data driven. No APIs, no auth.
 */
import { IndexOverview } from "@/components/markets/index-overview";
import { SectorPerformance } from "@/components/markets/sector-performance";
import { MarketMovers } from "@/components/markets/market-movers";
import { MarketHeatmap } from "@/components/markets/market-heatmap";
import { SectionLabel } from "@/components/ui/primitives";

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Markets</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Market Overview</h1>
        <p className="text-[13px] text-fg-subtle">
          Indices, sectors, and movers across the tracked universe.
        </p>
      </div>

      <IndexOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectorPerformance />
        <MarketMovers />
      </div>

      <MarketHeatmap />
    </div>
  );
}
