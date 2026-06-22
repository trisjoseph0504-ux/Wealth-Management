"use client";

/** Composes the institutional shell: fixed sidebar + sticky topbar + content.
 *  Standalone routes (the sign-in screen) render bare — no sidebar/topbar. */
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { ContextMenuProvider } from "@/components/ui/context-menu";
import { Toaster } from "@/components/ui/toast";

const BARE_ROUTES = new Set(["/sign-in"]);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const content = BARE_ROUTES.has(pathname) ? (
    <div className="app-canvas min-h-screen">{children}</div>
  ) : (
    <div className="app-canvas flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );

  return (
    <ContextMenuProvider>
      {content}
      <Toaster />
    </ContextMenuProvider>
  );
}
