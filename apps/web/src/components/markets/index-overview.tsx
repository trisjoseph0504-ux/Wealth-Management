/** Major index overview — card grid with level, day change, YTD, and trend. */
import { indices } from "@/data/markets-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { ChangePill, Percent } from "@/components/ui/financial";
import { Sparkline } from "@/components/ui/sparkline";
import { formatNumber, directionOf } from "@/lib/format";
import { IconGlobe } from "@/components/ui/icons";

export function IndexOverview() {
  return (
    <Card>
      <CardHeader
        title="Major Indices"
        subtitle="Global benchmarks · delayed"
        icon={<IconGlobe size={16} />}
      />
      <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {indices.map((idx) => (
          <div key={idx.symbol} className="bg-surface px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-tight text-fg">{idx.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-fg-subtle">{idx.symbol}</p>
              </div>
              <Sparkline
                data={idx.trend}
                width={64}
                height={26}
                tone={directionOf(idx.changePct) === "down" ? "neg" : "pos"}
              />
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <span className="tnum text-xl font-semibold tracking-tight text-fg">
                {formatNumber(idx.level)}
              </span>
              <ChangePill value={idx.changePct} />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-fg-subtle">
              YTD <Percent value={idx.ytdPct} className="text-[11px]" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
