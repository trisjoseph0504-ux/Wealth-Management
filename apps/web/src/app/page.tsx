/**
 * Home dashboard (Phase 1). Composition only — every panel is a self-contained
 * component reading from the mock-data module. Responsive 12-col-ish grid:
 * single column on mobile, two-thirds / one-third split on xl.
 */
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { AllocationSection } from "@/components/dashboard/allocation-section";
import { WatchlistPreview } from "@/components/dashboard/watchlist-preview";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { AiCommentary } from "@/components/dashboard/ai-commentary";
import { RiskSnapshot } from "@/components/dashboard/risk-snapshot";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { SectionLabel } from "@/components/ui/primitives";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page heading (visible on mobile where the topbar title is hidden) */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <SectionLabel>Overview</SectionLabel>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">
            Good afternoon, Tristan
          </h1>
          <p className="text-[13px] text-fg-subtle">
            Here is how the Lewis Family Office is positioned today.
          </p>
        </div>
      </div>

      {/* Row 1 — portfolio hero */}
      <PortfolioOverview />

      {/* Row 2 — allocation + watchlist */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <AllocationSection />
        <WatchlistPreview />
      </div>

      {/* Row 3 — markets full width */}
      <MarketOverview />

      {/* Row 4 — intelligence: AI commentary (wide) + risk snapshot */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <AiCommentary />
        <RiskSnapshot />
      </div>

      {/* Row 5 — alerts (empty-state showcase) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsPanel />
        <div className="hidden lg:block" aria-hidden />
      </div>
    </div>
  );
}
