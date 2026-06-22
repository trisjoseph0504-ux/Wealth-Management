/** Route-level loading skeleton for the Risk Analytics page. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

export default function RiskLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading risk analytics">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-44" />
      </div>

      <Card>
        <div className="grid gap-px bg-hairline lg:grid-cols-[1fr_1.2fr]">
          <div className="flex items-center justify-center bg-surface px-6 py-8">
            <Skeleton className="h-28 w-48 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 bg-surface px-4 py-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b border-hairline px-5 py-4">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="px-5 py-5">
          <Skeleton className="h-[200px] w-full" />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <div className="border-b border-hairline px-5 py-4">
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-3 px-5 py-5">
              {Array.from({ length: 6 }).map((__, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
