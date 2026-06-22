/** Route-level loading skeleton for the Markets page. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

export default function MarketsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading markets">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-48" />
      </div>

      <Card>
        <div className="border-b border-hairline px-5 py-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 bg-surface px-5 py-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
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
                <Skeleton key={j} className="h-5 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-hairline px-5 py-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    </div>
  );
}
