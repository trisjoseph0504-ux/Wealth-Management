/**
 * Financial formatting helpers.
 *
 * Phase 1 NOTE: these operate on `number` for mock-data display only. Per
 * CLAUDE.md §5, real money values must NOT be JS numbers — when live data
 * lands, formatting input becomes a decimal string / Decimal and the math layer
 * moves to `@lwi/utils/money`. These helpers are presentation-only and must
 * never be used to *compute* monetary results.
 */

const USD = "USD";

export function formatCurrency(
  value: number,
  currency: string = USD,
  opts: { compact?: boolean; maximumFractionDigits?: number } = {},
): string {
  const { compact = false, maximumFractionDigits = 2 } = opts;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : maximumFractionDigits,
    minimumFractionDigits: compact ? 0 : maximumFractionDigits,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

/** Signed percent, e.g. +1.24% / -0.80%. Input is a percentage value (1.24 = 1.24%). */
export function formatPercent(value: number, fractionDigits = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(fractionDigits)}%`;
}

/** Signed currency delta, e.g. +$1,204.10 / -$320.00 */
export function formatDelta(value: number, currency: string = USD): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value), currency)}`;
}

export type Direction = "up" | "down" | "flat";

export function directionOf(value: number): Direction {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}
