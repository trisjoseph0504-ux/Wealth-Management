/**
 * Financial display primitives — the ONLY sanctioned way to render money,
 * percentages, and deltas (CLAUDE.md §4, DESIGN_SYSTEM.md §5). Tabular figures,
 * sign-aware coloring, explicit currency. Ad-hoc toFixed() in features is banned.
 */
import { cn } from "@/lib/cn";
import {
  directionOf,
  formatCurrency,
  formatDelta,
  formatPercent,
  type Direction,
} from "@/lib/format";
import { IconArrowDownRight, IconArrowUpRight } from "@/components/ui/icons";

const toneFor = (d: Direction) =>
  d === "up" ? "text-pos" : d === "down" ? "text-neg" : "text-flat";

export function Money({
  value,
  currency = "USD",
  compact = false,
  className,
}: {
  value: number;
  currency?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("tnum", className)}>
      {formatCurrency(value, currency, { compact })}
    </span>
  );
}

export function Percent({
  value,
  withGlyph = false,
  className,
}: {
  value: number;
  withGlyph?: boolean;
  className?: string;
}) {
  const dir = directionOf(value);
  return (
    <span className={cn("tnum inline-flex items-center gap-1", toneFor(dir), className)}>
      {withGlyph && <DirectionGlyph direction={dir} />}
      {formatPercent(value)}
    </span>
  );
}

export function Delta({
  value,
  currency = "USD",
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  const dir = directionOf(value);
  return (
    <span className={cn("tnum", toneFor(dir), className)}>
      {formatDelta(value, currency)}
    </span>
  );
}

export function DirectionGlyph({
  direction,
  size = 14,
}: {
  direction: Direction;
  size?: number;
}) {
  if (direction === "up") return <IconArrowUpRight size={size} className="text-pos" />;
  if (direction === "down") return <IconArrowDownRight size={size} className="text-neg" />;
  return null; // flat / zero: no glyph (avoids a stray dot next to 0.00%)
}

/** Compact pill showing a signed % move with directional tint. */
export function ChangePill({ value }: { value: number }) {
  const dir = directionOf(value);
  const tint =
    dir === "up"
      ? "bg-[var(--pos-soft)] text-pos"
      : dir === "down"
        ? "bg-[var(--neg-soft)] text-neg"
        : "bg-surface-2 text-flat";
  return (
    <span
      className={cn(
        "tnum inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-xs font-medium",
        tint,
      )}
    >
      <DirectionGlyph direction={dir} size={12} />
      {formatPercent(value)}
    </span>
  );
}
