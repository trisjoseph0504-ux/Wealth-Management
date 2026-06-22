"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { navGroups, isActiveHref } from "@/lib/nav";

/** Shared navigation list (desktop sidebar + mobile drawer). */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">
            {group.label}
          </p>
          {group.items.map((item) => {
            const active = isActiveHref(item.href, pathname);
            const inert = item.href === "#";
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                aria-disabled={inert || undefined}
                className={cn(
                  "reduce-motion-safe group flex items-center gap-3 rounded-[6px] px-3 py-2 text-[13px] font-medium transition",
                  active
                    ? "bg-emerald/10 text-fg ring-1 ring-inset ring-emerald/25"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  inert && "cursor-default opacity-70 hover:bg-transparent hover:text-fg-muted",
                )}
              >
                <span className={cn(active ? "text-emerald" : "text-fg-subtle group-hover:text-fg-muted")}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {active && <span className="size-1.5 rounded-full bg-emerald" />}
                {item.badge && (
                  <span className="rounded-full border border-emerald/30 bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-bright">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
