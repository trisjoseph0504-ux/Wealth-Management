/** Performance metrics — trailing returns across standard windows. */
import type { SecurityDetail } from "@/data/security-detail-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Percent } from "@/components/ui/financial";
import { IconTrendingUp } from "@/components/ui/icons";

export function PerformanceMetrics({ d }: { d: SecurityDetail }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Performance" subtitle="Trailing total return" icon={<IconTrendingUp size={16} />} />
      <div className="grid flex-1 grid-cols-3 gap-px bg-hairline sm:grid-cols-6 lg:grid-cols-3">
        {d.returns.map((r) => (
          <div key={r.label} className="flex flex-col items-center justify-center gap-1 bg-surface px-3 py-4 text-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">{r.label}</span>
            <Percent value={r.pct} className="text-[15px] font-semibold" />
          </div>
        ))}
      </div>
    </Card>
  );
}
