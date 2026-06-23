/**
 * Markets page. Major stock names are valued LIVE from Finnhub (the same free
 * quote feed the portfolio uses), with sectors/movers/heatmap recomputed from
 * those real numbers. Index levels stay indicative — index data isn't on the
 * free tier. force-dynamic so quotes refresh on visit (cached ~3 min server-side).
 */
import { getLiveMarkets } from "@/server/market/markets-live";
import { IndexOverview } from "@/components/markets/index-overview";
import { SectorPerformance } from "@/components/markets/sector-performance";
import { MarketMovers } from "@/components/markets/market-movers";
import { MarketHeatmap } from "@/components/markets/market-heatmap";
import { SectionLabel } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function MarketsPage() {
  const m = await getLiveMarkets();

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Markets</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Market Overview</h1>
        <p className="text-[13px] text-fg-subtle">
          {m.liveCount > 0
            ? `Live prices for ${m.liveCount} major names. Index levels are indicative.`
            : "Indicative prices across the tracked universe."}
        </p>
      </div>

      <IndexOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectorPerformance sectorPerformance={m.sectorPerformance} />
        <MarketMovers movers={m.movers} />
      </div>

      <MarketHeatmap heatmap={m.heatmap} />
    </div>
  );
}
