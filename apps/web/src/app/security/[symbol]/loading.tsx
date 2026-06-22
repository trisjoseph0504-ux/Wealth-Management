/** Route-level loading skeleton for the security detail page. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

export default function SecurityLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading security">
      <Skeleton className="h-3 w-32" />

      <Card>
        <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-[8px]" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="border-t border-hairline px-6 py-4">
          <Skeleton className="h-2 w-full" />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <div className="border-b border-hairline px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="px-5 py-5">
            <Skeleton className="h-[260px] w-full" />
          </div>
        </Card>
        <div className="grid gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <div className="border-b border-hairline px-5 py-4">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-3 px-5 py-5">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2 bg-surface px-4 py-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
