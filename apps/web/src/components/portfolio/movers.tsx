/** Top winners / losers — best and worst day movers across holdings. */
import type { Holding } from "@/data/portfolio-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";
import { Sparkline } from "@/components/ui/sparkline";
import { TickerLink } from "@/components/ui/ticker-link";
import { IconTrendingUp } from "@/components/ui/icons";

function MoverRow({ h, tone }: { h: Holding; tone: "pos" | "neg" }) {
  return (
    <li className="flex items-center gap-3 px-5 py-2.5">
      <div className="min-w-0 flex-1">
        <TickerLink symbol={h.symbol} className="block w-fit text-[13px] font-semibold tracking-tight text-fg" />
        <p className="truncate text-[11px] text-fg-subtle">{h.name}</p>
      </div>
      <Sparkline data={h.trend} width={56} height={20} tone={tone} fill={false} />
      <div className="w-20 text-right">
        <Money value={h.price} className="block text-[13px] text-fg" />
        <Percent value={h.dayChangePct} className="text-[12px]" />
      </div>
    </li>
  );
}

export function Movers({ winners, losers }: { winners: Holding[]; losers: Holding[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Top Movers" subtitle="Today’s best & worst" icon={<IconTrendingUp size={16} />} />
      <div className="grid flex-1 grid-cols-1 gap-px bg-hairline sm:grid-cols-2">
        <div className="bg-surface">
          <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-pos">
            Winners
          </p>
          <ul className="divide-y divide-hairline/60">
            {winners.map((h) => (
              <MoverRow key={h.id} h={h} tone="pos" />
            ))}
          </ul>
        </div>
        <div className="bg-surface">
          <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neg">
            Losers
          </p>
          <ul className="divide-y divide-hairline/60">
            {losers.map((h) => (
              <MoverRow key={h.id} h={h} tone="neg" />
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
