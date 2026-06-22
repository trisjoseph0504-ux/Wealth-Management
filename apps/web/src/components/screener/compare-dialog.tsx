"use client";

/** Quick-compare overlay — selected securities side by side, best-in-row marked. */
import { useEffect, type ReactNode } from "react";
import { type ScreenerRow } from "@/data/screener-mock";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Money, Percent, ChangePill } from "@/components/ui/financial";
import { TickerLink } from "@/components/ui/ticker-link";
import { IconClose, IconTrash } from "@/components/ui/icons";

interface MetricRow {
  label: string;
  best?: "max" | "min";
  value: (r: ScreenerRow) => number; // for best calc
  render: (r: ScreenerRow) => ReactNode;
}

const METRICS: MetricRow[] = [
  { label: "Price", value: (r) => r.price, render: (r) => <Money value={r.price} /> },
  { label: "Day", best: "max", value: (r) => r.changePct, render: (r) => <ChangePill value={r.changePct} /> },
  { label: "Market Cap", best: "max", value: (r) => r.marketCapB, render: (r) => <Money value={r.marketCapB * 1e9} compact /> },
  { label: "P/E (TTM)", best: "min", value: (r) => r.peRatio, render: (r) => <span className="tnum">{r.peRatio.toFixed(1)}×</span> },
  { label: "Dividend Yield", best: "max", value: (r) => r.dividendYieldPct, render: (r) => <span className="tnum">{r.dividendYieldPct.toFixed(2)}%</span> },
  { label: "Beta", value: (r) => r.beta, render: (r) => <span className="tnum">{r.beta.toFixed(2)}</span> },
  { label: "Volume", value: (r) => r.volumeM, render: (r) => <span className="tnum">{formatNumber(r.volumeM, 0)}M</span> },
  { label: "52W Range", value: (r) => r.week52PosPct, render: (r) => <span className="tnum">{r.week52PosPct.toFixed(0)}%</span> },
  { label: "1M Return", best: "max", value: (r) => r.perf1M, render: (r) => <Percent value={r.perf1M} /> },
  { label: "YTD Return", best: "max", value: (r) => r.perfYTD, render: (r) => <Percent value={r.perfYTD} /> },
  { label: "1Y Return", best: "max", value: (r) => r.perf1Y, render: (r) => <Percent value={r.perf1Y} /> },
];

export function CompareDialog({
  rows,
  onClose,
  onRemove,
}: {
  rows: ScreenerRow[];
  onClose: () => void;
  onRemove: (symbol: string) => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function leaders(m: MetricRow): Set<string> {
    if (!m.best || rows.length < 2) return new Set();
    const vals = rows.map(m.value);
    const target = m.best === "max" ? Math.max(...vals) : Math.min(...vals);
    return new Set(rows.filter((r) => m.value(r) === target).map((r) => r.symbol));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compare securities"
        className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[12px] border border-hairline bg-surface shadow-[var(--shadow-elevation)] sm:rounded-[12px]"
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-fg">Compare</h2>
            <p className="text-xs text-fg-subtle">{rows.length} securities · best value highlighted</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close compare"
            className="flex size-8 items-center justify-center rounded-[6px] text-fg-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-hairline bg-inset">
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
                  Metric
                </th>
                {rows.map((r) => (
                  <th key={r.symbol} className="min-w-[120px] px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TickerLink symbol={r.symbol} className="text-[13px] font-semibold text-fg" />
                      <button
                        type="button"
                        onClick={() => onRemove(r.symbol)}
                        aria-label={`Remove ${r.symbol}`}
                        className="text-fg-subtle transition hover:text-neg"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                    <p className="truncate text-[10px] font-normal text-fg-subtle">{r.sector}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => {
                const winners = leaders(m);
                return (
                  <tr key={m.label} className="border-b border-hairline/60 last:border-0">
                    <td className="px-4 py-2.5 text-left text-[12px] text-fg-subtle">{m.label}</td>
                    {rows.map((r) => (
                      <td key={r.symbol} className="px-4 py-2.5 text-right">
                        <span className={cn(winners.has(r.symbol) && "rounded-[3px] bg-emerald/10 px-1.5 py-0.5 font-semibold")}>
                          {m.render(r)}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
