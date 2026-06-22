"use client";

/** A single alert / notification row — severity accent, content, and actions. */
import Link from "next/link";
import { type Alert, CATEGORY_LABEL } from "@/data/alerts-mock";
import { cn } from "@/lib/cn";
import { TickerLink } from "@/components/ui/ticker-link";
import { SEVERITY_META, categoryIcon } from "@/components/alerts/alert-meta";
import { IconCheck, IconArchive, IconTrash, IconChevronRight } from "@/components/ui/icons";

export function AlertRow({
  alert,
  onRead,
  onArchive,
  onDelete,
  archivedView = false,
}: {
  alert: Alert;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  archivedView?: boolean;
}) {
  const sev = SEVERITY_META[alert.severity];
  const unread = !alert.read && !archivedView;

  return (
    <li
      className={cn(
        "reduce-motion-safe relative flex gap-3.5 border-b border-hairline px-4 py-4 transition last:border-0 sm:px-5",
        unread ? "bg-surface-2/30" : "hover:bg-surface-2/20",
      )}
      style={{ boxShadow: `inset 2px 0 0 ${sev.color}` }}
    >
      {/* Severity icon */}
      <span
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[8px] border"
        style={{ color: sev.color, borderColor: "var(--color-hairline)", background: "var(--color-inset)" }}
      >
        <sev.Icon size={16} />
      </span>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-fg-subtle">
          <span className="inline-flex items-center gap-1 font-medium text-fg-muted">
            {categoryIcon(alert.category, 12)} {CATEGORY_LABEL[alert.category]}
          </span>
          <span>·</span>
          <span style={{ color: sev.color }}>{sev.label}</span>
          <span>·</span>
          <span>{alert.time}</span>
          {unread && <span className={cn("ml-1 size-1.5 rounded-full", sev.dot)} />}
        </div>

        <p className={cn("mt-1 text-[14px] tracking-tight text-fg", unread ? "font-semibold" : "font-medium")}>
          {alert.title}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">{alert.description}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {alert.symbol && (
            <TickerLink
              symbol={alert.symbol}
              className="rounded-full border border-hairline bg-inset px-2 py-0.5 text-[11px] font-medium text-fg-muted"
            />
          )}
          {alert.sector && (
            <span className="rounded-full border border-hairline bg-inset px-2 py-0.5 text-[11px] text-fg-muted">
              {alert.sector}
            </span>
          )}
          {alert.actionLabel && alert.actionHref && (
            <Link
              href={alert.actionHref}
              className="reduce-motion-safe inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[11px] font-medium text-emerald transition hover:bg-emerald/10"
            >
              {alert.actionLabel}
              <IconChevronRight size={12} />
            </Link>
          )}
        </div>
      </div>

      {/* Row actions */}
      <div className="flex shrink-0 items-start gap-1">
        {!archivedView && !alert.read && (
          <button
            type="button"
            onClick={() => onRead(alert.id)}
            aria-label="Mark as read"
            title="Mark as read"
            className="reduce-motion-safe flex size-7 items-center justify-center rounded-[4px] text-fg-subtle transition hover:bg-surface-2 hover:text-emerald"
          >
            <IconCheck size={15} />
          </button>
        )}
        {!archivedView && (
          <button
            type="button"
            onClick={() => onArchive(alert.id)}
            aria-label="Archive"
            title="Archive"
            className="reduce-motion-safe flex size-7 items-center justify-center rounded-[4px] text-fg-subtle transition hover:bg-surface-2 hover:text-fg"
          >
            <IconArchive size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(alert.id)}
          aria-label="Delete permanently"
          title="Delete permanently"
          className="reduce-motion-safe flex size-7 items-center justify-center rounded-[4px] text-fg-subtle transition hover:bg-surface-2 hover:text-neg"
        >
          <IconTrash size={15} />
        </button>
      </div>
    </li>
  );
}
