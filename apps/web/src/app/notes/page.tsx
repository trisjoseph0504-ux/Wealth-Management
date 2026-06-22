/**
 * Research Notes page (Backend B2). Loads the user's notes through the data seam
 * and hands them to the client editor. Persists per account (mock now, DB next).
 */
import { NotesClient } from "@/components/notes/notes-client";
import { SectionLabel } from "@/components/ui/primitives";
import { listNotesAction } from "@/server/actions/notes";

// User-owned notes: render per request so saved notes show on reload.
export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const initialNotes = await listNotesAction();
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Research</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Research Notes</h1>
        <p className="text-[13px] text-fg-subtle">
          Investment memos and theses — captured, pinned, and saved to your account.
        </p>
      </div>

      <NotesClient initialNotes={initialNotes} />
    </div>
  );
}
