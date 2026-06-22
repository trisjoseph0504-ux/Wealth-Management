"use client";

/** Screener filter panel — categorical + numeric-range facets over the universe. */
import type { ReactNode } from "react";
import {
  SECTORS,
  INDUSTRIES,
  activeFilterCount,
  type ScreenFilters,
  type Range52,
} from "@/data/screener-mock";
import { cn } from "@/lib/cn";
import { CardHeader } from "@/components/ui/card";
import { IconFilter } from "@/components/ui/icons";

export function FilterPanel({
  filters,
  set,
  onReset,
}: {
  filters: ScreenFilters;
  set: (patch: Partial<ScreenFilters>) => void;
  onReset: () => void;
}) {
  const active = activeFilterCount(filters);

  return (
    <div className="flex flex-col">
      <CardHeader
        title="Filters"
        subtitle={active ? `${active} active` : "Refine the universe"}
        icon={<IconFilter size={16} />}
        action={
          active ? (
            <button
              type="button"
              onClick={onReset}
              className="reduce-motion-safe rounded-[4px] px-2 py-1 text-[11px] font-medium text-fg-subtle transition hover:bg-surface-2 hover:text-fg"
            >
              Reset all
            </button>
          ) : undefined
        }
      />

      <div className="space-y-5 px-5 py-5">
        <Group label="Sector">
          <div className="flex flex-wrap gap-1.5">
            {SECTORS.map((s) => {
              const on = filters.sectors.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    set({ sectors: on ? filters.sectors.filter((x) => x !== s) : [...filters.sectors, s] })
                  }
                  className={cn(
                    "reduce-motion-safe rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                    on
                      ? "border-emerald/40 bg-emerald/10 text-emerald-bright"
                      : "border-hairline bg-inset text-fg-muted hover:text-fg",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Group>

        <Group label="Industry">
          <select
            value={filters.industry}
            onChange={(e) => set({ industry: e.target.value })}
            className="w-full rounded-[6px] border border-hairline bg-inset px-3 py-2 text-[13px] text-fg transition focus:border-emerald/40 focus:outline-none"
          >
            <option value="All">All industries</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Group>

        <Group label="Market Cap" hint="$B">
          <RangePair
            min={filters.mcapMin}
            max={filters.mcapMax}
            onMin={(v) => set({ mcapMin: v })}
            onMax={(v) => set({ mcapMax: v })}
            step={10}
          />
        </Group>

        <Group label="P/E Ratio">
          <RangePair min={filters.peMin} max={filters.peMax} onMin={(v) => set({ peMin: v })} onMax={(v) => set({ peMax: v })} step={1} />
        </Group>

        <Group label="Dividend Yield" hint="min %">
          <SingleInput value={filters.divMin} onChange={(v) => set({ divMin: v })} placeholder="0.0" step={0.5} />
        </Group>

        <Group label="Beta">
          <RangePair min={filters.betaMin} max={filters.betaMax} onMin={(v) => set({ betaMin: v })} onMax={(v) => set({ betaMax: v })} step={0.1} />
        </Group>

        <Group label="Volume" hint="min, M shares">
          <SingleInput value={filters.volMin} onChange={(v) => set({ volMin: v })} placeholder="0" step={5} />
        </Group>

        <Group label="52-Week Range">
          <Segmented
            value={filters.range52}
            options={[
              { value: "any", label: "Any" },
              { value: "nearLow", label: "Near Low" },
              { value: "nearHigh", label: "Near High" },
            ]}
            onChange={(v) => set({ range52: v as Range52 })}
          />
        </Group>

        <Group label="1Y Performance" hint="%">
          <RangePair min={filters.perfMin} max={filters.perfMax} onMin={(v) => set({ perfMin: v })} onMax={(v) => set({ perfMax: v })} step={5} />
        </Group>
      </div>
    </div>
  );
}

function Group({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">{label}</span>
        {hint && <span className="text-[10px] text-fg-subtle">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
  step,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder: string;
  step?: number;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "") return onChange(null);
        const n = Number(v);
        onChange(Number.isNaN(n) ? null : n);
      }}
      className="tnum w-full rounded-[6px] border border-hairline bg-inset px-3 py-1.5 text-[13px] text-fg placeholder:text-fg-subtle transition focus:border-emerald/40 focus:outline-none"
    />
  );
}

function RangePair({
  min,
  max,
  onMin,
  onMax,
  step,
}: {
  min: number | null;
  max: number | null;
  onMin: (v: number | null) => void;
  onMax: (v: number | null) => void;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <NumInput value={min} onChange={onMin} placeholder="Min" step={step} />
      <span className="text-fg-subtle">–</span>
      <NumInput value={max} onChange={onMax} placeholder="Max" step={step} />
    </div>
  );
}

function SingleInput({
  value,
  onChange,
  placeholder,
  step,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder: string;
  step?: number;
}) {
  return <NumInput value={value} onChange={onChange} placeholder={placeholder} step={step} />;
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-[6px] border border-hairline bg-inset p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "reduce-motion-safe flex-1 rounded-[4px] px-2 py-1 text-[11px] font-medium transition",
            value === o.value ? "bg-surface-2 text-fg" : "text-fg-subtle hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
