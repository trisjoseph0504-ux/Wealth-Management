/** Bull vs bear case — balanced two-column argument over mock thesis points. */
import type { ReactNode } from "react";
import type { SecurityDetail } from "@/data/security-detail-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { IconArrowUp, IconArrowDown } from "@/components/ui/icons";

export function BullBear({ d }: { d: SecurityDetail }) {
  return (
    <Card>
      <CardHeader title="Bull vs. Bear Case" subtitle="Balanced view · illustrative" icon={<IconArrowUp size={16} />} />
      <div className="grid grid-cols-1 gap-px bg-hairline md:grid-cols-2">
        <Side title="Bull case" tone="pos" items={d.bull} icon={<IconArrowUp size={13} />} />
        <Side title="Bear case" tone="neg" items={d.bear} icon={<IconArrowDown size={13} />} />
      </div>
    </Card>
  );
}

function Side({
  title,
  tone,
  items,
  icon,
}: {
  title: string;
  tone: "pos" | "neg";
  items: string[];
  icon: ReactNode;
}) {
  const color = tone === "pos" ? "text-pos" : "text-neg";
  return (
    <div className="bg-surface px-5 py-5">
      <p className={`mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${color}`}>
        {icon} {title}
      </p>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-fg-muted">
            <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${tone === "pos" ? "bg-pos" : "bg-neg"}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
