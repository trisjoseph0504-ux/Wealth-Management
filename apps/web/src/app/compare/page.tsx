/**
 * Compare page. Side-by-side comparison of any securities (stocks, ETFs, funds).
 * Seeds with two defaults so there's an immediate comparison; live price/change.
 */
import { compareSecurityAction } from "@/server/actions/compare";
import { CompareClient } from "@/components/compare/compare-client";
import { SectionLabel } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const initial = (await Promise.all([compareSecurityAction("AAPL"), compareSecurityAction("MSFT")])).filter(
    (c): c is NonNullable<typeof c> => c !== null,
  );

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Workspace</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Compare</h1>
        <p className="text-[13px] text-fg-subtle">
          Put stocks, ETFs, or funds side by side — best value in each row is highlighted.
        </p>
      </div>

      <CompareClient initialCards={initial} />
    </div>
  );
}
