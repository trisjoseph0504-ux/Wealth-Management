"use server";

/**
 * Preferences server actions (Backend B1). The first feature wired through the
 * B0 data seam: theme persistence. `setThemeAction` writes through the active
 * repo (mock in-memory now, Postgres when DATA_SOURCE=db) AND sets a cookie that
 * the no-flash script reads on the next load — so the choice survives reloads in
 * either mode. Authorization is by the current user (single-owner model).
 */
import { cookies } from "next/headers";
import { getData } from "@/server/data";
import { getCurrentUser } from "@/server/auth/current-user";
import type { UserPreferences } from "@/server/data/types";

const THEME_COOKIE = "lwi-theme";

/** Read the current user's preferences (for the settings page). */
export async function getPreferencesAction(): Promise<UserPreferences> {
  const user = await getCurrentUser();
  return getData().preferences.get(user.id);
}

/** Persist regional preferences (base currency / locale) through the data seam. */
export async function setPreferencesAction(
  patch: Partial<Pick<UserPreferences, "baseCurrency" | "locale">>,
): Promise<UserPreferences> {
  const user = await getCurrentUser();
  return getData().preferences.update(user.id, patch);
}

export async function setThemeAction(theme: "dark" | "light"): Promise<void> {
  const user = await getCurrentUser();
  await getData().preferences.update(user.id, { theme });
  const jar = await cookies();
  jar.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
