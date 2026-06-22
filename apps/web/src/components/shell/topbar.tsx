"use client";

/**
 * Top bar: mobile nav trigger + context (left), global search (center, grows),
 * status + actions (right). Search collapses below `sm`; the sidebar's role on
 * small screens is taken over by <MobileNav>. Title follows the active route.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LwLogo } from "@/components/shell/logo";
import { MobileNav } from "@/components/shell/mobile-nav";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { GlobalSearch } from "@/components/shell/global-search";
import { Badge } from "@/components/ui/primitives";
import { IconBell, IconPlus } from "@/components/ui/icons";
import { navGroups, isActiveHref } from "@/lib/nav";

function useRouteTitle(): string {
  const pathname = usePathname();
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActiveHref(item.href, pathname)) return item.label;
    }
  }
  // Detail routes without a nav entry derive their own title.
  if (pathname.startsWith("/security/")) {
    const symbol = pathname.split("/")[2];
    return symbol ? decodeURIComponent(symbol) : "Security";
  }
  return "Dashboard";
}

export function Topbar({ subtitle }: { subtitle?: string }) {
  const title = useRouteTitle();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-base/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNav />
        <LwLogo size={26} />
      </div>

      <div className="hidden min-w-0 flex-col leading-tight lg:flex">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-fg">{title}</h1>
        <p className="truncate text-[11px] text-fg-subtle">
          {subtitle ?? "Lewis Family Office · Private Wealth"}
        </p>
      </div>

      <GlobalSearch className="hidden min-w-0 flex-1 sm:block sm:max-w-xl sm:flex-1 lg:mx-4" />

      <div className="ml-auto flex items-center gap-2">
        <Badge tone="emerald" className="hidden sm:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald" />
          Markets Open
        </Badge>
        <ThemeToggle />
        <Link
          href="/alerts"
          aria-label="Notifications"
          className="reduce-motion-safe relative flex size-9 items-center justify-center rounded-[6px] border border-hairline bg-inset text-fg-muted transition hover:text-fg"
        >
          <IconBell size={17} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald" />
        </Link>
        <button
          type="button"
          className="reduce-motion-safe hidden items-center gap-2 rounded-[4px] bg-emerald px-3 py-2 text-xs font-semibold text-accent-contrast transition hover:bg-emerald-bright sm:inline-flex"
        >
          <IconPlus size={15} />
          New Report
        </button>
      </div>
    </header>
  );
}
