/** Account breakdown — one card per account with value, day move, and weight. */
import { accounts } from "@/data/portfolio-mock";
import { Card, CardHeader, CardLink } from "@/components/ui/card";
import { Money, ChangePill } from "@/components/ui/financial";
import { IconBuilding } from "@/components/ui/icons";

export function AccountCards() {
  return (
    <Card>
      <CardHeader
        title="Accounts"
        subtitle={`${accounts.length} linked accounts`}
        icon={<IconBuilding size={16} />}
        action={<CardLink label="Manage" />}
      />
      <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => (
          <div key={a.id} className="bg-surface px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-tight text-fg">{a.name}</p>
                <p className="text-[11px] text-fg-subtle">
                  {a.type} · {a.custodian}
                </p>
              </div>
              <ChangePill value={a.dayChangePct} />
            </div>
            <div className="mt-3">
              <Money value={a.value} className="text-lg font-semibold tracking-tight text-fg" />
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-inset">
                <div className="h-full rounded-full bg-emerald" style={{ width: `${a.weightPct}%` }} />
              </div>
              <span className="tnum text-[11px] text-fg-subtle">{a.weightPct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
