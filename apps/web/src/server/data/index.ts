/**
 * Data-source factory (Backend B0–B2). Returns the mock or DB repositories based
 * on the DATA_SOURCE flag, so callers (Server Actions / Route Handlers) read
 * through one seam and never import a concrete implementation directly.
 *
 *   const { watchlists } = getData();
 *   const lists = await watchlists.list(userId);
 *
 * Flip per domain by setting DATA_SOURCE=db (and DATABASE_URL). Server-only.
 */
import { env } from "@/server/env";
import type { DataSource } from "@/server/data/types";
import { mockPreferences } from "@/server/data/mock/preferences";
import { mockWatchlists } from "@/server/data/mock/watchlists";
import { mockSavedScreens } from "@/server/data/mock/saved-screens";
import { mockNotes } from "@/server/data/mock/notes";
import { mockHoldings } from "@/server/data/mock/holdings";
import { dbPreferences } from "@/server/data/db/preferences";
import { dbWatchlists } from "@/server/data/db/watchlists";
import { dbSavedScreens } from "@/server/data/db/saved-screens";
import { dbNotes } from "@/server/data/db/notes";
import { dbHoldings } from "@/server/data/db/holdings";

export function getData(): DataSource {
  if (env.DATA_SOURCE === "db") {
    return {
      preferences: dbPreferences,
      watchlists: dbWatchlists,
      savedScreens: dbSavedScreens,
      notes: dbNotes,
      holdings: dbHoldings,
    };
  }
  return {
    preferences: mockPreferences,
    watchlists: mockWatchlists,
    savedScreens: mockSavedScreens,
    notes: mockNotes,
    holdings: mockHoldings,
  };
}

export type { DataSource } from "@/server/data/types";
