"use client";

/**
 * Insight memo card — headline, evidence-based thesis, evidence tiles (clickable
 * to the holdings/sectors/metrics that triggered it), suggested next actions, a
 * client-ready explanation toggle, and Monitor / Create-alert / Dismiss actions.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  type Insight,
  type Evidence,
  type Priority,
  type InsightCategory,
  CATEGORY_LABEL,
  PRIORITY_LABEL,
} from "@/data/intelligence-mock";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import {
  IconShield,
  IconTrendingUp,
  IconEye,
  IconActivity,
  IconGlobe,
  IconBell,
  IconCheck,
  IconClose,
  IconStar,
  IconStarFilled,
  IconChevronRight,
  IconChevronDown,
} from "@/components/ui/icons";

const CATEGORY_ICON: Record<InsightCategory, (p: { size?: number }) => ReactNode> = {
  risk: IconShield,
  opportunity: IconTrendingUp,
  watchlist: IconEye,
  rebalance: IconActivity,
  market: IconGlobe,
};
const PRIORITY_TONE: Record<Priority, "warn" | "info" | "neutral"> = {
  high: "warn",
  medium: "info",
  low: "neutral",
};
const PRIORITY_COLOR: Record<Priority, string> = {
  high: "var(--color-warn)",
  medium: "var(--color-info)",
  low: "var(--color-line-strong)",
};
const TONE_CLASS: Record<string, string> = {
  pos: "text-pos",
  neg: "text-neg",
  warn: "text-warn",
  neutral: "text-fg",
};

export function InsightCard({
  insight,
  monitored,
  alertCreated,
  onMonitor,
  onCreateAlert,
  onDismiss,
}: {
  insight: Insight;
  monitored: boolean;
  alertCreated: boolean;
  onMonitor: (id: string) => void;
  onCreateAlert: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [showClient, setShowClient] = useState(false);
  const CatIcon = CATEGORY_ICON[insight.category];

  return (
    <Card
      className={cn("overflow-hidden", monitored && "ring-1 ring-inset ring-emerald/30")}
      as="article"
    >
      <div style={{ boxShadow: `inset 3px 0 0 ${PRIORITY_COLOR[insight.priority]}` }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-inset px-2 py-0.5 text-[11px] font-medium text-fg-muted">
              <CatIcon size={12} /> {CATEGORY_LABEL[insight.category]}
            </span>
            <Badge tone={PRIORITY_TONE[insight.priority]}>{PRIORITY_LABEL[insight.priority]}</Badge>
            {monitored && <Badge tone="emerald">Monitoring</Badge>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconBtn
              label={monitored ? "Stop monitoring" : "Monitor"}
              active={monitored}
              onClick={() => onMonitor(insight.id)}
            >
              {monitored ? <IconStarFilled size={15} /> : <IconStar size={15} />}
            </IconBtn>
            <IconBtn label="Create alert" onClick={() => onCreateAlert(insight.id)}>
              <IconBell size={15} />
            </IconBtn>
            <IconBtn label="Dismiss" onClick={() => onDismiss(insight.id)}>
              <IconClose size={15} />
            </IconBtn>
          </div>
        </div>

        {/* Thesis */}
        <div className="px-5 pb-4">
          <h3 className="text-[15px] font-semibold tracking-tight text-fg">{insight.title}</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-muted">{insight.thesis}</p>
        </div>

        {/* Evidence */}
        <div className="border-t border-hairline px-5 py-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
            Evidence
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {insight.evidence.map((e, i) => (
              <EvidenceTile key={i} e={e} />
            ))}
          </div>
        </div>

        {/* Suggested actions */}
        <div className="border-t border-hairline px-5 py-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
            Suggested next actions
          </p>
          <ul className="space-y-1.5">
            {insight.actions.map((a, i) => {
              if (a.kind === "link" && a.href) {
                return (
                  <li key={i}>
                    <Link
                      href={a.href}
                      className="reduce-motion-safe inline-flex items-center gap-1.5 text-[13px] text-emerald transition hover:underline"
                    >
                      <IconChevronRight size={13} /> {a.label}
                    </Link>
                  </li>
                );
              }
              if (a.kind === "alert") {
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onCreateAlert(insight.id)}
                      disabled={alertCreated}
                      className={cn(
                        "reduce-motion-safe inline-flex items-center gap-1.5 text-[13px] transition",
                        alertCreated ? "text-pos" : "text-fg-muted hover:text-fg",
                      )}
                    >
                      {alertCreated ? <IconCheck size={13} /> : <IconBell size={13} />}
                      {alertCreated ? "Alert created" : a.label}
                    </button>
                  </li>
                );
              }
              return (
                <li key={i} className="flex items-center gap-2 text-[13px] text-fg-muted">
                  <span className="size-1.5 rounded-full bg-line-strong" /> {a.label}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Client-ready explanation */}
        <div className="border-t border-hairline">
          <button
            type="button"
            onClick={() => setShowClient((v) => !v)}
            className="reduce-motion-safe flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-surface-2/30"
          >
            <span className="text-[12px] font-medium text-fg-muted">Client-ready summary</span>
            <IconChevronDown
              size={15}
              className={cn("text-fg-subtle transition", showClient && "rotate-180")}
            />
          </button>
          {showClient && (
            <div className="px-5 pb-4">
              <div className="rounded-[8px] border border-hairline bg-inset/50 px-4 py-3.5">
                <p
                  className="text-[14px] leading-relaxed text-fg"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {insight.clientExplanation}
                </p>
                <p className="mt-2.5 text-[10px] leading-relaxed text-fg-subtle">
                  Educational/informational only — not personalized investment advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function EvidenceTile({ e }: { e: Evidence }) {
  const inner = (
    <>
      <p className="truncate text-[10px] uppercase tracking-[0.1em] text-fg-subtle">{e.label}</p>
      <p className={cn("mt-0.5 text-[14px] font-semibold tracking-tight", TONE_CLASS[e.tone ?? "neutral"])}>
        {e.value}
      </p>
    </>
  );
  const base = "block rounded-[6px] border border-hairline bg-inset/50 px-3 py-2.5";
  if (e.href) {
    return (
      <Link
        href={e.href}
        className={cn(base, "reduce-motion-safe transition hover:border-emerald/40 hover:bg-surface-2/40")}
      >
        {inner}
      </Link>
    );
  }
  return <div className={base}>{inner}</div>;
}

function IconBtn({
  children,
  label,
  active,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "reduce-motion-safe flex size-7 items-center justify-center rounded-[4px] transition",
        active ? "text-emerald" : "text-fg-subtle hover:bg-surface-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
