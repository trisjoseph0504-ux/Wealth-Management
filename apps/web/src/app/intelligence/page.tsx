/**
 * Advisor Intelligence Center (Phase 8 / B6). Leads with real US market + company
 * news (Finnhub), each headline paired with a rules-based explanation of its
 * market/sector impact and watchlist names flagged. Below that, portfolio-derived
 * insights + the daily briefing (live from holdings/risk). Informational only.
 */
import { listHoldingsAction } from "@/server/actions/holdings";
import { listWatchlistsAction } from "@/server/actions/watchlists";
import { buildPortfolio } from "@/data/portfolio-derive";
import { buildRiskAnalysis } from "@/data/risk-mock";
import { buildIntelligence } from "@/data/intelligence-mock";
import { getMarketNews, getCompanyNews } from "@/server/market/news";
import { analyzeNews } from "@/data/news-analysis";
import { NewsImpactFeed } from "@/components/intelligence/news-impact";
import { IntelligenceClient } from "@/components/intelligence/intelligence-client";
import { SectionLabel } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function IntelligencePage() {
  const view = buildPortfolio(await listHoldingsAction());
  const risk = buildRiskAnalysis(view);
  const { insights, briefing } = buildIntelligence(view, risk);

  // Real news: general market + company news for watchlist symbols (capped for rate limits).
  const watchlists = await listWatchlistsAction();
  const symbols = [...new Set(watchlists.flatMap((w) => w.items.map((i) => i.symbol)))].slice(0, 6);
  const [general, ...company] = await Promise.all([
    getMarketNews(),
    ...symbols.map((s) => getCompanyNews(s)),
  ]);
  const news = analyzeNews([...general, ...company.flat()], symbols);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Intelligence</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Advisor Intelligence Center</h1>
        <p className="text-[13px] text-fg-subtle">
          Live market news with the why &amp; how it moves the market — plus insights synthesized from your data.
        </p>
      </div>

      <NewsImpactFeed items={news} />

      <IntelligenceClient insights={insights} briefing={briefing} />
    </div>
  );
}
