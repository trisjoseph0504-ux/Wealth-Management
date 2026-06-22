"use client";

/**
 * Ticker → security detail link. The single way to navigate to /security/[symbol]
 * from any table, list, or tile, so the interaction is consistent everywhere.
 * Right-click opens a context menu: Open, Add to watchlist, Copy symbol.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { getSecurity } from "@/data/markets-mock";
import { useContextMenu, type CtxItem } from "@/components/ui/context-menu";
import { quickAddToWatchlistAction } from "@/server/actions/watchlists";
import { toast } from "@/components/ui/toast";
import { IconChevronRight, IconStar, IconCopy } from "@/components/ui/icons";

export function tickerMenuItems(symbol: string, router: ReturnType<typeof useRouter>): CtxItem[] {
  return [
    { label: `Open ${symbol}`, icon: <IconChevronRight size={14} />, onSelect: () => router.push(`/security/${encodeURIComponent(symbol)}`) },
    {
      label: "Add to watchlist",
      icon: <IconStar size={14} />,
      onSelect: async () => {
        try {
          const r = await quickAddToWatchlistAction(symbol);
          toast(`Added ${symbol} to ${r.list}`);
        } catch {
          toast(`Couldn't add ${symbol}`);
        }
      },
    },
    {
      label: "Copy symbol",
      icon: <IconCopy size={14} />,
      onSelect: async () => {
        try {
          await navigator.clipboard.writeText(symbol);
          toast(`Copied ${symbol}`);
        } catch {
          /* clipboard blocked */
        }
      },
    },
  ];
}

export function TickerLink({
  symbol,
  className,
  children,
}: {
  symbol: string;
  className?: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const { openMenu } = useContextMenu();

  // Only securities with a detail profile are linkable; others (e.g. portfolio-
  // only ETFs not in the tracked equity universe) render as plain text.
  if (!getSecurity(symbol)) {
    return <span className={className}>{children ?? symbol}</span>;
  }

  return (
    <Link
      href={`/security/${encodeURIComponent(symbol)}`}
      onContextMenu={(e) => openMenu(e, tickerMenuItems(symbol, router))}
      className={cn(
        "reduce-motion-safe rounded-[3px] underline-offset-2 transition hover:text-emerald hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/40",
        className,
      )}
    >
      {children ?? symbol}
    </Link>
  );
}
