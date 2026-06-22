"use client";

/**
 * Alerts & Notifications center. Inbox + archive (history), severity/category
 * filtering, sorting, and mark-read / archive interactions. Client-side state
 * over mock data; the operations map to future markRead / archive API calls.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CATEGORY_LABEL,
  SEVERITY_LABEL,
  type Alert,
  type Severity,
  type AlertCategory,
} from "@/data/alerts-mock";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { Button, EmptyState } from "@/components/ui/primitives";
import { AlertRow } from "@/components/alerts/alert-row";
import { SEVERITY_META, SEVERITY_ORDER } from "@/components/alerts/alert-meta";
import { IconInbox, IconArchive, IconCheck, IconBell } from "@/components/ui/icons";

type Tab = "inbox" | "archived";
type Sort = "recent" | "severity";
type SevFilter = Severity | "all";

const DISMISSED_KEY = "lwi-alerts-dismissed";

export function AlertsClient({ seed }: { seed: Alert[] }) {
  const [alerts, setAlerts] = useState<Alert[]>(() => seed.map((a) => ({ ...a })));
  const [tab, setTab] = useState<Tab>("inbox");
  const [sev, setSev] = useState<SevFilter>("all");
  const [category, setCategory] = useState<AlertCategory | "all">("all");
  const [sort, setSort] = useState<Sort>("recent");

  const inbox = alerts.filter((a) => !a.archived);
  const unreadCount = inbox.filter((a) => !a.read).length;
  const archivedCount = alerts.filter((a) => a.archived).length;

  const summary = {
    unread: unreadCount,
    critical: inbox.filter((a) => a.severity === "critical").length,
    caution: inbox.filter((a) => a.severity === "caution").length,
    actions: inbox.filter((a) => a.category === "rebalance").length,
  };

  const list = useMemo(() => {
    const base = alerts.filter((a) => (tab === "archived" ? a.archived : !a.archived));
    const filtered = base.filter(
      (a) => (sev === "all" || a.severity === sev) && (category === "all" || a.category === category),
    );
    return [...filtered].sort((a, b) =>
      sort === "severity"
        ? SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.ageMin - b.ageMin
        : a.ageMin - b.ageMin,
    );
  }, [alerts, tab, sev, category, sort]);

  // Permanently dismissed alerts persist in the browser, so deletions survive
  // reloads even though the alert list is regenerated server-side each visit.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (raw) {
        const dismissed = new Set<string>(JSON.parse(raw));
        if (dismissed.size) setAlerts((p) => p.filter((a) => !dismissed.has(a.id)));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const markRead = (id: string) => setAlerts((p) => p.map((a) => (a.id === id ? { ...a, read: true } : a)));
  const archive = (id: string) => setAlerts((p) => p.map((a) => (a.id === id ? { ...a, archived: true, read: true } : a)));
  const markAllRead = () => setAlerts((p) => p.map((a) => (a.archived ? a : { ...a, read: true })));
  const deleteAlert = (id: string) => {
    setAlerts((p) => p.filter((a) => a.id !== id));
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      set.add(id);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
    } catch {
      /* ignore */
    }
  };

  const categories: (AlertCategory | "all")[] = ["all", "drift", "concentration", "risk", "price", "earnings", "watchlist", "rebalance"];
  const sevFilters: SevFilter[] = ["all", "critical", "caution", "info"];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
          <Summary label="Unread" value={summary.unread} accent="var(--color-emerald)" />
          <Summary label="Critical" value={summary.critical} accent="var(--color-neg)" />
          <Summary label="Caution" value={summary.caution} accent="var(--color-warn)" />
          <Summary label="Recommended Actions" value={summary.actions} accent="var(--color-info)" />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Notifications"
          subtitle={unreadCount ? `${unreadCount} unread` : "All caught up"}
          icon={<IconBell size={16} />}
          action={
            unreadCount > 0 ? (
              <Button variant="outline" onClick={markAllRead}>
                <IconCheck size={14} /> Mark all read
              </Button>
            ) : undefined
          }
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-hairline px-3 py-2">
          <TabButton active={tab === "inbox"} onClick={() => setTab("inbox")} icon={<IconInbox size={15} />} label="Inbox" count={unreadCount} />
          <TabButton active={tab === "archived"} onClick={() => setTab("archived")} icon={<IconArchive size={15} />} label="Archived" count={archivedCount} muted />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-3 sm:px-5">
          <div className="flex flex-wrap gap-1.5">
            {sevFilters.map((s) => {
              const on = sev === s;
              const color = s !== "all" ? SEVERITY_META[s].color : undefined;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSev(s)}
                  className={cn(
                    "reduce-motion-safe inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                    on ? "border-emerald/40 bg-emerald/10 text-fg" : "border-hairline bg-inset text-fg-muted hover:text-fg",
                  )}
                >
                  {color && <span className="size-1.5 rounded-full" style={{ background: color }} />}
                  {s === "all" ? "All" : SEVERITY_LABEL[s]}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AlertCategory | "all")}
              className="rounded-[6px] border border-hairline bg-inset px-2.5 py-1.5 text-[12px] text-fg transition focus:border-emerald/40 focus:outline-none"
            >
              <option value="all">All categories</option>
              {categories.slice(1).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c as AlertCategory]}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-[6px] border border-hairline bg-inset px-2.5 py-1.5 text-[12px] text-fg transition focus:border-emerald/40 focus:outline-none"
            >
              <option value="recent">Most recent</option>
              <option value="severity">By severity</option>
            </select>
          </div>
        </div>

        {/* List */}
        {list.length === 0 ? (
          <EmptyState
            icon={tab === "archived" ? <IconArchive size={18} /> : <IconInbox size={18} />}
            title={tab === "archived" ? "No archived alerts" : "You're all caught up"}
            description={
              tab === "archived"
                ? "Archived alerts and resolved notifications will appear here as a running history."
                : "No notifications match the current filters. New investment, risk, and portfolio events will surface here."
            }
          />
        ) : (
          <ul>
            {list.map((a) => (
              <AlertRow key={a.id} alert={a} onRead={markRead} onArchive={archive} onDelete={deleteAlert} archivedView={tab === "archived"} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Summary({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-surface px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full" style={{ background: accent }} />
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-fg">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
  muted = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  count: number;
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
      {icon}
      {label}
      {count > 0 && (
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
