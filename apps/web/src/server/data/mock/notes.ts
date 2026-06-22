/** Mock research-notes repo (Backend B2). In-memory, seeded with a couple of
 *  demo memos so the Notes page isn't empty in demo mode. `userId` ignored. */
import type { Note, NotesRepo } from "@/server/data/types";

let notes: Note[] = [
  {
    id: "note-seed-1",
    title: "NVDA — trim into earnings?",
    body: "Position has grown to ~16% of the book and an earnings event is within a week. Consider scaling back toward the 11% policy target to reduce single-name and event risk. Revisit after the print.",
    symbol: "NVDA",
    tags: ["risk", "concentration"],
    pinned: true,
    updatedAt: "2026-06-20T14:30:00.000Z",
  },
  {
    id: "note-seed-2",
    title: "Add defensive ballast",
    body: "Portfolio holds no consumer-staples or utilities exposure. Screen large, dividend-paying defensives to cushion a risk-off move. Build a research watchlist before committing capital.",
    symbol: null,
    tags: ["allocation", "ideas"],
    pinned: false,
    updatedAt: "2026-06-19T09:10:00.000Z",
  },
];

export const mockNotes: NotesRepo = {
  async list() {
    return [...notes].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt),
    );
  },
  async get(_userId, id) {
    return notes.find((n) => n.id === id) ?? null;
  },
  async create(_userId, input) {
    const note: Note = {
      id: `note-${Date.now()}`,
      title: input.title,
      body: input.body,
      symbol: input.symbol ?? null,
      tags: input.tags ?? [],
      pinned: input.pinned ?? false,
      updatedAt: new Date().toISOString(),
    };
    notes = [note, ...notes];
    return note;
  },
  async update(_userId, id, patch) {
    let updated: Note | null = null;
    notes = notes.map((n) => {
      if (n.id !== id) return n;
      updated = { ...n, ...patch, symbol: patch.symbol ?? n.symbol, updatedAt: new Date().toISOString() };
      return updated;
    });
    return updated;
  },
  async remove(_userId, id) {
    notes = notes.filter((n) => n.id !== id);
  },
};
