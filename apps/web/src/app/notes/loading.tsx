/** Route-level loading skeleton for Research Notes. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

export default function NotesLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading notes">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-44" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card>
          <div className="border-b border-hairline px-5 py-4">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
        <Card>
          <div className="border-b border-hairline px-5 py-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3 px-5 py-5">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-1/2" />
            <Skeleton className="h-48 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
