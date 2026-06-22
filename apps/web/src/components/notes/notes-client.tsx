"use client";

/**
 * Research Notes (Backend B2). Full CRUD through the data seam: a memo list +
 * editor. Mutations persist via server actions (mock in-memory now, Postgres
 * when DATA_SOURCE=db) with optimistic local state for a snappy feel.
 */
import { useMemo, useState } from "react";
import {
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
} from "@/server/actions/notes";
import type { Note } from "@/server/data/types";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { Button, EmptyState } from "@/components/ui/primitives";
import { TickerLink } from "@/components/ui/ticker-link";
import {
  IconNote,
  IconPlus,
  IconTrash,
  IconStar,
  IconStarFilled,
} from "@/components/ui/icons";

function fmtDate(iso: string): string {
  return iso.slice(0, 10);
}

export function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(initialNotes[0]?.id ?? null);

  const sorted = useMemo(
    () =>
      [...notes].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt),
      ),
    [notes],
  );
  const selected = notes.find((n) => n.id === selectedId) ?? null;

  async function createNote() {
    const note = await createNoteAction({ title: "Untitled note", body: "" });
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
  }

  async function saveNote(id: string, patch: Partial<Note>) {
    const updated = await updateNoteAction(id, {
      title: patch.title,
      body: patch.body,
      symbol: patch.symbol,
      tags: patch.tags,
      pinned: patch.pinned,
    });
    if (updated) setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }

  function togglePin(id: string) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const pinned = !note.pinned;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned } : n)));
    void updateNoteAction(id, { pinned }).catch(() => {});
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    void deleteNoteAction(id).catch(() => {});
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* List */}
      <Card className="flex flex-col">
        <CardHeader
          title="Notes"
          subtitle={`${notes.length} ${notes.length === 1 ? "memo" : "memos"}`}
          icon={<IconNote size={16} />}
          action={
            <Button variant="outline" onClick={createNote}>
              <IconPlus size={14} /> New
            </Button>
          }
        />
        {sorted.length === 0 ? (
          <EmptyState
            icon={<IconNote size={18} />}
            title="No notes yet"
            description="Capture investment memos, theses, and follow-ups. They persist to your account."
          />
        ) : (
          <ul className="divide-y divide-hairline/60">
            {sorted.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(n.id)}
                  className={cn(
                    "reduce-motion-safe flex w-full items-start gap-2.5 px-4 py-3 text-left transition",
                    n.id === selectedId ? "bg-emerald/[0.06]" : "hover:bg-surface-2/40",
                  )}
                >
                  <span className="mt-0.5 shrink-0 text-fg-subtle">
                    {n.pinned ? <IconStarFilled size={13} /> : <IconNote size={13} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-fg">{n.title || "Untitled"}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-fg-subtle">
                      {n.symbol && <span className="rounded-full bg-inset px-1.5 py-0.5 text-fg-muted">{n.symbol}</span>}
                      <span>{fmtDate(n.updatedAt)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Editor */}
      {selected ? (
        <NoteEditor
          key={selected.id}
          note={selected}
          onSave={saveNote}
          onDelete={removeNote}
          onTogglePin={togglePin}
        />
      ) : (
        <Card className="flex items-center justify-center">
          <EmptyState
            icon={<IconNote size={18} />}
            title="Select or create a note"
            description="Pick a memo from the list, or start a new one to capture a thesis."
          />
        </Card>
      )}
    </div>
  );
}

function NoteEditor({
  note,
  onSave,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onSave: (id: string, patch: Partial<Note>) => Promise<void>;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [symbol, setSymbol] = useState(note.symbol ?? "");
  const [tagsStr, setTagsStr] = useState(note.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await onSave(note.id, {
      title: title.trim() || "Untitled note",
      body,
      symbol: symbol.trim() || null,
      tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
      pinned: note.pinned,
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader
        title="Memo"
        subtitle={`Updated ${fmtDate(note.updatedAt)}`}
        icon={<IconNote size={16} />}
        action={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onTogglePin(note.id)}
              aria-label={note.pinned ? "Unpin" : "Pin"}
              title={note.pinned ? "Unpin" : "Pin"}
              className={cn(
                "reduce-motion-safe flex size-7 items-center justify-center rounded-[4px] transition",
                note.pinned ? "text-emerald" : "text-fg-subtle hover:bg-surface-2 hover:text-fg",
              )}
            >
              {note.pinned ? <IconStarFilled size={15} /> : <IconStar size={15} />}
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              aria-label="Delete note"
              title="Delete"
              className="reduce-motion-safe flex size-7 items-center justify-center rounded-[4px] text-fg-subtle transition hover:bg-surface-2 hover:text-neg"
            >
              <IconTrash size={15} />
            </button>
          </div>
        }
      />
      <div className="flex flex-1 flex-col gap-3 px-5 py-5">
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
          placeholder="Note title"
          className="w-full rounded-[6px] border border-hairline bg-inset px-3 py-2 text-[15px] font-semibold tracking-tight text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">Ticker (optional)</span>
            <input
              value={symbol}
              onChange={(e) => { setSymbol(e.target.value.toUpperCase()); setSaved(false); }}
              placeholder="e.g. NVDA"
              className="w-full rounded-[6px] border border-hairline bg-inset px-3 py-1.5 text-[13px] text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">Tags (comma-separated)</span>
            <input
              value={tagsStr}
              onChange={(e) => { setTagsStr(e.target.value); setSaved(false); }}
              placeholder="risk, ideas"
              className="w-full rounded-[6px] border border-hairline bg-inset px-3 py-1.5 text-[13px] text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none"
            />
          </label>
        </div>
        <textarea
          value={body}
          onChange={(e) => { setBody(e.target.value); setSaved(false); }}
          placeholder="Write your memo — thesis, evidence, follow-ups…"
          rows={12}
          className="min-h-48 flex-1 resize-y rounded-[6px] border border-hairline bg-inset px-3 py-2.5 text-[13.5px] leading-relaxed text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save note"}
          </Button>
          {saved && <span className="text-[12px] text-pos">Saved</span>}
          {symbol.trim() && (
            <span className="ml-auto text-[12px] text-fg-subtle">
              Linked: <TickerLink symbol={symbol.trim()} className="text-emerald" />
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
