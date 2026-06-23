/**
 * Home dashboard (Phase 1 / Backend B4). The portfolio hero, allocation, and risk
 * snapshot are derived LIVE from the user's holdings (data seam → Postgres), so
 * edits on the Portfolio tab flow straight through here. Market/watchlist panels
 * remain illustrative mock. force-dynamic → recomputed on every visit.
 */
import { listHoldingsAction } from "@/server/actions/holdings";
import { buildPortfolio } from "@/data/portfolio-derive";
import { fetchHoldingQuotes } from "@/server/market/holding-quotes";
import { buildRiskAnalysis } from "@/data/risk-mock";
import { buildMarketCommentary } from "@/data/commentary";
import { portfolio as demoTrend, type PortfolioSummary, type RiskSnapshot as RiskSnapshotData } from "@/data/mock";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { AllocationSection } from "@/components/dashboard/allocation-section";
import { WatchlistPreview } from "@/components/dashboard/watchlist-preview";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { AiCommentary } from "@/components/dashboard/ai-commentary";
import { RiskSnapshot } from "@/components/dashboard/risk-snapshot";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { SectionLabel } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const raw = await listHoldingsAction();
  const quotes = await fetchHoldingQuotes(raw.map((h) => h.symbol));
  const view = buildPortfolio(raw, quotes);
  const risk = buildRiskAnalysis(view);
  const s = view.summary;

  // Greeting follows Central time (CST/CDT) at request time (page is force-dynamic).
  const hourCT =
    Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "2-digit", hour12: false }).format(new Date())) % 24;
  const greeting = hourCT < 12 ? "Good morning" : hourCT < 18 ? "Good afternoon" : "Good evening";

  const p: PortfolioSummary = {
    totalValueUsd: s.totalValue,
    dayChangeUsd: s.dayChangeUsd,
    dayChangePct: s.dayChangePct,
    totalGainUsd: s.totalGain,
    totalGainPct: s.totalGainPct,
    cashUsd: s.cash,
    buyingPowerUsd: s.cash * 2, // margin (illustrative)
    asOf: s.asOf,
    valueTrend: s.totalValue > 0 ? demoTrend.valueTrend : [0, 0, 0, 0, 0, 0, 0], // flat when unfunded
  };

  const m = risk.riskModel;
  const riskSnapshot: RiskSnapshotData = {
    riskScore: m.riskScore,
    tier: m.riskTier,
    volatilityPct: m.portfolioVol,
    beta: m.portfolioBeta,
    sharpe: m.sharpe,
    maxDrawdownPct: m.maxDrawdownPct,
    var95Usd: m.var95Usd,
  };

  return (
    <div className="space-y-6">
      {/* Page heading (visible on mobile where the topbar title is hidden) */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <SectionLabel>Overview</SectionLabel>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">
            {greeting}, Tristan
          </h1>
          <p className="text-[13px] text-fg-subtle">
            Here is how your portfolio is positioned today.
          </p>
        </div>
      </div>

      {/* Row 1 — portfolio hero */}
      <PortfolioOverview p={p} />

      {/* Row 2 — allocation + watchlist */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <AllocationSection holdings={view.holdings} />
        <WatchlistPreview />
      </div>

      {/* Row 3 — markets full width */}
      <MarketOverview />

      {/* Row 4 — intelligence: AI commentary (wide) + risk snapshot */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <AiCommentary variants={buildMarketCommentary(view, risk)} />
        <RiskSnapshot risk={riskSnapshot} />
      </div>

      {/* Row 5 — alerts (empty-state showcase) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsPanel />
        <div className="hidden lg:block" aria-hidden />
      </div>
    </div>
  );
}
