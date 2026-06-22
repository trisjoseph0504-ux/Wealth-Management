/**
 * Route-level loading skeleton for the Portfolio page. Shown while the route
 * streams (App Router `loading.tsx`). Mirrors the real layout's rhythm so there
 * is no jarring shift when content arrives.
 */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

function Line({ className }: { className?: string }) {
  return <Skeleton className={`h-3 ${className ?? "w-24"}`} />;
}

export default function PortfolioLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading portfolio">
      <div className="space-y-2">
        <Line className="w-16" />
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 px-6 py-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-72" />
          <Line className="w-40" />
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-hairline bg-hairline sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 bg-surface px-5 py-4">
              <Line className="w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </Card>

      {/* Performance */}
      <Card>
        <div className="border-b border-hairline px-5 py-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="px-5 py-5">
          <Skeleton className="h-[240px] w-full" />
        </div>
      </Card>

      {/* Holdings */}
      <Card>
        <div className="border-b border-hairline px-5 py-4">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-3 px-5 py-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>

      {/* Allocation pair */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <div className="border-b border-hairline px-5 py-4">
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-3 px-5 py-5">
              {Array.from({ length: 5 }).map((__, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
