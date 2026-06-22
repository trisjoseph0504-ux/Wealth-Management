"use client";

import { useEffect, useState } from "react";
import { LwWordmark } from "@/components/shell/logo";
import { NavList } from "@/components/shell/nav-list";
import { cn } from "@/lib/cn";
import { IconMenu, IconClose } from "@/components/ui/icons";

/** Hamburger trigger + slide-over drawer. Rendered in the topbar on < lg. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

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
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="reduce-motion-safe flex size-9 items-center justify-center rounded-[6px] border border-hairline bg-inset text-fg-muted transition hover:text-fg"
      >
        <IconMenu size={18} />
      </button>

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
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col border-r border-hairline bg-canvas shadow-[var(--shadow-elevation)] transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-hairline px-5">
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
    </div>
  );
}
