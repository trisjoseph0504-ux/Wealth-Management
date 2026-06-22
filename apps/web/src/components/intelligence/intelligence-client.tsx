"use client";

/**
 * Advisor Intelligence Center orchestrator. Ranks insights by importance, owns
 * the Monitor / Create-alert / Dismiss state, and provides view + category
 * filtering. Client-side over mock data; interactions map to future API calls.
 */
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  CATEGORY_LABEL,
  type Insight,
  type Briefing,
  type InsightCategory,
} from "@/data/intelligence-mock";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/primitives";
import { BriefingCard } from "@/components/intelligence/briefing-card";
import { InsightCard } from "@/components/intelligence/insight-card";
import { IconSparkles, IconStar, IconClose, IconChevronRight } from "@/components/ui/icons";

type View = "priorities" | "monitoring" | "dismissed";

export function IntelligenceClient({ insights: seedInsights, briefing }: { insights: Insight[]; briefing: Briefing }) {
  const [monitored, setMonitored] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [alertsCreated, setAlertsCreated] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("priorities");
  const [category, setCategory] = useState<InsightCategory | "all">("all");

  const ranked = useMemo(() => [...seedInsights].sort((a, b) => b.score - a.score), [seedInsights]);
  const toggle = (set: Dispatch<SetStateAction<Set<string>>>, id: string) =>
    set((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const visible = useMemo(() => {
    let list = ranked.filter((i) => !dismissed.has(i.id));
    if (view === "monitoring") list = list.filter((i) => monitored.has(i.id));
    if (category !== "all") list = list.filter((i) => i.category === category);
    return list;
  }, [ranked, dismissed, monitored, view, category]);

  const dismissedList = ranked.filter((i) => dismissed.has(i.id));
  const categories: (InsightCategory | "all")[] = ["all", "risk", "opportunity", "rebalance", "watchlist", "market"];

  return (
    <div className="space-y-6">
      <BriefingCard briefing={briefing} />

      <Card>
        <CardHeader
          title="Priority Insights"
          subtitle="Ranked by importance · evidence-based"
          icon={<IconSparkles size={16} />}
          action={
            monitored.size > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald">
                <IconStar size={12} /> {monitored.size} monitoring
              </span>
            ) : undefined
          }
        />

        {/* View tabs */}
        <div className="flex items-center gap-1 border-b border-hairline px-3 py-2">
          <Tab active={view === "priorities"} onClick={() => setView("priorities")} label="Priorities" />
          <Tab active={view === "monitoring"} onClick={() => setView("monitoring")} label="Monitoring" count={monitored.size} />
          <Tab active={view === "dismissed"} onClick={() => setView("dismissed")} label="Dismissed" count={dismissed.size} muted />
        </div>

        {/* Category filter */}
        {view !== "dismissed" && (
          <div className="flex flex-wrap gap-1.5 border-b border-hairline px-4 py-3 sm:px-5">
            {categories.map((c) => {
              const on = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "reduce-motion-safe rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                    on ? "border-emerald/40 bg-emerald/10 text-fg" : "border-hairline bg-inset text-fg-muted hover:text-fg",
                  )}
                >
                  {c === "all" ? "All" : CATEGORY_LABEL[c]}
                </button>
              );
            })}
          </div>
        )}

        {/* Body */}
        {view === "dismissed" ? (
          dismissedList.length === 0 ? (
            <EmptyState
              icon={<IconClose size={18} />}
              title="Nothing dismissed"
              description="Insights you dismiss are kept here so you can revisit or restore them."
            />
          ) : (
            <ul className="divide-y divide-hairline">
              {dismissedList.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-fg-muted">{i.title}</span>
                    <span className="text-[11px] text-fg-subtle">{CATEGORY_LABEL[i.category]}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(setDismissed, i.id)}
                    className="reduce-motion-safe inline-flex shrink-0 items-center gap-1 rounded-[4px] px-2 py-1 text-[12px] text-emerald transition hover:bg-emerald/10"
                  >
                    Restore <IconChevronRight size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<IconStar size={18} />}
            title={view === "monitoring" ? "Nothing monitored yet" : "No insights match"}
            description={
              view === "monitoring"
                ? "Star an insight to track it here while you decide what to do next."
                : "No insights in this category right now. New intelligence appears as portfolio, market, and risk conditions change."
            }
          />
        ) : (
          <div className="space-y-4 p-4 sm:p-5">
            {visible.map((i) => (
              <InsightCard
                key={i.id}
                insight={i}
                monitored={monitored.has(i.id)}
                alertCreated={alertsCreated.has(i.id)}
                onMonitor={(id) => toggle(setMonitored, id)}
                onCreateAlert={(id) => toggle(setAlertsCreated, id)}
                onDismiss={(id) => toggle(setDismissed, id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
  muted = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "reduce-motion-safe inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition",
        active ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg",
      )}
    >
      {label}
      {count != null && count > 0 && (
        <span
          className={cn(
            "tnum rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            muted ? "bg-inset text-fg-subtle" : "bg-emerald/15 text-emerald-bright",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
