/** Shared visual metadata for alert severity + category (icons, tones, colors). */
import type { ReactNode } from "react";
import type { Severity, AlertCategory } from "@/data/alerts-mock";
import {
  IconInfo,
  IconAlertTriangle,
  IconShield,
  IconWallet,
  IconLayers,
  IconTrendingUp,
  IconClock,
  IconEye,
  IconActivity,
} from "@/components/ui/icons";

export interface SeverityMeta {
  label: string;
  tone: "info" | "warn" | "danger";
  color: string; // CSS var for accents
  dot: string; // bg utility for the severity dot
  Icon: (p: { size?: number }) => ReactNode;
}

export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  info: { label: "Info", tone: "info", color: "var(--color-info)", dot: "bg-info", Icon: IconInfo },
  caution: { label: "Caution", tone: "warn", color: "var(--color-warn)", dot: "bg-warn", Icon: IconAlertTriangle },
  critical: { label: "Critical", tone: "danger", color: "var(--color-neg)", dot: "bg-neg", Icon: IconAlertTriangle },
};

export const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, caution: 1, info: 2 };

export function categoryIcon(category: AlertCategory, size = 14): ReactNode {
  const map: Record<AlertCategory, (p: { size?: number }) => ReactNode> = {
    drift: IconWallet,
    concentration: IconLayers,
    risk: IconShield,
    price: IconTrendingUp,
    earnings: IconClock,
    watchlist: IconEye,
    rebalance: IconActivity,
  };
  const Icon = map[category];
  return <Icon size={size} />;
}
