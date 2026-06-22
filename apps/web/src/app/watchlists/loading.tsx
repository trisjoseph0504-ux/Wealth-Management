/** Route-level loading skeleton for the Watchlists page. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

export default function WatchlistsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading watchlists">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-44" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
        <Card>
          <div className="border-b border-hairline px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </Card>

        <Card>
          <div className="border-b border-hairline px-5 py-4">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="border-b border-hairline px-5 py-3">
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
