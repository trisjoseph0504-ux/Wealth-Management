/** Panel / Card primitive. Hairline-bordered surface, restrained 8px radius. */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconChevronRight } from "@/components/ui/icons";

export function Card({
  children,
  className,
  as: As = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <As
      className={cn(
        "rounded-[8px] border border-hairline bg-surface/80",
        "backdrop-blur-[2px] supports-[backdrop-filter]:bg-surface/60",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-hairline px-5 py-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex size-7 items-center justify-center rounded-[6px] border border-hairline bg-inset text-emerald">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-fg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-fg-subtle">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

/** Subtle "view all" affordance used in card headers. */
export function CardLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="reduce-motion-safe inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-xs font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
    >
      {label}
      <IconChevronRight size={13} />
    </button>
  );
}
