/** Mock saved-screens repo (Backend B2). In-memory; starts empty (built-in
 *  presets live in the UI). `userId` ignored in mock mode. */
import type { SavedScreen, SavedScreensRepo } from "@/server/data/types";

let screens: SavedScreen[] = [];

export const mockSavedScreens: SavedScreensRepo = {
  async list() {
    return screens;
  },
  async save(_userId, name, criteria) {
    const s: SavedScreen = { id: `screen-${Date.now()}`, name, criteria };
    screens = [...screens, s];
    return s;
  },
  async remove(_userId, id) {
    screens = screens.filter((s) => s.id !== id);
  },
};
