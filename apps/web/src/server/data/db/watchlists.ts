/**
 * DB watchlists repo (Backend B0, used when DATA_SOURCE=db). Drizzle/Postgres.
 * Every query is scoped by userId (single-owner model).
 */
import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { watchlists, watchlistItems } from "@/server/db/schema";
import type { Watchlist, WatchlistsRepo } from "@/server/data/types";

export const dbWatchlists: WatchlistsRepo = {
  async list(userId) {
    const db = getDb();
    const wls = await db.select().from(watchlists).where(eq(watchlists.userId, userId));
    const items = await db
      .select()
      .from(watchlistItems)
      .where(eq(watchlistItems.userId, userId));
    return wls.map((w) => ({
      id: w.id,
      name: w.name,
      sortOrder: w.sortOrder,
      items: items
        .filter((i) => i.watchlistId === w.id)
        .map((i) => ({ symbol: i.symbol, note: i.note, sortOrder: i.sortOrder })),
    }));
  },
  async create(userId, name) {
    const db = getDb();
    const rows = await db.insert(watchlists).values({ userId, name }).returning();
    const w = rows[0];
    if (!w) throw new Error("Failed to create watchlist");
    return { id: w.id, name: w.name, sortOrder: w.sortOrder, items: [] };
  },
  async remove(userId, watchlistId) {
    const db = getDb();
    await db
      .delete(watchlists)
      .where(and(eq(watchlists.userId, userId), eq(watchlists.id, watchlistId)));
  },
  async addItem(userId, watchlistId, symbol) {
    const db = getDb();
    await db.insert(watchlistItems).values({ userId, watchlistId, symbol }).onConflictDoNothing();
  },
  async removeItem(userId, watchlistId, symbol) {
    const db = getDb();
    await db
      .delete(watchlistItems)
      .where(
        and(
          eq(watchlistItems.userId, userId),
          eq(watchlistItems.watchlistId, watchlistId),
          eq(watchlistItems.symbol, symbol),
        ),
      );
  },
};
