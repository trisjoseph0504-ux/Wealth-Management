"use client";

/**
 * Add-to-watchlist control for the security header. Opens a menu of the user's
 * watchlists (persisted through the data seam), toggling the symbol in/out of
 * each, and can create a new list inline. Button state reflects how many lists
 * already hold the symbol.
 *
 * The menu renders in a portal (fixed-positioned to the trigger) so it is never
 * clipped by the header card's `overflow-hidden`.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  listWatchlistsAction,
  addWatchlistItemAction,
  removeWatchlistItemAction,
  createWatchlistAction,
} from "@/server/actions/watchlists";
import type { Watchlist } from "@/server/data/types";
import { Button } from "@/components/ui/primitives";
import { IconStar, IconStarFilled, IconCheck, IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function WatchlistButton({ symbol }: { symbol: string }) {
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [lists, setLists] = useState<Watchlist[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");

  async function load() {
    setLists(await listWatchlistsAction().catch(() => []));
  }

  function openMenu() {
    const el = triggerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const MENU_W = 288; // w-72
      // Right-align to the trigger, then clamp fully on-screen (handles narrow widths).
      const left = Math.max(12, Math.min(r.right - MENU_W, window.innerWidth - MENU_W - 12));
      setPos({ top: r.bottom + 8, left });
    }
    setOpen(true);
    if (lists === null) void load();
  }

  // Reposition / dismiss the portal menu as the page moves.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const memberCount = lists ? lists.filter((l) => l.items.some((i) => i.symbol === symbol)).length : 0;

  async function toggle(list: Watchlist) {
    const isMember = list.items.some((i) => i.symbol === symbol);
    setBusy(true);
    try {
      if (isMember) await removeWatchlistItemAction(list.id, symbol);
      else await addWatchlistItemAction(list.id, symbol);
      await load();
      router.refresh(); // reflect on the Watchlists tab too
    } finally {
      setBusy(false);
    }
  }

  async function createAndAdd() {
    setBusy(true);
    try {
      const wl = await createWatchlistAction(newName.trim() || "Watchlist");
      await addWatchlistItemAction(wl.id, symbol);
      setNewName("");
      await load();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const menu =
    open && pos
      ? createPortal(
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} aria-hidden />
            <div
              className="fixed z-[61] w-72 overflow-hidden rounded-[8px] border border-hairline bg-surface-2 shadow-[var(--shadow-elevation)]"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="border-b border-hairline px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-fg-subtle">
                Add {symbol} to…
              </div>

              {lists === null ? (
                <div className="px-3 py-3 text-[12px] text-fg-subtle">Loading…</div>
              ) : lists.length === 0 ? (
                <div className="px-3 py-3 text-[12px] text-fg-subtle">No watchlists yet — create one below.</div>
              ) : (
                <ul className="max-h-72 overflow-auto py-1">
                  {lists.map((l) => {
                    const member = l.items.some((i) => i.symbol === symbol);
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => toggle(l)}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition hover:bg-surface disabled:opacity-60",
                            member ? "text-fg" : "text-fg-muted",
                          )}
                        >
                          <span className="truncate">{l.name}</span>
                          {member ? (
                            <IconCheck size={15} className="shrink-0 text-emerald" />
                          ) : (
                            <IconPlus size={14} className="shrink-0 text-fg-subtle" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex items-center gap-2 border-t border-hairline p-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void createAndAdd();
                  }}
                  placeholder="New watchlist"
                  className="w-full min-w-0 rounded-[6px] border border-hairline bg-surface px-2.5 py-1.5 text-[12px] text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void createAndAdd()}
                  className="shrink-0 rounded-[6px] bg-emerald px-2.5 py-1.5 text-[12px] font-semibold text-accent-contrast transition hover:bg-emerald-bright disabled:opacity-60"
                >
                  Add
                </button>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="relative" ref={triggerRef}>
      <Button variant="primary" onClick={() => (open ? setOpen(false) : openMenu())}>
        {memberCount > 0 ? <IconStarFilled size={14} /> : <IconStar size={14} />}
        {memberCount > 0 ? (memberCount === 1 ? "On watchlist" : `On ${memberCount} lists`) : "Add to watchlist"}
      </Button>
      {menu}
    </div>
  );
}
