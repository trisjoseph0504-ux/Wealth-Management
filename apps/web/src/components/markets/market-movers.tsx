"use client";

/** Market movers — tabbed gainers / losers / most active over the universe. */
import { useState } from "react";
import { type Security } from "@/data/markets-mock";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";
import { Sparkline } from "@/components/ui/sparkline";
import { TickerLink } from "@/components/ui/ticker-link";
import { IconActivity } from "@/components/ui/icons";

const TABS = [
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
  { key: "mostActive", label: "Most Active" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface Movers {
  gainers: Security[];
  losers: Security[];
  mostActive: Security[];
}

export function MarketMovers({ movers }: { movers: Movers }) {
  const [tab, setTab] = useState<TabKey>("gainers");
  const rows = movers[tab];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Market Movers"
        subtitle="S&P universe · today"
        icon={<IconActivity size={16} />}
        action={
          <div className="flex items-center gap-1 rounded-[6px] border border-hairline bg-inset p-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "reduce-motion-safe rounded-[4px] px-2.5 py-1 text-[11px] font-medium transition",
                  tab === t.key ? "bg-surface-2 text-fg" : "text-fg-subtle hover:text-fg",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />
      <ul className="flex-1 divide-y divide-hairline/60">
        {rows.map((s) => (
          <MoverRow key={s.symbol} s={s} showVolume={tab === "mostActive"} />
        ))}
      </ul>
    </Card>
  );
}

function MoverRow({ s, showVolume }: { s: Security; showVolume: boolean }) {
  return (
    <li className="flex items-center gap-3 px-5 py-2.5">
      <div className="min-w-0 flex-1">
        <TickerLink symbol={s.symbol} className="block w-fit text-[13px] font-semibold tracking-tight text-fg" />
        <p className="truncate text-[11px] text-fg-subtle">
          {showVolume ? `${formatNumber(s.volumeM, 0)}M shares` : s.name}
        </p>
      </div>
      <Sparkline data={s.trend} width={56} height={20} tone={s.changePct < 0 ? "neg" : "pos"} fill={false} />
      <div className="w-20 text-right">
        <Money value={s.price} className="block text-[13px] text-fg" />
        <Percent value={s.changePct} className="text-[12px]" />
      </div>
    </li>
  );
}
