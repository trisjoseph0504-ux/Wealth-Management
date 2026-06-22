"use client";

/**
 * Reusable ticker autocomplete — same Finnhub-backed live search as the global
 * search bar, but as a controlled field that fills a value instead of navigating.
 * Debounced + race-safe; keyboard nav (↑/↓/Enter/Esc). Used by the add-holding
 * form so picking a symbol there feels identical to the top search.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { searchSecuritiesAction } from "@/server/actions/market";
import type { SymbolHit, InstrumentType } from "@/server/market/types";
import { cn } from "@/lib/cn";

const TYPE_BADGE: Record<InstrumentType, string> = {
  Stock: "border-hairline bg-inset text-fg-subtle",
  ETF: "border-emerald/30 bg-emerald/10 text-emerald-bright",
  Fund: "border-info/30 bg-info/10 text-info",
  Other: "border-hairline bg-inset text-fg-subtle",
};

export function SymbolCombobox({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (hit: SymbolHit) => void;
  placeholder?: string;
  className?: string;
}) {
  const [results, setResults] = useState<SymbolHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);
  const justPicked = useRef(false);

  useEffect(() => {
    const q = value.trim();
    if (!q || justPicked.current) {
      justPicked.current = false;
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
  }, [value]);

  const showDropdown = open && value.trim().length > 0;

  function pick(hit: SymbolHit) {
    justPicked.current = true;
    onSelect(hit);
    setOpen(false);
    setResults([]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active] ?? results[0];
      if (hit) pick(hit);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value.toUpperCase());
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-[13px] text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none",
          className,
        )}
      />
      {showDropdown && (results.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-[8px] border border-hairline bg-surface-2 shadow-[var(--shadow-elevation)]">
          {results.length === 0 ? (
            <div className="px-3 py-2.5 text-[12px] text-fg-subtle">Searching…</div>
          ) : (
            <ul className="max-h-64 overflow-auto p-1">
              {results.map((s, i) => (
                <li key={`${s.symbol}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(s);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[6px] px-2.5 py-2 text-left transition",
                      i === active ? "bg-surface" : "hover:bg-surface",
                    )}
                  >
                    <span className="w-14 shrink-0 text-[13px] font-semibold tracking-tight text-fg">{s.symbol}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-fg-muted">{s.name}</span>
                    <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", TYPE_BADGE[s.type])}>
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
