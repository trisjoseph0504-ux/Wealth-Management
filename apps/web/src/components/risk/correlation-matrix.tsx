/** Correlation matrix — pairwise correlation between top holdings. Higher
 *  correlation (warm/red) = less diversification; low/negative (emerald) helps. */
import type { CorrelationMatrix as CorrelationMatrixData } from "@/data/risk-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { TickerLink } from "@/components/ui/ticker-link";
import { IconGrid } from "@/components/ui/icons";

function corrColor(v: number): string {
  if (v >= 0.99) return "var(--color-inset)"; // self
  if (v >= 0.7) return `rgba(242, 85, 90, ${(0.12 + ((v - 0.7) / 0.3) * 0.42).toFixed(3)})`;
  if (v >= 0.45) return `rgba(217, 140, 74, ${(0.12 + ((v - 0.45) / 0.25) * 0.32).toFixed(3)})`;
  if (v >= 0.2) return "rgba(155, 168, 166, 0.10)";
  return `rgba(16, 185, 129, ${(0.12 + Math.min(Math.abs(v - 0.2), 0.4) * 0.5).toFixed(3)})`;
}

export function CorrelationMatrix({ matrix }: { matrix: CorrelationMatrixData }) {
  const { symbols, rows } = matrix;

  return (
    <Card>
      <CardHeader
        title="Correlation Matrix"
        subtitle="Top holdings · trailing"
        icon={<IconGrid size={16} />}
        action={
          <div className="hidden items-center gap-2 text-[10px] text-fg-subtle sm:flex">
            <span>Diversifying</span>
            <span className="h-2 w-20 rounded-full" style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.5), rgba(155,168,166,0.18), rgba(217,140,74,0.4), rgba(242,85,90,0.5))" }} />
            <span>Correlated</span>
          </div>
        }
      />
      <div className="overflow-x-auto p-4">
        <table className="w-full border-separate border-spacing-1 text-center">
          <thead>
            <tr>
              <th className="w-12" />
              {symbols.map((s) => (
                <th key={s} className="px-1 pb-1">
                  <TickerLink symbol={s} className="text-[11px] font-semibold text-fg-muted" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={symbols[i]}>
                <th className="pr-2 text-right">
                  <TickerLink symbol={symbols[i]!} className="text-[11px] font-semibold text-fg-muted" />
                </th>
                {row.map((v, j) => (
                  <td
                    key={`${i}-${j}`}
                    title={`${symbols[i]} · ${symbols[j]}: ${v.toFixed(2)}`}
                    className="h-9 min-w-[40px] rounded-[4px] tnum text-[11px] text-fg"
                    style={{ background: corrColor(v) }}
                  >
                    {i === j ? <span className="text-fg-subtle">—</span> : v.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
