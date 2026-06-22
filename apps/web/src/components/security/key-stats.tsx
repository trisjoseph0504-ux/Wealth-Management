/** Key statistics grid — valuation, income, risk, and liquidity at a glance. */
import type { ReactNode } from "react";
import type { SecurityDetail } from "@/data/security-detail-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money } from "@/components/ui/financial";
import { formatNumber } from "@/lib/format";
import { IconActivity } from "@/components/ui/icons";

export function KeyStats({ d }: { d: SecurityDetail }) {
  const stats: { label: string; value: ReactNode }[] = [
    { label: "Market Cap", value: <Money value={d.marketCapB * 1e9} compact /> },
    { label: "P/E (TTM)", value: <span className="tnum">{d.peRatio.toFixed(1)}×</span> },
    { label: "Forward P/E", value: <span className="tnum">{d.forwardPe.toFixed(1)}×</span> },
    { label: "EPS (TTM)", value: <Money value={d.eps} /> },
    { label: "Dividend Yield", value: <span className="tnum">{d.dividendYieldPct.toFixed(2)}%</span> },
    { label: "Beta (5Y)", value: <span className="tnum">{d.beta.toFixed(2)}</span> },
    { label: "Volume", value: <span className="tnum">{formatNumber(d.volumeM, 0)}M</span> },
    { label: "Avg Volume", value: <span className="tnum">{formatNumber(d.avgVolumeM, 0)}M</span> },
    { label: "52W High", value: <Money value={d.week52High} /> },
    { label: "52W Low", value: <Money value={d.week52Low} /> },
  ];

  return (
    <Card>
      <CardHeader title="Key Statistics" subtitle="Valuation · income · liquidity" icon={<IconActivity size={16} />} />
      <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">{s.label}</p>
            <div className="mt-1 text-[15px] font-semibold tracking-tight text-fg">{s.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
