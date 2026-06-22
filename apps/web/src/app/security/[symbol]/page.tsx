/**
 * Security / Instrument detail page (Phase 4 + B6). Dynamic route — opens from
 * any ticker across Markets, Watchlists, Portfolio, and global search. Real
 * price/change is overlaid from the active market-data provider; symbols outside
 * the local universe are built entirely from the live quote + company profile.
 * Illustrative analytics (thesis, bull/bear, stats) remain derived mock content.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSecurityDetail, type LiveOverride } from "@/data/security-detail-mock";
import { getSecurity } from "@/data/markets-mock";
import { getMarketData } from "@/server/market";
import { listHoldingsAction } from "@/server/actions/holdings";
import { buildPortfolio } from "@/data/portfolio-derive";
import { SecurityHeader } from "@/components/security/security-header";
import { SecurityChart } from "@/components/security/security-chart";
import { KeyStats } from "@/components/security/key-stats";
import { PerformanceMetrics } from "@/components/security/performance-metrics";
import { PortfolioExposure } from "@/components/security/portfolio-exposure";
import { InvestmentThesis } from "@/components/security/investment-thesis";
import { BullBear } from "@/components/security/bull-bear";
import { NewsFeed } from "@/components/security/news-feed";
import { RiskFactors } from "@/components/security/risk-factors";
import { IconChevronRight } from "@/components/ui/icons";

export default async function SecurityPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const sym = decodeURIComponent(symbol);
  const known = Boolean(getSecurity(sym));

  // Overlay real data from the active provider. Quote drives price/change; the
  // company profile (only needed for unknown symbols) supplies name/cap/exchange.
  const md = getMarketData();
  const [quote, profile] = await Promise.all([
    md.getQuote(sym).catch(() => null),
    known ? Promise.resolve(null) : md.getProfile(sym).catch(() => null),
  ]);

  const live: LiveOverride | undefined = quote
    ? {
        price: quote.price,
        changePct: quote.changePct,
        ...(profile ? { name: profile.name, marketCapB: profile.marketCapB, exchange: profile.exchange } : {}),
      }
    : undefined;

  // Real portfolio exposure for this symbol (null = genuinely not held).
  const view = buildPortfolio(await listHoldingsAction());
  const heldLive = view.holdings.find((h) => h.symbol === sym);
  const liveExposure = heldLive
    ? {
        quantity: heldLive.quantity,
        marketValue: heldLive.marketValue,
        weightPct: heldLive.weightPct,
        gainUsd: heldLive.gainUsd,
        gainPct: heldLive.gainPct,
      }
    : null;

  const d = getSecurityDetail(sym, live, liveExposure);
  if (!d) notFound();

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-[12px] text-fg-subtle">
        <Link href="/markets" className="reduce-motion-safe transition hover:text-fg">
          Markets
        </Link>
        <IconChevronRight size={13} />
        <span className="text-fg-muted">{d.symbol}</span>
      </nav>

      <SecurityHeader d={d} />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <SecurityChart d={d} />
        <div className="grid gap-6">
          <PerformanceMetrics d={d} />
          <PortfolioExposure d={d} />
        </div>
      </div>

      <KeyStats d={d} />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <InvestmentThesis d={d} />
        <RiskFactors d={d} />
      </div>

      <BullBear d={d} />
      <NewsFeed d={d} />
    </div>
  );
}
