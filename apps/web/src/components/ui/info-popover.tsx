"use client";

/**
 * Small "(i)" info button that opens an explanation popover on click/tap — works
 * on desktop and mobile. Portaled to <body> and positioned under the button so a
 * parent's `overflow-hidden` (e.g. the risk card) can't clip it.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconInfo } from "@/components/ui/icons";

export interface InfoContent {
  title: string;
  what: string;
  good: string;
  formula: string;
}

const PANEL_W = 248;

export function InfoPopover({ title, what, good, formula }: InfoContent) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  function toggle() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const left = Math.min(Math.max(8, r.left), window.innerWidth - PANEL_W - 8);
      setPos({ top: r.bottom + 6, left });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`About ${title}`}
        aria-expanded={open}
        onClick={toggle}
        className="reduce-motion-safe inline-flex size-4 shrink-0 items-center justify-center rounded-full text-fg-subtle transition hover:text-fg"
      >
        <IconInfo size={14} />
      </button>

      {mounted &&
        open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={title}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: PANEL_W }}
            className="z-50 rounded-[8px] border border-hairline bg-surface-2 p-3 text-left shadow-[var(--shadow-elevation)]"
          >
            <p className="text-[12px] font-semibold text-fg">{title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">{what}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-fg-muted">
              <span className="font-medium text-fg">Good: </span>
              {good}
            </p>
            <p className="mt-2 border-t border-hairline pt-2 text-[10.5px] leading-relaxed text-fg-subtle">
              <span className="font-medium">Formula: </span>
              {formula}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
