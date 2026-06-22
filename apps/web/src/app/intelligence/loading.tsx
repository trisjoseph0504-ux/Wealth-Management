/** Route-level loading skeleton for the Advisor Intelligence Center. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

export default function IntelligenceLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading intelligence">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-72" />
      </div>

      {/* Briefing */}
      <Card>
        <div className="border-b border-hairline px-6 py-4">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-2 px-6 py-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-hairline bg-hairline sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 bg-surface px-4 py-3.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </Card>

      {/* Insight cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between px-5 py-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-2 px-5 pb-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-hairline px-5 py-4">
            {Array.from({ length: 3 }).map((__, j) => (
              <Skeleton key={j} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
