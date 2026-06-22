/** Sector performance — ranked diverging bars (market-cap weighted day change). */
import { sectorPerformance } from "@/data/markets-mock";
import { Card, CardHeader } from "@/components/ui/card";
import { Money, Percent } from "@/components/ui/financial";
import { IconLayers } from "@/components/ui/icons";

export function SectorPerformance() {
  const maxAbs = Math.max(...sectorPerformance.map((s) => Math.abs(s.changePct)), 0.5);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Sector Performance"
        subtitle="Market-cap weighted · today"
        icon={<IconLayers size={16} />}
      />
      <ul className="flex-1 space-y-2.5 px-5 py-5">
        {sectorPerformance.map((s) => {
          const pos = s.changePct >= 0;
          const width = (Math.abs(s.changePct) / maxAbs) * 50; // % of half-track
          return (
            <li key={s.sector} className="grid grid-cols-[140px_1fr_auto] items-center gap-3">
              <span className="truncate text-[12px] text-fg" title={s.sector}>
                {s.sector}
              </span>
              {/* Diverging track with center baseline */}
              <div className="relative h-2 rounded-full bg-inset">
                <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
                <div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    width: `${width}%`,
                    left: pos ? "50%" : undefined,
                    right: pos ? undefined : "50%",
                    background: pos ? "var(--color-pos)" : "var(--color-neg)",
                  }}
                />
              </div>
              <span className="flex w-28 items-center justify-end gap-2 text-[12px]">
                <Money value={s.marketCapB * 1e9} compact className="text-fg-subtle" />
                <Percent value={s.changePct} className="w-14 justify-end text-right text-[12px]" />
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
