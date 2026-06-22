"use client";

/**
 * Theme toggle (Backend B1). Flips `data-theme` instantly for zero-latency UX,
 * persists the choice in a cookie (read by the no-flash script on next load),
 * and calls the server action to persist it through the data seam (mock now, DB
 * when DATA_SOURCE=db). Proves the full stack: client → server action → repo.
 */
import { useEffect, useState } from "react";
import { setThemeAction } from "@/server/actions/preferences";
import { IconMoon, IconSun } from "@/components/ui/icons";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === "light" || t === "dark") setTheme(t);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `lwi-theme=${next};path=/;max-age=31536000;samesite=lax`;
    setTheme(next);
    // Persist of record (mock/db). Fire-and-forget; the cookie already covers UX.
    void setThemeAction(next).catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme"
      className="reduce-motion-safe flex size-9 items-center justify-center rounded-[6px] border border-hairline bg-inset text-fg-muted transition hover:text-fg"
    >
      {theme === "dark" ? <IconMoon size={17} /> : <IconSun size={17} />}
    </button>
  );
}
