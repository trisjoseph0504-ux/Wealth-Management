/** DB saved-screens repo (Backend B2, DATA_SOURCE=db). Scoped by userId. */
import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { savedScreens } from "@/server/db/schema";
import type { SavedScreen, SavedScreensRepo } from "@/server/data/types";

export const dbSavedScreens: SavedScreensRepo = {
  async list(userId) {
    const db = getDb();
    const rows = await db.select().from(savedScreens).where(eq(savedScreens.userId, userId));
    return rows.map((r) => ({ id: r.id, name: r.name, criteria: r.criteria }));
  },
  async save(userId, name, criteria) {
    const db = getDb();
    const rows = await db.insert(savedScreens).values({ userId, name, criteria }).returning();
    const r = rows[0];
    if (!r) throw new Error("Failed to save screen");
    return { id: r.id, name: r.name, criteria: r.criteria };
  },
  async remove(userId, id) {
    const db = getDb();
    await db.delete(savedScreens).where(and(eq(savedScreens.userId, userId), eq(savedScreens.id, id)));
  },
};
