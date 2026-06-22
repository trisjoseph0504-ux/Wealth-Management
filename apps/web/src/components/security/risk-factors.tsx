/** Risk factors — key risks for the position, with a beta-based risk read. */
import type { SecurityDetail } from "@/data/security-detail-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { IconShield } from "@/components/ui/icons";

export function RiskFactors({ d }: { d: SecurityDetail }) {
  const tier = d.beta >= 1.2 ? "Elevated" : d.beta >= 0.9 ? "Moderate" : "Defensive";
  const tone = d.beta >= 1.2 ? "caution" : "info";

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Risk Factors"
        subtitle={`Beta ${d.beta.toFixed(2)} · single-name`}
        icon={<IconShield size={16} />}
        action={<Badge tone={tone}>{tier} volatility</Badge>}
      />
      <ul className="flex-1 space-y-3 px-5 py-5">
        {d.risks.map((r, i) => (
          <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-fg-muted">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-hairline bg-inset text-[10px] font-semibold text-fg-subtle">
              {i + 1}
            </span>
            {r}
          </li>
        ))}
      </ul>
    </Card>
  );
}
