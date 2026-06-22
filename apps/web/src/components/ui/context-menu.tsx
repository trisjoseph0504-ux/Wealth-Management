"use client";

/**
 * App-wide right-click context menu. A single menu instance lives in the shell;
 * any component calls `useContextMenu().openMenu(event, items)` from an
 * onContextMenu handler. Renders at the cursor (clamped on-screen) via a portal,
 * closes on select / outside-click / Escape / scroll.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export interface CtxItem {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void | Promise<void>;
  danger?: boolean;
  separator?: boolean;
  header?: boolean; // non-clickable section label
}

interface MenuState {
  x: number;
  y: number;
  items: CtxItem[];
}

type OpenEvent = { clientX: number; clientY: number; preventDefault: () => void };

interface Ctx {
  openMenu: (e: OpenEvent, items: CtxItem[]) => void;
}

const ContextMenuCtx = createContext<Ctx | null>(null);

export function useContextMenu(): Ctx {
  return useContext(ContextMenuCtx) ?? { openMenu: () => {} };
}

const MENU_W = 212;

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MenuState | null>(null);

  const openMenu = useCallback((e: OpenEvent, items: CtxItem[]) => {
    e.preventDefault();
    setState({ x: e.clientX, y: e.clientY, items: items.filter(Boolean) });
  }, []);

  useEffect(() => {
    if (!state) return;
    const close = () => setState(null);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close();
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [state]);

  let menu: ReactNode = null;
  if (state) {
    const estH = state.items.reduce((h, it) => h + (it.separator ? 9 : it.header ? 24 : 32), 8);
    const left = Math.max(8, Math.min(state.x, window.innerWidth - MENU_W - 8));
    const top = Math.max(8, Math.min(state.y, window.innerHeight - estH - 8));
    menu = createPortal(
      <>
        <div
          className="fixed inset-0 z-[70]"
          onClick={() => setState(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setState(null);
          }}
          aria-hidden
        />
        <div
          className="fixed z-[71] min-w-[200px] overflow-hidden rounded-[8px] border border-hairline bg-surface-2 py-1 shadow-[var(--shadow-elevation)]"
          style={{ left, top, width: MENU_W }}
        >
          {state.items.map((it, i) =>
            it.separator ? (
              <div key={i} className="my-1 h-px bg-hairline" />
            ) : it.header ? (
              <div key={i} className="px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-fg-subtle">
                {it.label}
              </div>
            ) : (
              <button
                key={i}
                type="button"
                onClick={async () => {
                  setState(null);
                  await it.onSelect?.();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition hover:bg-surface",
                  it.danger ? "text-neg hover:text-neg" : "text-fg-muted hover:text-fg",
                )}
              >
                {it.icon && <span className="flex w-4 shrink-0 justify-center text-fg-subtle">{it.icon}</span>}
                <span className="truncate">{it.label}</span>
              </button>
            ),
          )}
        </div>
      </>,
      document.body,
    );
  }

  return (
    <ContextMenuCtx.Provider value={{ openMenu }}>
      {children}
      {menu}
    </ContextMenuCtx.Provider>
  );
}
