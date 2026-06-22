"use server";

/** Research-notes server actions (Backend B2). CRUD through the seam. */
import { getData } from "@/server/data";
import { getCurrentUser } from "@/server/auth/current-user";
import type { Note, NoteInput } from "@/server/data/types";

export async function listNotesAction(): Promise<Note[]> {
  const user = await getCurrentUser();
  return getData().notes.list(user.id);
}

export async function createNoteAction(input: NoteInput): Promise<Note> {
  const user = await getCurrentUser();
  return getData().notes.create(user.id, input);
}

export async function updateNoteAction(id: string, patch: Partial<NoteInput>): Promise<Note | null> {
  const user = await getCurrentUser();
  return getData().notes.update(user.id, id, patch);
}

export async function deleteNoteAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  await getData().notes.remove(user.id, id);
}
