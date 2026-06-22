"use client";

/**
 * Compare — add securities (any ticker: stocks, ETFs, funds) and see them side by
 * side, best value in each row highlighted. Live price/change overlaid; metrics
 * fetched per symbol via a server action.
 */
import { useState, useTransition, type ReactNode } from "react";
import { compareSecurityAction, type CompareCard } from "@/server/actions/compare";
import type { SymbolHit } from "@/server/market/types";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent, ChangePill } from "@/components/ui/financial";
import { EmptyState } from "@/components/ui/primitives";
import { SymbolCombobox } from "@/components/ui/symbol-combobox";
import { TickerLink } from "@/components/ui/ticker-link";
import { CompareAnalysis } from "@/components/compare/compare-analysis";
import { IconGrid, IconTrash, IconCheck } from "@/components/ui/icons";

interface Metric {
  label: string;
  best?: "max" | "min";
  value: (c: CompareCard) => number;
  render: (c: CompareCard) => ReactNode;
}

const METRICS: Metric[] = [
  { label: "Price", value: (c) => c.price, render: (c) => <Money value={c.price} /> },
  { label: "Day", best: "max", value: (c) => c.changePct, render: (c) => <ChangePill value={c.changePct} /> },
  { label: "Market Cap", best: "max", value: (c) => c.marketCapB, render: (c) => <Money value={c.marketCapB * 1e9} compact /> },
  { label: "P/E (TTM)", best: "min", value: (c) => c.peRatio, render: (c) => <span className="tnum">{c.peRatio.toFixed(1)}×</span> },
  { label: "Dividend Yield", best: "max", value: (c) => c.dividendYieldPct, render: (c) => <span className="tnum">{c.dividendYieldPct.toFixed(2)}%</span> },
  { label: "Beta", value: (c) => c.beta, render: (c) => <span className="tnum">{c.beta.toFixed(2)}</span> },
  { label: "Volume", value: (c) => c.volumeM, render: (c) => <span className="tnum">{formatNumber(c.volumeM, 0)}M</span> },
  { label: "52W Range", value: (c) => c.week52PosPct, render: (c) => <span className="tnum">{c.week52PosPct.toFixed(0)}%</span> },
  { label: "1M Return", best: "max", value: (c) => c.perf1M, render: (c) => <Percent value={c.perf1M} /> },
  { label: "YTD Return", best: "max", value: (c) => c.perfYTD, render: (c) => <Percent value={c.perfYTD} /> },
  { label: "1Y Return", best: "max", value: (c) => c.perf1Y, render: (c) => <Percent value={c.perf1Y} /> },
];

const MAX_CARDS = 4;

export function CompareClient({ initialCards }: { initialCards: CompareCard[] }) {
  const [cards, setCards] = useState<CompareCard[]>(initialCards);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add(symbol: string) {
    const sym = symbol.trim().toUpperCase();
    setError(null);
    if (!sym) return;
    if (cards.some((c) => c.symbol === sym)) {
      setError(`${sym} is already in the comparison.`);
      return;
    }
    if (cards.length >= MAX_CARDS) {
      setError(`Up to ${MAX_CARDS} at a time — remove one to add another.`);
      return;
    }
    startTransition(async () => {
      const card = await compareSecurityAction(sym);
      if (!card) {
        setError(`Couldn't find data for "${sym}".`);
        return;
      }
      setCards((prev) => (prev.some((c) => c.symbol === card.symbol) ? prev : [...prev, card]));
      setQuery("");
    });
  }

  function remove(symbol: string) {
    setCards((prev) => prev.filter((c) => c.symbol !== symbol));
  }

  function leaders(m: Metric): Set<string> {
    if (!m.best || cards.length < 2) return new Set();
    const vals = cards.map(m.value);
    const target = m.best === "max" ? Math.max(...vals) : Math.min(...vals.filter((v) => v > 0));
    return new Set(cards.filter((c) => m.value(c) === target).map((c) => c.symbol));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Add to comparison"
          subtitle={`${cards.length} of ${MAX_CARDS} · search any stock, ETF, or fund`}
          icon={<IconGrid size={16} />}
        />
        <div className="px-5 py-4">
          <div className="max-w-md">
            <SymbolCombobox
              value={query}
              onChange={setQuery}
              onSelect={(h: SymbolHit) => add(h.symbol)}
              placeholder="Search e.g. Apple, VOO, SPY…"
            />
          </div>
          {pending && <p className="mt-2 text-[12px] text-fg-subtle">Loading…</p>}
          {error && <p className="mt-2 text-[12px] text-neg">{error}</p>}
        </div>
      </Card>

      {cards.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconGrid size={18} />}
            title="Nothing to compare yet"
            description="Search above to add securities. Add two or more to see the best value in each row highlighted."
          />
        </Card>
      ) : (
        <>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-hairline bg-inset">
                  <th className="min-w-[120px] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
                    Metric
                  </th>
                  {cards.map((c) => (
                    <th key={c.symbol} className="min-w-[140px] px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TickerLink symbol={c.symbol} className="text-[14px] font-semibold text-fg" />
                        <button
                          type="button"
                          onClick={() => remove(c.symbol)}
                          aria-label={`Remove ${c.symbol}`}
                          className="text-fg-subtle transition hover:text-neg"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                      <p className="truncate text-[10px] font-normal text-fg-subtle">{c.name}</p>
                      <p className="truncate text-[10px] font-normal text-fg-subtle">{c.exchange} · {c.sector}</p>
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
                      {cards.map((c) => {
                        const winner = winners.has(c.symbol);
                        return (
                          <td key={c.symbol} className="px-4 py-2.5 text-right">
                            <span
                              className={cn(
                                "inline-flex items-center justify-end gap-1.5",
                                winner && "font-semibold text-emerald-bright",
                              )}
                            >
                              {winner && <IconCheck size={12} className="shrink-0 text-emerald" />}
                              {m.render(c)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-hairline px-4 py-2.5 text-[10px] text-fg-subtle">
            Price &amp; day change are live; valuation and returns are illustrative derived figures. Best value in each row highlighted.
          </p>
        </Card>
        <CompareAnalysis cards={cards} />
        </>
      )}
    </div>
  );
}
