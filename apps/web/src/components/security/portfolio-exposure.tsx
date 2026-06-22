/** Portfolio exposure — this security's position in the Lewis Family Office,
 *  or a clean empty state + add-to-watchlist CTA when it isn't held. */
import type { ReactNode } from "react";
import type { SecurityDetail } from "@/data/security-detail-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent, Delta } from "@/components/ui/financial";
import { Button, EmptyState, SectionLabel } from "@/components/ui/primitives";
import { formatNumber } from "@/lib/format";
import { IconWallet, IconStar } from "@/components/ui/icons";

export function PortfolioExposure({ d }: { d: SecurityDetail }) {
  const e = d.exposure;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Portfolio Exposure" subtitle="Lewis Family Office" icon={<IconWallet size={16} />} />
      {e ? (
        <div className="flex flex-1 flex-col gap-4 px-5 py-5">
          <div>
            <SectionLabel>Market Value</SectionLabel>
            <div className="mt-1 flex items-end gap-2">
              <Money value={e.marketValue} className="text-2xl font-semibold tracking-tight text-fg" />
              <span className="mb-1 tnum text-[12px] text-fg-subtle">{e.weightPct.toFixed(1)}% of portfolio</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-hairline bg-hairline">
            <Field label="Shares" value={<span className="tnum">{formatNumber(e.quantity, 0)}</span>} />
            <Field label="Unrealized Gain" value={<Delta value={e.gainUsd} />} />
            <Field label="Return" value={<Percent value={e.gainPct} withGlyph />} />
            <Field label="Day P&L" value={<Delta value={(e.marketValue * d.changePct) / 100} />} />
          </div>
          <div className="mt-auto h-1.5 overflow-hidden rounded-full bg-inset">
            <div className="h-full rounded-full bg-emerald" style={{ width: `${Math.min(e.weightPct * 4, 100)}%` }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<IconWallet size={18} />}
            title="Not held in your portfolio"
            description={`${d.symbol} isn't currently a position across your linked accounts. Add it to a watchlist to track it.`}
            action={
              <Button variant="outline">
                <IconStar size={14} /> Add to watchlist
              </Button>
            }
          />
        </div>
      )}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-surface px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-fg-subtle">{label}</p>
      <div className="mt-0.5 text-[15px] font-semibold tracking-tight text-fg">{value}</div>
    </div>
  );
}
