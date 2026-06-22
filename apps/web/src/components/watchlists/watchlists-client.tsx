"use client";

/**
 * Watchlists — full client experience over mock data: multiple lists, create,
 * select, add via ticker search, remove, and a clean empty state. State is
 * in-memory (no persistence until a backend lands); the operations map 1:1 to
 * future API calls (createList / addItem / removeItem).
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { securities, getSecurity, type Security } from "@/data/markets-mock";
import {
  createWatchlistAction,
  deleteWatchlistAction,
  addWatchlistItemAction,
  removeWatchlistItemAction,
} from "@/server/actions/watchlists";
import type { Watchlist as SeamWatchlist } from "@/server/data/types";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, ChangePill } from "@/components/ui/financial";
import { Sparkline } from "@/components/ui/sparkline";
import { Button, EmptyState } from "@/components/ui/primitives";
import { TickerLink, tickerMenuItems } from "@/components/ui/ticker-link";
import { useContextMenu } from "@/components/ui/context-menu";
import {
  IconEye,
  IconPlus,
  IconSearch,
  IconStar,
  IconTrash,
} from "@/components/ui/icons";

interface List {
  id: string;
  name: string;
  symbols: string[];
}

const toLists = (src: SeamWatchlist[]): List[] =>
  src.map((l) => ({ id: l.id, name: l.name, symbols: l.items.map((i) => i.symbol) }));

export function WatchlistsClient({ initialLists }: { initialLists: SeamWatchlist[] }) {
  const [lists, setLists] = useState<List[]>(() => toLists(initialLists));
  const [activeId, setActiveId] = useState<string>(initialLists[0]?.id ?? "");

  const active = lists.find((l) => l.id === activeId) ?? lists[0];

  // Mutations update local state optimistically AND persist through the seam
  // (server action). On reload the server provides the persisted lists.
  async function createList() {
    const wl = await createWatchlistAction(`Watchlist ${lists.length + 1}`);
    setLists((prev) => [...prev, { id: wl.id, name: wl.name, symbols: [] }]);
    setActiveId(wl.id);
  }

  function deleteList(id: string) {
    setLists((prev) => {
      const remaining = prev.filter((l) => l.id !== id);
      if (id === activeId) setActiveId(remaining[0]?.id ?? "");
      return remaining;
    });
    void deleteWatchlistAction(id).catch(() => {});
  }

  function addSymbol(symbol: string) {
    if (!active) return;
    const id = active.id;
    setLists((prev) =>
      prev.map((l) => (l.id === id && !l.symbols.includes(symbol) ? { ...l, symbols: [symbol, ...l.symbols] } : l)),
    );
    void addWatchlistItemAction(id, symbol).catch(() => {});
  }

  function removeSymbol(symbol: string) {
    if (!active) return;
    const id = active.id;
    setLists((prev) =>
      prev.map((l) => (l.id === id ? { ...l, symbols: l.symbols.filter((s) => s !== symbol) } : l)),
    );
    void removeWatchlistItemAction(id, symbol).catch(() => {});
  }

  const items = useMemo(
    () => (active?.symbols.map(getSecurity).filter(Boolean) as Security[]) ?? [],
    [active],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
      <ListRail
        lists={lists}
        activeId={active?.id ?? ""}
        onSelect={setActiveId}
        onCreate={createList}
        onDelete={deleteList}
      />

      <Card className="flex min-w-0 flex-col">
        {active ? (
          <>
            <CardHeader
              title={active.name}
              subtitle={`${items.length} ${items.length === 1 ? "instrument" : "instruments"}`}
              icon={<IconStar size={16} />}
              action={
                <button
                  type="button"
                  onClick={() => deleteList(active.id)}
                  className="reduce-motion-safe inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs text-fg-subtle transition hover:bg-surface-2 hover:text-neg"
                >
                  <IconTrash size={14} /> Delete list
                </button>
              }
            />

            <div className="border-b border-hairline px-5 py-3">
              <AddTicker existing={active.symbols} onAdd={addSymbol} />
            </div>

            {items.length === 0 ? (
              <EmptyState
                icon={<IconEye size={18} />}
                title="This watchlist is empty"
                description="Search for a ticker above to start tracking it. Prices, day change, and trend will appear here."
              />
            ) : (
              <WatchlistTable items={items} onRemove={removeSymbol} />
            )}
          </>
        ) : (
          <>
            <CardHeader title="Watchlists" subtitle="No list selected" icon={<IconStar size={16} />} />
            <EmptyState
              icon={<IconEye size={18} />}
              title="No watchlists yet"
              description="Create a list from the panel on the left to start tracking instruments."
            />
          </>
        )}
      </Card>
    </div>
  );
}

function ListRail({
  lists,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: {
  lists: List[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader title="Watchlists" subtitle={`${lists.length} ${lists.length === 1 ? "list" : "lists"}`} icon={<IconEye size={16} />} />
      <div className="flex gap-1.5 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
        {lists.map((l) => {
          const active = l.id === activeId;
          return (
            <div
              key={l.id}
              className={cn(
                "group/li reduce-motion-safe flex shrink-0 items-center gap-1 rounded-[6px] pr-1 transition lg:shrink",
                active ? "bg-emerald/10 ring-1 ring-inset ring-emerald/25" : "hover:bg-surface-2",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(l.id)}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2 text-left text-[13px] font-medium transition",
                  active ? "text-fg" : "text-fg-muted group-hover/li:text-fg",
                )}
              >
                <span className="truncate">{l.name}</span>
                <span className="tnum shrink-0 rounded-full bg-inset px-1.5 py-0.5 text-[10px] text-fg-subtle">
                  {l.symbols.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(l.id)}
                aria-label={`Delete ${l.name}`}
                title="Delete list"
                className="reduce-motion-safe flex size-6 shrink-0 items-center justify-center rounded-[4px] text-fg-subtle opacity-0 transition hover:bg-surface hover:text-neg focus-visible:opacity-100 group-hover/li:opacity-100"
              >
                <IconTrash size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="border-t border-hairline p-3">
        <Button variant="outline" onClick={onCreate} className="w-full">
          <IconPlus size={14} /> New list
        </Button>
      </div>
    </Card>
  );
}

function AddTicker({ existing, onAdd }: { existing: string[]; onAdd: (symbol: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return securities
      .filter((s) => !existing.includes(s.symbol))
      .filter((s) => !q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, existing]);

  function add(symbol: string) {
    onAdd(symbol);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="flex items-center gap-2.5 rounded-[6px] border border-hairline bg-inset px-3 py-2 text-fg-muted transition focus-within:border-emerald/40">
        <IconSearch size={16} className="shrink-0 text-fg-subtle" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="Add a ticker — search symbol or name…"
          className="w-full min-w-0 bg-transparent text-[13px] text-fg placeholder:text-fg-subtle focus:outline-none"
        />
      </label>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-[8px] border border-hairline bg-surface-2 p-1 shadow-[var(--shadow-elevation)]">
          {suggestions.map((s) => (
            <li key={s.symbol}>
              <button
                type="button"
                // onMouseDown fires before input blur, so the add registers.
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(s.symbol);
                }}
                className="reduce-motion-safe flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left transition hover:bg-surface"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold tracking-tight text-fg">{s.symbol}</p>
                  <p className="truncate text-[11px] text-fg-subtle">{s.name}</p>
                </div>
                <span className="text-[11px] text-fg-subtle">{s.sector}</span>
                <Money value={s.price} className="w-20 text-right text-[12px] text-fg-muted" />
                <IconPlus size={15} className="shrink-0 text-emerald" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WatchlistTable({ items, onRemove }: { items: Security[]; onRemove: (symbol: string) => void }) {
  const router = useRouter();
  const { openMenu } = useContextMenu();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-hairline text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
            <th className="bg-inset/40 px-4 py-2.5 text-left font-medium">Instrument</th>
            <th className="bg-inset/40 px-4 py-2.5 text-right font-medium">Price</th>
            <th className="bg-inset/40 px-4 py-2.5 text-right font-medium">Day</th>
            <th className="hidden bg-inset/40 px-4 py-2.5 text-right font-medium md:table-cell">Mkt Cap</th>
            <th className="hidden bg-inset/40 px-4 py-2.5 text-right font-medium sm:table-cell">Volume</th>
            <th className="bg-inset/40 px-4 py-2.5 text-center font-medium">Trend</th>
            <th className="bg-inset/40 px-2 py-2.5" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr
              key={s.symbol}
              className="group border-b border-hairline/60 transition last:border-0 hover:bg-surface-2/40"
              onContextMenu={(e) =>
                openMenu(e, [
                  ...tickerMenuItems(s.symbol, router),
                  { separator: true, label: "" },
                  { label: "Remove from list", icon: <IconTrash size={14} />, danger: true, onSelect: () => onRemove(s.symbol) },
                ])
              }
            >
              <td className="px-4 py-3">
                <TickerLink symbol={s.symbol} className="block w-fit font-semibold tracking-tight text-fg" />
                <div className="max-w-[200px] truncate text-[11px] text-fg-subtle">{s.name}</div>
              </td>
              <td className="px-4 py-3 text-right">
                <Money value={s.price} className="text-fg" />
              </td>
              <td className="px-4 py-3 text-right">
                <ChangePill value={s.changePct} />
              </td>
              <td className="hidden px-4 py-3 text-right md:table-cell">
                <Money value={s.marketCapB * 1e9} compact className="text-fg-muted" />
              </td>
              <td className="hidden px-4 py-3 text-right tnum text-fg-muted sm:table-cell">
                {formatNumber(s.volumeM, 0)}M
              </td>
              <td className="px-4 py-3">
                <div className="mx-auto w-16">
                  <Sparkline data={s.trend} width={64} height={22} tone={s.changePct < 0 ? "neg" : "pos"} fill={false} />
                </div>
              </td>
              <td className="px-2 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onRemove(s.symbol)}
                  aria-label={`Remove ${s.symbol}`}
                  className="reduce-motion-safe inline-flex size-7 items-center justify-center rounded-[4px] text-fg-subtle opacity-0 transition hover:bg-surface hover:text-neg focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <IconTrash size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
