/** Route-level loading skeleton for the Alerts page. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

export default function AlertsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading alerts">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-56" />
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 bg-surface px-4 py-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-8" />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="border-b border-hairline px-5 py-4">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="border-b border-hairline px-5 py-3">
          <Skeleton className="h-7 w-48" />
        </div>
        <ul>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex gap-3.5 border-b border-hairline px-5 py-4 last:border-0">
              <Skeleton className="size-8 shrink-0 rounded-[8px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
