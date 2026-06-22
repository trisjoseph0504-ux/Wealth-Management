"use client";

/**
 * Holdings table (Backend B3) — search, asset-class filter, sortable columns, and
 * editable: add a holding (symbol + quantity + avg cost) or remove one. Mutations
 * persist through the data seam (server actions) and `router.refresh()` re-derives
 * the whole portfolio page so every section stays consistent.
 */
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ASSET_CLASSES, type Holding, type AssetClass } from "@/data/portfolio-mock";
import { addHoldingAction, removeHoldingAction } from "@/server/actions/holdings";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent, Delta } from "@/components/ui/financial";
import { Button, EmptyState } from "@/components/ui/primitives";
import { SymbolCombobox } from "@/components/ui/symbol-combobox";
import { TickerLink } from "@/components/ui/ticker-link";
import { IconSearch, IconLayers, IconArrowUp, IconArrowDown, IconPlus, IconTrash, IconClose } from "@/components/ui/icons";

type SortKey = "symbol" | "assetClass" | "quantity" | "price" | "marketValue" | "dayChangePct" | "gainUsd" | "weightPct";
type SortDir = "asc" | "desc";

interface Column {
  key: SortKey;
  label: string;
  numeric: boolean;
  cell?: string;
}

const COLUMNS: Column[] = [
  { key: "symbol", label: "Holding", numeric: false },
  { key: "assetClass", label: "Class", numeric: false, cell: "hidden lg:table-cell" },
  { key: "quantity", label: "Quantity", numeric: true, cell: "hidden md:table-cell" },
  { key: "price", label: "Price", numeric: true, cell: "hidden sm:table-cell" },
  { key: "marketValue", label: "Mkt Value", numeric: true },
  { key: "dayChangePct", label: "Day", numeric: true },
  { key: "gainUsd", label: "Total Gain", numeric: true, cell: "hidden md:table-cell" },
  { key: "weightPct", label: "Weight", numeric: true },
];

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [assetFilter, setAssetFilter] = useState<AssetClass | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("weightPct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showAdd, setShowAdd] = useState(false);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = holdings.filter((h) => {
      const matchesQuery = !q || h.symbol.toLowerCase().includes(q) || h.name.toLowerCase().includes(q);
      const matchesClass = assetFilter === "All" || h.assetClass === assetFilter;
      return matchesQuery && matchesClass;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [holdings, query, assetFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey, numeric: boolean) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(numeric ? "desc" : "asc");
    }
  }

  function remove(id: string) {
    startTransition(async () => {
      await removeHoldingAction(id);
      router.refresh();
    });
  }

  const filters: (AssetClass | "All")[] = ["All", ...ASSET_CLASSES];

  return (
    <Card>
      <CardHeader
        title="Holdings"
        subtitle={`${rows.length} of ${holdings.length} positions`}
        icon={<IconLayers size={16} />}
        action={
          <div className="flex items-center gap-2">
            <label className="hidden items-center gap-2 rounded-[6px] border border-hairline bg-inset px-2.5 py-1.5 text-fg-muted transition focus-within:border-emerald/40 sm:flex">
              <IconSearch size={14} className="shrink-0 text-fg-subtle" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-28 min-w-0 bg-transparent text-xs text-fg placeholder:text-fg-subtle focus:outline-none sm:w-32"
              />
            </label>
            <Button variant="outline" onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? <IconClose size={14} /> : <IconPlus size={14} />} {showAdd ? "Close" : "Add"}
            </Button>
          </div>
        }
      />

      {showAdd && <AddHoldingForm onDone={() => setShowAdd(false)} />}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 border-b border-hairline px-5 py-3">
        {filters.map((f) => {
          const active = assetFilter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setAssetFilter(f)}
              className={cn(
                "reduce-motion-safe rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                active ? "border-emerald/40 bg-emerald/10 text-emerald-bright" : "border-hairline bg-inset text-fg-muted hover:text-fg",
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<IconLayers size={18} />}
          title={holdings.length === 0 ? "No holdings yet" : "No holdings match"}
          description={
            holdings.length === 0
              ? "Add your first position with the Add button — it saves to your account."
              : "Try a different symbol, name, or asset class."
          }
        />
      ) : (
        <div className={cn("overflow-x-auto", pending && "opacity-60")}>
          <table className="w-full min-w-[600px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={cn("bg-inset/40 px-4 py-2.5 font-medium text-fg-subtle", col.numeric ? "text-right" : "text-left", col.cell)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key, col.numeric)}
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] transition hover:text-fg",
                        col.numeric && "flex-row-reverse",
                        sortKey === col.key && "text-fg",
                      )}
                    >
                      {col.label}
                      {sortKey === col.key && (sortDir === "asc" ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />)}
                    </button>
                  </th>
                ))}
                <th className="bg-inset/40 px-2 py-2.5" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <HoldingRow key={h.id} h={h} onRemove={() => remove(h.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function HoldingRow({ h, onRemove }: { h: Holding; onRemove: () => void }) {
  return (
    <tr className="group reduce-motion-safe border-b border-hairline/60 transition last:border-0 hover:bg-surface-2/40">
      <td className="px-4 py-3">
        <TickerLink symbol={h.symbol} className="block w-fit font-semibold tracking-tight text-fg" />
        <div className="max-w-[180px] truncate text-[11px] text-fg-subtle">{h.name}</div>
      </td>
      <td className="hidden px-4 py-3 text-left lg:table-cell">
        <span className="rounded-full border border-hairline bg-inset px-2 py-0.5 text-[11px] text-fg-muted">{h.assetClass}</span>
      </td>
      <td className="hidden px-4 py-3 text-right tnum text-fg-muted md:table-cell">{formatNumber(h.quantity, 0)}</td>
      <td className="hidden px-4 py-3 text-right sm:table-cell">
        <Money value={h.price} className="text-fg" />
      </td>
      <td className="px-4 py-3 text-right">
        <Money value={h.marketValue} compact className="font-medium text-fg" />
      </td>
      <td className="px-4 py-3 text-right">
        <Percent value={h.dayChangePct} />
      </td>
      <td className="hidden px-4 py-3 text-right md:table-cell">
        <Delta value={h.gainUsd} currency="USD" className="text-[13px]" />
      </td>
      <td className="px-4 py-3 text-right tnum text-fg">{h.weightPct.toFixed(1)}%</td>
      <td className="px-2 py-3 text-right">
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${h.symbol}`}
          className="reduce-motion-safe inline-flex size-7 items-center justify-center rounded-[4px] text-fg-subtle opacity-0 transition hover:bg-surface hover:text-neg focus-visible:opacity-100 group-hover:opacity-100"
        >
          <IconTrash size={15} />
        </button>
      </td>
    </tr>
  );
}

function AddHoldingForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await addHoldingAction(symbol, Number(quantity), Number(avgCost));
      if (res && typeof res === "object" && "error" in res) {
        setError(res.error);
        return;
      }
      setSymbol("");
      setQuantity("");
      setAvgCost("");
      onDone();
      router.refresh();
    });
  }

  return (
    <div className="border-b border-hairline bg-inset/30 px-5 py-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-end">
        <Field label="Ticker">
          <SymbolCombobox
            value={symbol}
            onChange={setSymbol}
            onSelect={(hit) => setSymbol(hit.symbol)}
            placeholder="Search e.g. Apple or AAPL"
          />
        </Field>
        <Field label="Quantity">
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="decimal"
            placeholder="100"
            className="tnum w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-[13px] text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none"
          />
        </Field>
        <Field label="Avg cost">
          <input
            value={avgCost}
            onChange={(e) => setAvgCost(e.target.value)}
            inputMode="decimal"
            placeholder="150.00"
            className="tnum w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-[13px] text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none"
          />
        </Field>
        <Button variant="primary" onClick={submit} disabled={pending} className="h-[38px] justify-center">
          {pending ? "Adding…" : "Add holding"}
        </Button>
      </div>
      {error && <p className="mt-2 text-[12px] text-neg">{error}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">{label}</span>
      {children}
    </label>
  );
}
