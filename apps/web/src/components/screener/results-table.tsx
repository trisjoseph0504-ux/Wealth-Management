"use client";

/** Screener results — dense, sortable, finance-oriented table with compare
 *  selection and ticker links into the security detail page. */
import { type ScreenerRow } from "@/data/screener-mock";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Money, Percent, ChangePill } from "@/components/ui/financial";
import { EmptyState } from "@/components/ui/primitives";
import { TickerLink } from "@/components/ui/ticker-link";
import { IconSearch, IconArrowUp, IconArrowDown } from "@/components/ui/icons";

export type SortKey =
  | "symbol" | "sector" | "price" | "changePct" | "marketCapB" | "peRatio"
  | "dividendYieldPct" | "beta" | "volumeM" | "week52PosPct" | "perf1Y";

interface Col {
  key: SortKey;
  label: string;
  numeric: boolean;
  cell?: string;
}

const COLS: Col[] = [
  { key: "symbol", label: "Symbol", numeric: false },
  { key: "sector", label: "Sector", numeric: false, cell: "hidden xl:table-cell" },
  { key: "price", label: "Price", numeric: true, cell: "hidden sm:table-cell" },
  { key: "changePct", label: "Day", numeric: true },
  { key: "marketCapB", label: "Mkt Cap", numeric: true },
  { key: "peRatio", label: "P/E", numeric: true },
  { key: "dividendYieldPct", label: "Div", numeric: true, cell: "hidden md:table-cell" },
  { key: "beta", label: "Beta", numeric: true, cell: "hidden lg:table-cell" },
  { key: "volumeM", label: "Vol", numeric: true, cell: "hidden lg:table-cell" },
  { key: "week52PosPct", label: "52W Range", numeric: true, cell: "hidden md:table-cell" },
  { key: "perf1Y", label: "1Y", numeric: true },
];

export function ResultsTable({
  rows,
  sortKey,
  sortDir,
  onSort,
  selected,
  onToggle,
}: {
  rows: ScreenerRow[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  selected: Set<string>;
  onToggle: (symbol: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<IconSearch size={18} />}
        title="No securities match your filters"
        description="No instruments in the tracked universe meet every criterion. Loosen a range or clear a facet to widen the results."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-hairline">
            <th className="w-9 bg-inset/40 px-3 py-2.5" aria-label="Select" />
            {COLS.map((col) => (
              <th
                key={col.key}
                className={cn("bg-inset/40 px-3 py-2.5 font-medium text-fg-subtle", col.numeric ? "text-right" : "text-left", col.cell)}
              >
                <button
                  type="button"
                  onClick={() => onSort(col.key)}
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.07em] transition hover:text-fg",
                    col.numeric && "flex-row-reverse",
                    sortKey === col.key && "text-fg",
                  )}
                >
                  {col.label}
                  {sortKey === col.key && (sortDir === "asc" ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const checked = selected.has(r.symbol);
            return (
              <tr
                key={r.symbol}
                className={cn(
                  "reduce-motion-safe border-b border-hairline/60 transition last:border-0 hover:bg-surface-2/40",
                  checked && "bg-emerald/[0.05]",
                )}
              >
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={`Compare ${r.symbol}`}
                    onClick={() => onToggle(r.symbol)}
                    className={cn(
                      "reduce-motion-safe flex size-4 items-center justify-center rounded-[3px] border transition",
                      checked ? "border-emerald bg-emerald text-accent-contrast" : "border-line-strong hover:border-emerald/60",
                    )}
                  >
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <TickerLink symbol={r.symbol} className="block w-fit font-semibold tracking-tight text-fg" />
                  <div className="max-w-[170px] truncate text-[11px] text-fg-subtle">{r.name}</div>
                </td>
                <td className="hidden px-3 py-2.5 text-left xl:table-cell">
                  <span className="text-[12px] text-fg-muted">{r.sector}</span>
                </td>
                <td className="hidden px-3 py-2.5 text-right sm:table-cell">
                  <Money value={r.price} className="text-fg" />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <ChangePill value={r.changePct} />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Money value={r.marketCapB * 1e9} compact className="font-medium text-fg" />
                </td>
                <td className="px-3 py-2.5 text-right tnum text-fg-muted">{r.peRatio.toFixed(1)}×</td>
                <td className="hidden px-3 py-2.5 text-right tnum text-fg-muted md:table-cell">
                  {r.dividendYieldPct.toFixed(2)}%
                </td>
                <td className="hidden px-3 py-2.5 text-right tnum text-fg-muted lg:table-cell">{r.beta.toFixed(2)}</td>
                <td className="hidden px-3 py-2.5 text-right tnum text-fg-muted lg:table-cell">
                  {formatNumber(r.volumeM, 0)}M
                </td>
                <td className="hidden px-3 py-2.5 md:table-cell">
                  <Range52Cell pos={r.week52PosPct} />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Percent value={r.perf1Y} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Range52Cell({ pos }: { pos: number }) {
  const clamped = Math.max(0, Math.min(100, pos));
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="relative h-1 w-16 rounded-full bg-inset">
        <div className="absolute inset-y-0 left-0 rounded-full bg-line-strong" style={{ width: `${clamped}%` }} />
        <div
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald"
          style={{ left: `${clamped}%` }}
        />
      </div>
      <span className="tnum w-8 text-right text-[11px] text-fg-subtle">{clamped.toFixed(0)}%</span>
    </div>
  );
}
