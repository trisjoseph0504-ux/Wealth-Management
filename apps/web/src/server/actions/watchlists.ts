"use server";

/**
 * Watchlist server actions (Backend B2). Read/write through the data seam so the
 * UI persists in mock mode (in-memory, this server process) and in DB mode
 * (Postgres) with no UI change. Authorized by the current user (single-owner).
 */
import { getData } from "@/server/data";
import { getCurrentUser } from "@/server/auth/current-user";
import type { Watchlist } from "@/server/data/types";

export async function listWatchlistsAction(): Promise<Watchlist[]> {
  const user = await getCurrentUser();
  return getData().watchlists.list(user.id);
}

export async function createWatchlistAction(name: string): Promise<Watchlist> {
  const user = await getCurrentUser();
  return getData().watchlists.create(user.id, name.trim() || "Untitled list");
}

export async function deleteWatchlistAction(watchlistId: string): Promise<void> {
  const user = await getCurrentUser();
  await getData().watchlists.remove(user.id, watchlistId);
}

export async function addWatchlistItemAction(watchlistId: string, symbol: string): Promise<void> {
  const user = await getCurrentUser();
  await getData().watchlists.addItem(user.id, watchlistId, symbol);
}

export async function removeWatchlistItemAction(watchlistId: string, symbol: string): Promise<void> {
  const user = await getCurrentUser();
  await getData().watchlists.removeItem(user.id, watchlistId, symbol);
}
