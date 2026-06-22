/**
 * Alerts & Notifications center (Phase 7). Proactive investment, risk, and
 * portfolio events. Mock-data driven; no APIs, no auth, no backend.
 */
import { listHoldingsAction } from "@/server/actions/holdings";
import { buildPortfolio } from "@/data/portfolio-derive";
import { buildRiskAnalysis } from "@/data/risk-mock";
import { buildAlerts } from "@/data/alerts-mock";
import { AlertsClient } from "@/components/alerts/alerts-client";
import { SectionLabel } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const view = buildPortfolio(await listHoldingsAction());
  const risk = buildRiskAnalysis(view);
  const seed = buildAlerts(view, risk);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Intelligence</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Alerts &amp; Notifications</h1>
        <p className="text-[13px] text-fg-subtle">
          Meaningful investment, risk, and portfolio events across the Lewis Family Office.
        </p>
      </div>

      <AlertsClient seed={seed} />
    </div>
  );
}
