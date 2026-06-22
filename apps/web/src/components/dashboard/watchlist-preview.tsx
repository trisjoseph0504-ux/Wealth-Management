/** Watchlist preview — compact instrument rows with price, change, sparkline. */
import { watchlist } from "@/data/mock";
import { Card, CardHeader, CardLink } from "@/components/ui/card";
import { Money, ChangePill } from "@/components/ui/financial";
import { Sparkline } from "@/components/ui/sparkline";
import { TickerLink } from "@/components/ui/ticker-link";
import { directionOf } from "@/lib/format";
import { IconEye } from "@/components/ui/icons";

export function WatchlistPreview() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Watchlist"
        subtitle="Primary list · 6 instruments"
        icon={<IconEye size={16} />}
        action={<CardLink label="View all" />}
      />
      <ul className="divide-y divide-hairline">
        {watchlist.map((w) => (
          <li
            key={w.symbol}
            className="reduce-motion-safe flex items-center gap-3 px-5 py-2.5 transition hover:bg-surface-2/50"
          >
            <div className="min-w-0 flex-1">
              <TickerLink symbol={w.symbol} className="block w-fit text-[13px] font-semibold tracking-tight text-fg" />
              <p className="truncate text-[11px] text-fg-subtle">{w.name}</p>
            </div>
            <Sparkline data={w.trend} width={64} height={22} tone={directionOf(w.changePct) === "down" ? "neg" : "pos"} fill={false} />
            <div className="w-24 text-right">
              <Money value={w.price} className="block text-[13px] font-medium text-fg" />
              <ChangePill value={w.changePct} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
