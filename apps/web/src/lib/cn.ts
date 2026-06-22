/**
 * Minimal className combiner. Falsy values are dropped, the rest joined.
 * Kept dependency-free for Phase 1; swap for clsx + tailwind-merge if conflict
 * resolution becomes necessary.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
