import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";

export const metadata: Metadata = {
  title: "Lewis Wealth Intelligence",
  description:
    "Institutional-grade financial intelligence and wealth management platform.",
};

export const viewport: Viewport = {
  themeColor: "#07090a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // `data-theme` is the single switch for theming. Dark is the brand default.
  // The no-flash script below applies a saved theme cookie before paint, so the
  // page never flashes the wrong theme (Backend B1) — see docs/DESIGN_SYSTEM.md §10.
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <script
          // Runs before paint: if a theme cookie is set, apply it to <html>.
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=document.cookie.match(/(?:^|; )lwi-theme=(dark|light)/);if(m){document.documentElement.dataset.theme=m[1];}}catch(e){}})();",
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
