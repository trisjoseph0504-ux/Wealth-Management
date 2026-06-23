/** Prominent callout shown when portfolio risk is running hot — explains why and
 *  what to consider rebalancing toward. Derived from the live risk model. */
import type { RebalanceAdvice } from "@/data/risk-mock";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/primitives";
import { IconAlertTriangle } from "@/components/ui/icons";

export function RebalanceAlert({ advice }: { advice: RebalanceAdvice }) {
  const high = advice.level === "high";
  return (
    <div
      className={cn(
        "rounded-[10px] border p-5",
        high ? "border-neg/30 bg-neg/[0.07]" : "border-warn/30 bg-warn/[0.07]",
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            high ? "bg-neg/12 text-neg" : "bg-warn/12 text-warn",
          )}
        >
          <IconAlertTriangle size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold tracking-tight text-fg">
              Risk is {advice.level} — consider rebalancing toward {advice.targetTier}
            </h3>
            <Badge tone={high ? "danger" : "warn"}>{high ? "High" : "Elevated"}</Badge>
          </div>

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">Why this is flagged</p>
          <ul className="mt-1.5 space-y-1.5">
            {advice.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-fg-muted">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-fg-subtle" />
                <span>{r}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">What to consider</p>
          <ul className="mt-1.5 space-y-1.5">
            {advice.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-fg-muted">
                <span className="shrink-0 text-emerald">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[10px] leading-relaxed text-fg-subtle">
            Illustrative, rules-based risk guidance — informational only, not personalized investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
