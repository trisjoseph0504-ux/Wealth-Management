/** Small shared primitives: Button, Badge, Skeleton, EmptyState, SectionLabel. */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "outline";

export function Button({
  variant = "outline",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-emerald text-accent-contrast hover:bg-emerald-bright disabled:bg-emerald/40",
    ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
    outline:
      "border border-line-strong bg-inset text-fg hover:border-emerald/50 hover:text-fg",
  };
  return (
    <button
      type="button"
      className={cn(
        "reduce-motion-safe inline-flex items-center justify-center gap-2 rounded-[4px] px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/50 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type BadgeTone = "neutral" | "emerald" | "caution" | "info" | "warn" | "danger";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const tones: Record<BadgeTone, string> = {
    neutral: "border-hairline bg-inset text-fg-muted",
    emerald: "border-emerald/30 bg-emerald/10 text-emerald-bright",
    caution: "border-caution/30 bg-caution/10 text-caution",
    info: "border-info/30 bg-info/10 text-info",
    warn: "border-warn/30 bg-warn/10 text-warn",
    danger: "border-neg/30 bg-neg/10 text-neg",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[4px] bg-surface-2",
        className,
      )}
    />
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      {icon && (
        <span className="flex size-10 items-center justify-center rounded-[8px] border border-hairline bg-inset text-fg-subtle">
          {icon}
        </span>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="mx-auto max-w-xs text-xs leading-relaxed text-fg-subtle">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
