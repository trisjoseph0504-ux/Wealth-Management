/** Market overview — index grid with level, change, and mini trend. */
import { indices } from "@/data/mock";
import { Card, CardHeader, CardLink } from "@/components/ui/card";
import { ChangePill } from "@/components/ui/financial";
import { Sparkline } from "@/components/ui/sparkline";
import { formatNumber, directionOf } from "@/lib/format";
import { IconGlobe } from "@/components/ui/icons";

export function MarketOverview() {
  return (
    <Card>
      <CardHeader
        title="Market Overview"
        subtitle="Global indices · delayed"
        icon={<IconGlobe size={16} />}
        action={<CardLink label="All markets" />}
      />
      <div className="grid grid-cols-2 gap-px bg-hairline md:grid-cols-3">
        {indices.map((idx) => (
          <div key={idx.symbol} className="bg-surface px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold tracking-tight text-fg">{idx.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-fg-subtle">{idx.symbol}</p>
              </div>
              <Sparkline
                data={idx.trend}
                width={52}
                height={20}
                tone={directionOf(idx.changePct) === "down" ? "neg" : "pos"}
                fill={false}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="tnum text-sm font-medium text-fg">{formatNumber(idx.level)}</span>
              <ChangePill value={idx.changePct} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
