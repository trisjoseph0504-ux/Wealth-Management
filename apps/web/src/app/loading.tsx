/**
 * Root route-level loading screen — the fallback shown while a server-rendered
 * page (e.g. the dashboard or settings) is being prepared. Branded, centered, and
 * sized to fill the content area so a slow load never looks frozen. Routes with
 * their own loading.tsx (security, intelligence, …) use those instead.
 */
import { LwLogo } from "@/components/shell/logo";

export default function Loading() {
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center gap-5"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-hairline border-t-emerald" />
        <LwLogo size={28} />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[13px] font-medium tracking-tight text-fg">Lewis Wealth Intelligence</span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-fg-subtle">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald" />
          Loading…
        </span>
      </div>
    </div>
  );
}
