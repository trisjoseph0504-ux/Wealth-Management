/** DB research-notes repo (Backend B2, DATA_SOURCE=db). Scoped by userId;
 *  soft-deleted rows are excluded from reads. */
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { researchNotes } from "@/server/db/schema";
import type { Note, NotesRepo } from "@/server/data/types";

type Row = typeof researchNotes.$inferSelect;
const toNote = (r: Row): Note => ({
  id: r.id,
  title: r.title,
  body: r.body,
  symbol: r.symbol,
  tags: r.tags,
  pinned: r.pinned,
  updatedAt: r.updatedAt.toISOString(),
});

export const dbNotes: NotesRepo = {
  async list(userId) {
    const db = getDb();
    const rows = await db
      .select()
      .from(researchNotes)
      .where(and(eq(researchNotes.userId, userId), isNull(researchNotes.deletedAt)))
      .orderBy(desc(researchNotes.pinned), desc(researchNotes.updatedAt));
    return rows.map(toNote);
  },
  async get(userId, id) {
    const db = getDb();
    const rows = await db
      .select()
      .from(researchNotes)
      .where(and(eq(researchNotes.userId, userId), eq(researchNotes.id, id), isNull(researchNotes.deletedAt)))
      .limit(1);
    return rows[0] ? toNote(rows[0]) : null;
  },
  async create(userId, input) {
    const db = getDb();
    const rows = await db
      .insert(researchNotes)
      .values({
        userId,
        title: input.title,
        body: input.body,
        symbol: input.symbol ?? null,
        tags: input.tags ?? [],
        pinned: input.pinned ?? false,
      })
      .returning();
    const r = rows[0];
    if (!r) throw new Error("Failed to create note");
    return toNote(r);
  },
  async update(userId, id, patch) {
    const db = getDb();
    const rows = await db
      .update(researchNotes)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(researchNotes.userId, userId), eq(researchNotes.id, id)))
      .returning();
    return rows[0] ? toNote(rows[0]) : null;
  },
  async remove(userId, id) {
    const db = getDb();
    // Soft delete (notes are research IP — keep an audit trail).
    await db
      .update(researchNotes)
      .set({ deletedAt: new Date() })
      .where(and(eq(researchNotes.userId, userId), eq(researchNotes.id, id)));
  },
};
