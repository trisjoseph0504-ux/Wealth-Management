/** Route-level loading skeleton for the Screener page. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

export default function ScreenerLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading screener">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-40" />
      </div>

      <Card>
        <div className="flex gap-2 px-5 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-36 shrink-0" />
          ))}
        </div>
      </Card>

      <Skeleton className="h-10 w-full max-w-md" />

      <Card>
        <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2 bg-surface px-4 py-3.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="hidden lg:block">
          <div className="border-b border-hairline px-5 py-4">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-4 px-5 py-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="border-b border-hairline px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
