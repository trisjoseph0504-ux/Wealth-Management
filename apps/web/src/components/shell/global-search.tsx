"use client";

/**
 * Global instrument search (B6) — live suggestions from the active market-data
 * provider (mock universe, or Finnhub's real symbols when configured). Debounced
 * server-action lookup keeps the API key server-side and respects rate limits.
 * Keyboard nav (↑/↓/Enter/Esc) and click-through to the security detail page.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { searchSecuritiesAction } from "@/server/actions/market";
import type { SymbolHit, InstrumentType } from "@/server/market/types";
import { cn } from "@/lib/cn";
import { IconSearch } from "@/components/ui/icons";

const TYPE_BADGE: Record<InstrumentType, string> = {
  Stock: "border-hairline bg-inset text-fg-subtle",
  ETF: "border-emerald/30 bg-emerald/10 text-emerald-bright",
  Fund: "border-info/30 bg-info/10 text-info",
  Other: "border-hairline bg-inset text-fg-subtle",
};

export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      const hits = await searchSecuritiesAction(q);
      if (id === reqId.current) {
        setResults(hits);
        setActive(0);
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const showDropdown = open && query.trim().length > 0;

  function go(symbol: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    inputRef.current?.blur();
    router.push(`/security/${encodeURIComponent(symbol)}`);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[active] ?? results[0];
      if (pick) go(pick.symbol);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <label className="flex w-full items-center gap-2.5 rounded-[6px] border border-hairline bg-inset px-3 py-2 text-fg-muted transition focus-within:border-emerald/40">
        <IconSearch size={16} className="shrink-0 text-fg-subtle" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder="Search securities, ETFs, funds…"
          aria-label="Search securities"
          className="w-full min-w-0 bg-transparent text-[13px] text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded-[4px] border border-hairline bg-surface px-1.5 py-0.5 text-[10px] text-fg-subtle md:inline">
          ⌘K
        </kbd>
      </label>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[8px] border border-hairline bg-surface-2 shadow-[var(--shadow-elevation)]">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-[12px] text-fg-subtle">
              {loading ? "Searching…" : `No matches for “${query.trim()}”.`}
            </div>
          ) : (
            <ul className="max-h-[70vh] overflow-auto p-1">
              {results.map((s, i) => (
                <li key={`${s.symbol}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      go(s.symbol);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left transition",
                      i === active ? "bg-surface" : "hover:bg-surface",
                    )}
                  >
                    <span className="w-16 shrink-0 text-[13px] font-semibold tracking-tight text-fg">{s.symbol}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-fg-muted">{s.name}</span>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", TYPE_BADGE[s.type])}>
                      {s.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
