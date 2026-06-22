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

const THEME_COOKIE = "lwi-theme";

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
