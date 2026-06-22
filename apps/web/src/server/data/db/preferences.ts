/**
 * DB preferences repo (Backend B0, used when DATA_SOURCE=db). Drizzle/Postgres.
 * Scoped by userId (single-owner model). Upsert keyed on the user.
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { userPreferences } from "@/server/db/schema";
import type { PreferencesRepo, UserPreferences } from "@/server/data/types";

const DEFAULTS: UserPreferences = { theme: "dark", baseCurrency: "USD", locale: "en-US" };

export const dbPreferences: PreferencesRepo = {
  async get(userId) {
    const db = getDb();
    const rows = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    const row = rows[0];
    if (!row) return DEFAULTS;
    return { theme: row.theme, baseCurrency: row.baseCurrency, locale: row.locale };
  },
  async update(userId, patch) {
    const db = getDb();
    await db
      .insert(userPreferences)
      .values({ userId, ...patch })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...patch, updatedAt: new Date() },
      });
    return dbPreferences.get(userId);
  },
};
