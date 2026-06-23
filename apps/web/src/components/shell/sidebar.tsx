/**
 * Left navigation rail. Fixed on md+ (tablet/desktop "website"), hidden below
 * where the phone slide-over drawer carries nav. Nav items + active state come
 * from the shared <NavList>.
 */
import Link from "next/link";
import { LwWordmark } from "@/components/shell/logo";
import { NavList } from "@/components/shell/nav-list";
import { IconSettings } from "@/components/ui/icons";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-hairline bg-canvas/80 md:flex">
      <div className="flex h-16 items-center border-b border-hairline px-5">
        <LwWordmark />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <NavList />
      </nav>

      <div className="border-t border-hairline p-3">
        <Link
          href="/settings"
          className="reduce-motion-safe flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-[13px] font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
        >
          <IconSettings size={17} className="text-fg-subtle" />
          Settings
        </Link>
        <div className="mt-3 flex items-center gap-3 rounded-[8px] border border-hairline bg-inset px-3 py-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald/12 text-xs font-semibold text-emerald-bright">
            TL
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12px] font-medium text-fg">Tristan Lewis</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
