"use client";

/**
 * Minimal toast. Call `toast("message")` from anywhere; a single <Toaster/> in the
 * shell renders transient confirmations (used by right-click actions, copy, etc.).
 * Event-based so there's no context to thread through components.
 */
import { useEffect, useState } from "react";

export function toast(message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lwi-toast", { detail: message }));
  }
}

interface ToastItem {
  id: number;
  message: string;
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let counter = 0;
    const onToast = (e: Event) => {
      const message = (e as CustomEvent<string>).detail;
      const id = ++counter;
      setItems((p) => [...p, { id, message }]);
      setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 2600);
    };
    window.addEventListener("lwi-toast", onToast);
    return () => window.removeEventListener("lwi-toast", onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-[8px] border border-hairline bg-surface-2/95 px-3.5 py-2 text-[12.5px] font-medium text-fg shadow-[var(--shadow-elevation)] backdrop-blur"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
