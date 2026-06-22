"use client";

/**
 * Screener orchestrator — owns filter/sort/selection/preset state, composes the
 * filter panel, summary, results table, and compare dialog. All client-side over
 * mock data; the filter/sort/summarize logic lives in screener-mock as pure
 * functions, so it maps cleanly to a future server-side query.
 */
import { useMemo, useState } from "react";
import {
  screenerRows,
  applyFilters,
  summarize,
  activeFilterCount,
  builtInPresets,
  defaultFilters,
  type ScreenFilters,
  type ScreenPreset,
  type ScreenerRow,
} from "@/data/screener-mock";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/primitives";
import { FilterPanel } from "@/components/screener/filter-panel";
import { SummaryStats } from "@/components/screener/summary-stats";
import { ResultsTable, type SortKey } from "@/components/screener/results-table";
import { CompareDialog } from "@/components/screener/compare-dialog";
import { saveScreenAction } from "@/server/actions/screens";
import type { SavedScreen } from "@/server/data/types";
import { IconSearch, IconFilter, IconGrid, IconPlus, IconClose } from "@/components/ui/icons";

export function ScreenerClient({ initialSaved }: { initialSaved: SavedScreen[] }) {
  const [filters, setFilters] = useState<ScreenFilters>(defaultFilters);
  const [sortKey, setSortKey] = useState<SortKey>("marketCapB");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [presets, setPresets] = useState<ScreenPreset[]>(() => [
    ...builtInPresets,
    ...initialSaved.map((s) => ({
      id: s.id,
      name: s.name,
      description: "Saved",
      filters: s.criteria as unknown as ScreenFilters,
    })),
  ]);
  const [activePreset, setActivePreset] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  const results = useMemo(() => {
    const filtered = applyFilters(screenerRows, filters);
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [filters, sortKey, sortDir]);

  const summary = useMemo(() => summarize(applyFilters(screenerRows, filters)), [filters]);
  const selectedRows = useMemo<ScreenerRow[]>(
    () => screenerRows.filter((r) => selected.has(r.symbol)),
    [selected],
  );

  function set(patch: Partial<ScreenFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setActivePreset("");
  }
  function reset() {
    setFilters(defaultFilters);
    setActivePreset("all");
  }
  function applyPreset(p: ScreenPreset) {
    setFilters(p.filters);
    setActivePreset(p.id);
  }
  async function savePreset() {
    const count = presets.filter((p) => p.description === "Saved").length + 1;
    const saved = await saveScreenAction(`Saved Screen ${count}`, filters as unknown as Record<string, unknown>);
    setPresets((prev) => [...prev, { id: saved.id, name: saved.name, description: "Saved", filters: { ...filters } }]);
    setActivePreset(saved.id);
  }
  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "symbol" || key === "sector" ? "asc" : "desc");
    }
  }
  function toggleSelect(symbol: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  }

  const active = activeFilterCount(filters);

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader
          title="Saved Screens"
          subtitle="Presets · click to apply"
          icon={<IconFilter size={16} />}
          action={
            <Button variant="outline" onClick={savePreset}>
              <IconPlus size={14} /> Save current
            </Button>
          }
        />
        <div className="flex gap-2 overflow-x-auto px-5 py-3.5">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              title={p.description}
              className={cn(
                "reduce-motion-safe shrink-0 rounded-[8px] border px-3 py-2 text-left transition",
                activePreset === p.id
                  ? "border-emerald/40 bg-emerald/10"
                  : "border-hairline bg-inset hover:border-line-strong",
              )}
            >
              <p className={cn("text-[12px] font-semibold tracking-tight", activePreset === p.id ? "text-emerald-bright" : "text-fg")}>
                {p.name}
              </p>
              <p className="text-[10px] text-fg-subtle">{p.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[6px] border border-hairline bg-inset px-3 py-2 text-fg-muted transition focus-within:border-emerald/40 sm:max-w-md">
          <IconSearch size={16} className="shrink-0 text-fg-subtle" />
          <input
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Search ticker or company…"
            className="w-full min-w-0 bg-transparent text-[13px] text-fg placeholder:text-fg-subtle focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "reduce-motion-safe inline-flex items-center gap-2 rounded-[6px] border px-3 py-2 text-xs font-medium transition lg:hidden",
            active ? "border-emerald/40 bg-emerald/10 text-emerald-bright" : "border-hairline bg-inset text-fg-muted",
          )}
        >
          <IconFilter size={15} /> Filters{active ? ` · ${active}` : ""}
        </button>
        <Button
          variant={selected.size >= 2 ? "primary" : "outline"}
          onClick={() => setCompareOpen(true)}
          disabled={selected.size < 2}
        >
          <IconGrid size={14} /> Compare{selected.size ? ` · ${selected.size}` : ""}
        </Button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="reduce-motion-safe inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-xs text-fg-subtle transition hover:text-fg"
          >
            <IconClose size={13} /> Clear
          </button>
        )}
      </div>

      <SummaryStats s={summary} total={screenerRows.length} />

      {/* Filters + results */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className={cn("lg:block", filtersOpen ? "block" : "hidden")}>
          <Card className="lg:sticky lg:top-20">
            <FilterPanel filters={filters} set={set} onReset={reset} />
          </Card>
        </div>

        <Card className="min-w-0">
          <CardHeader
            title="Results"
            subtitle={`${results.length} ${results.length === 1 ? "security" : "securities"}`}
            icon={<IconGrid size={16} />}
          />
          <ResultsTable
            rows={results}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={toggleSort}
            selected={selected}
            onToggle={toggleSelect}
          />
        </Card>
      </div>

      {compareOpen && selectedRows.length >= 2 && (
        <CompareDialog rows={selectedRows} onClose={() => setCompareOpen(false)} onRemove={toggleSelect} />
      )}
    </div>
  );
}
