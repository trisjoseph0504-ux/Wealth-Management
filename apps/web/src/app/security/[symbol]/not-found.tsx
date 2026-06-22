/** Branded not-found for unknown tickers. */
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState, Button } from "@/components/ui/primitives";
import { IconSearch } from "@/components/ui/icons";

export default function SecurityNotFound() {
  return (
    <div className="space-y-6">
      <Card>
        <EmptyState
          icon={<IconSearch size={18} />}
          title="Security not found"
          description="We don't have a profile for that ticker in the tracked universe. It may be delisted, mistyped, or not yet covered."
          action={
            <Link href="/markets">
              <Button variant="outline">Back to Markets</Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}
