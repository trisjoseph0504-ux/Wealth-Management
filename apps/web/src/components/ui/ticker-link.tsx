/**
 * Ticker → security detail link. The single way to navigate to /security/[symbol]
 * from any table, list, or tile, so the interaction is consistent everywhere.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getSecurity } from "@/data/markets-mock";

export function TickerLink({
  symbol,
  className,
  children,
}: {
  symbol: string;
  className?: string;
  children?: ReactNode;
}) {
  // Only securities with a detail profile are linkable; others (e.g. portfolio-
  // only ETFs not in the tracked equity universe) render as plain text.
  if (!getSecurity(symbol)) {
    return <span className={className}>{children ?? symbol}</span>;
  }

  return (
    <Link
      href={`/security/${encodeURIComponent(symbol)}`}
      className={cn(
        "reduce-motion-safe rounded-[3px] underline-offset-2 transition hover:text-emerald hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/40",
        className,
      )}
    >
      {children ?? symbol}
    </Link>
  );
}
