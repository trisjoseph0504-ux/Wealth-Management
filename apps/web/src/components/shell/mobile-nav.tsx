"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LwWordmark } from "@/components/shell/logo";
import { NavList } from "@/components/shell/nav-list";
import { cn } from "@/lib/cn";
import { IconMenu, IconClose } from "@/components/ui/icons";

/**
 * Hamburger trigger + slide-over drawer. Phone-only — shown below `md`; at md+
 * the persistent sidebar takes over (the "website" layout).
 *
 * The overlay + drawer are portaled to <body>: the topbar uses `backdrop-blur`,
 * which makes it the containing block for `position: fixed` descendants. Left in
 * place, the drawer's `inset-y-0` would only span the 64px header instead of the
 * full viewport. Portaling escapes that containing block so it fills the screen.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Swipe-to-dismiss: track a leftward drag on the drawer and close past a threshold.
  const [dragX, setDragX] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Portals need the DOM — only render them after mount (avoids SSR mismatch).
  useEffect(() => setMounted(true), []);

  // Lock body scroll while the drawer is open; close on Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="reduce-motion-safe flex size-9 items-center justify-center rounded-[6px] border border-hairline bg-inset text-fg-muted transition hover:text-fg"
      >
        <IconMenu size={18} />
      </button>

      {mounted &&
        createPortal(
          <div className="md:hidden">
            {/* Overlay */}
            <div
              aria-hidden={!open}
              onClick={() => setOpen(false)}
              className={cn(
                "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
                open ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />

            {/* Drawer */}
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0]?.clientX ?? null;
              }}
              onTouchMove={(e) => {
                if (touchStartX.current == null) return;
                const dx = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
                if (dx < 0) setDragX(dx); // only follow leftward drags
              }}
              onTouchEnd={() => {
                if (dragX < -60) setOpen(false); // dragged far enough → dismiss
                setDragX(0);
                touchStartX.current = null;
              }}
              style={dragX ? { transform: `translateX(${dragX}px)`, transition: "none" } : undefined}
              className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col border-r border-hairline bg-canvas shadow-[var(--shadow-elevation)] transition-transform duration-200 ease-out",
                open ? "translate-x-0" : "-translate-x-full",
              )}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-hairline px-5">
                <LwWordmark />
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setOpen(false)}
                  className="flex size-8 items-center justify-center rounded-[6px] text-fg-muted transition hover:bg-surface-2 hover:text-fg"
                >
                  <IconClose size={18} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-5">
                <NavList onNavigate={() => setOpen(false)} />
              </nav>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
