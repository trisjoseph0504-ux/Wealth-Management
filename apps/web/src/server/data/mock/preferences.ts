/**
 * Mock preferences repo (Backend B0). In-memory; resets per server process.
 * Real persistence arrives in Phase B1 (dbPreferences). `userId` is ignored here
 * — there is one demo user in mock mode.
 */
import type { PreferencesRepo, UserPreferences } from "@/server/data/types";

let prefs: UserPreferences = { theme: "dark", baseCurrency: "USD", locale: "en-US" };

export const mockPreferences: PreferencesRepo = {
  async get() {
    return prefs;
  },
  async update(_userId, patch) {
    prefs = { ...prefs, ...patch };
    return prefs;
  },
};
