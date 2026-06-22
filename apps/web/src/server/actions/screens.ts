"use server";

/** Saved-screen server actions (Backend B2). Persist user screens through the
 *  seam; built-in presets stay in the UI. */
import { getData } from "@/server/data";
import { getCurrentUser } from "@/server/auth/current-user";
import type { SavedScreen } from "@/server/data/types";

export async function listSavedScreensAction(): Promise<SavedScreen[]> {
  const user = await getCurrentUser();
  return getData().savedScreens.list(user.id);
}

export async function saveScreenAction(
  name: string,
  criteria: Record<string, unknown>,
): Promise<SavedScreen> {
  const user = await getCurrentUser();
  return getData().savedScreens.save(user.id, name.trim() || "Saved Screen", criteria);
}

export async function deleteSavedScreenAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  await getData().savedScreens.remove(user.id, id);
}
