/**
 * Single source of truth for primary navigation. Consumed by the desktop
 * sidebar and the mobile drawer so they never drift. `href: "#"` marks routes
 * not yet built (they render inert until their phase lands).
 */
import type { ReactNode } from "react";
import {
  IconBell,
  IconDashboard,
  IconEye,
  IconFilter,
  IconGlobe,
  IconNote,
  IconPie,
  IconShield,
  IconSparkles,
  IconWallet,
} from "@/components/ui/icons";

export interface NavLinkItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

export interface NavGroupDef {
  label: string;
  items: NavLinkItem[];
}

export const navGroups: NavGroupDef[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/", icon: <IconDashboard size={17} /> },
      { label: "Portfolio", href: "/portfolio", icon: <IconWallet size={17} /> },
      { label: "Allocation", href: "#", icon: <IconPie size={17} /> },
      { label: "Watchlists", href: "/watchlists", icon: <IconEye size={17} /> },
      { label: "Screener", href: "/screener", icon: <IconFilter size={17} /> },
      { label: "Markets", href: "/markets", icon: <IconGlobe size={17} /> },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Risk Analytics", href: "/risk", icon: <IconShield size={17} /> },
      { label: "Intelligence", href: "/intelligence", icon: <IconSparkles size={17} />, badge: "Beta" },
      { label: "Alerts", href: "/alerts", icon: <IconBell size={17} /> },
      { label: "Research Notes", href: "/notes", icon: <IconNote size={17} /> },
    ],
  },
];

/** Active when the link points at the current route (ignore inert "#" links). */
export function isActiveHref(href: string, pathname: string): boolean {
  if (href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
