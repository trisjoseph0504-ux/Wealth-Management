/**
 * Screener page (Phase 5 · Backend B2). Loads the user's saved screens through
 * the data seam and hands them to the client; built-in presets stay in the UI.
 */
import { ScreenerClient } from "@/components/screener/screener-client";
import { SectionLabel } from "@/components/ui/primitives";
import { listSavedScreensAction } from "@/server/actions/screens";

// User-owned saved screens: render per request.
export const dynamic = "force-dynamic";

export default async function ScreenerPage() {
  const initialSaved = await listSavedScreensAction();
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Research</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Screener</h1>
        <p className="text-[13px] text-fg-subtle">
          Filter the tracked universe by fundamentals, performance, and risk to surface opportunities.
        </p>
      </div>

      <ScreenerClient initialSaved={initialSaved} />
    </div>
  );
}
