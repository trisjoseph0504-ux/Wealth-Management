/**
 * Watchlists page (Phase 3 · Backend B2). Loads the user's lists through the data
 * seam (mock now, Postgres when DATA_SOURCE=db) and hands them to the client.
 */
import { WatchlistsClient } from "@/components/watchlists/watchlists-client";
import { SectionLabel } from "@/components/ui/primitives";
import { listWatchlistsAction } from "@/server/actions/watchlists";

// User-owned data: render per request so persisted changes show on reload.
export const dynamic = "force-dynamic";

export default async function WatchlistsPage() {
  const initialLists = await listWatchlistsAction();
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Markets</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Watchlists</h1>
        <p className="text-[13px] text-fg-subtle">
          Track instruments across custom lists. Search to add, click to remove.
        </p>
      </div>

      <WatchlistsClient initialLists={initialLists} />
    </div>
  );
}
