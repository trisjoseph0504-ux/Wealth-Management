/**
 * Mock watchlists repo (Backend B0). Wraps the existing watchlist seeds so the
 * seam returns exactly what the UI shows today. In-memory; `userId` ignored.
 */
import { watchlistSeeds } from "@/data/watchlists-mock";
import type { Watchlist, WatchlistsRepo } from "@/server/data/types";

let lists: Watchlist[] = watchlistSeeds.map((w, i) => ({
  id: w.id,
  name: w.name,
  sortOrder: i,
  items: w.symbols.map((symbol, j) => ({ symbol, note: null, sortOrder: j })),
}));

export const mockWatchlists: WatchlistsRepo = {
  async list() {
    return lists;
  },
  async create(_userId, name) {
    const wl: Watchlist = { id: `wl-${Date.now()}`, name, sortOrder: lists.length, items: [] };
    lists = [...lists, wl];
    return wl;
  },
  async remove(_userId, watchlistId) {
    lists = lists.filter((l) => l.id !== watchlistId);
  },
  async addItem(_userId, watchlistId, symbol) {
    lists = lists.map((l) =>
      l.id === watchlistId && !l.items.some((i) => i.symbol === symbol)
        ? { ...l, items: [...l.items, { symbol, note: null, sortOrder: l.items.length }] }
        : l,
    );
  },
  async removeItem(_userId, watchlistId, symbol) {
    lists = lists.map((l) =>
      l.id === watchlistId ? { ...l, items: l.items.filter((i) => i.symbol !== symbol) } : l,
    );
  },
};
