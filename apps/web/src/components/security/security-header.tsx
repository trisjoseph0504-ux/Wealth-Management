/** Security header — identity (ticker, name, sector, exchange) + live price. */
import type { SecurityDetail } from "@/data/security-detail-mock";
import { Card } from "@/components/ui/card";
import { Money, Delta, ChangePill } from "@/components/ui/financial";
import { Badge, Button } from "@/components/ui/primitives";
import { WatchlistButton } from "@/components/security/watchlist-button";
import { IconPlus } from "@/components/ui/icons";

export function SecurityHeader({ d }: { d: SecurityDetail }) {
  const range = d.week52High - d.week52Low || 1;
  const pos = ((d.price - d.week52Low) / range) * 100;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[8px] border border-hairline bg-inset text-sm font-semibold tracking-tight text-emerald-bright">
              {d.symbol.slice(0, 2)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-fg">{d.symbol}</h1>
                <Badge tone="neutral">{d.exchange}</Badge>
                {d.assetType !== "Stock" && <Badge tone="emerald">{d.assetType}</Badge>}
                <Badge tone="info">{d.assetType === "Stock" ? d.sector : (d.category ?? d.assetType)}</Badge>
              </div>
              <p className="mt-0.5 truncate text-[13px] text-fg-muted">{d.name}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <Money value={d.price} className="text-3xl font-semibold tracking-tight text-fg" />
            <div className="mb-1 flex items-center gap-2">
              <ChangePill value={d.changePct} />
              <Delta value={d.changeUsd} className="text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WatchlistButton symbol={d.symbol} />
            <Button variant="outline">
              <IconPlus size={14} /> Trade
            </Button>
          </div>
        </div>
      </div>

      {/* 52-week range track */}
      <div className="border-t border-hairline px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3 text-[11px] text-fg-subtle">
          <span className="tnum shrink-0">{d.week52Low.toFixed(2)}</span>
          <div className="relative h-1.5 flex-1 rounded-full bg-inset">
            <div className="absolute inset-y-0 left-0 rounded-full bg-line-strong" style={{ width: `${pos}%` }} />
            <div
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald ring-2 ring-base"
              style={{ left: `${pos}%` }}
            />
          </div>
          <span className="tnum shrink-0">{d.week52High.toFixed(2)}</span>
          <span className="ml-1 hidden shrink-0 sm:inline">52-week range</span>
        </div>
      </div>
    </Card>
  );
}
