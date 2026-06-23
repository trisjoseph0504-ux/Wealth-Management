/**
 * Donut palette + color helper — kept in a plain (non-"use client") module so
 * Server Components can call `colorAt` directly while the interactive <Donut>
 * lives in a client module.
 *
 * Categorical palette broadened from the original emerald→teal→slate ramp into a
 * wider cool-toned set (greens, teals, cyans, blues, indigos, violets, magentas,
 * slates), interleaved so adjacent slices contrast. Never introduces yellow/gold
 * (DESIGN_SYSTEM.md §6).
 */

export interface DonutDatum {
  key: string;
  label: string;
  value: number;
  sub?: string; // optional secondary line in the hover tooltip (e.g. company name)
}

export const ALLOCATION_COLORS = [
  "#10b981", // emerald
  "#3b82c4", // blue
  "#b5589f", // magenta
  "#2bb39b", // teal
  "#6d6fd4", // indigo
  "#cf6a90", // rose
  "#1aa6b5", // cyan
  "#9560c4", // violet
  "#5183b3", // steel blue
  "#3f9bb0", // teal-blue
  "#6e8ba8", // slate
  "#8a93a3", // slate gray
] as const;

/**
 * Color for the slice at `index`. Uses the curated palette first; beyond it,
 * spreads further hues by the golden angle (dodging the excluded warm
 * yellow/gold band) so any number of holdings stays visually distinct.
 */
export function colorAt(index: number): string {
  if (index < ALLOCATION_COLORS.length) return ALLOCATION_COLORS[index]!;
  let hue = (index * 137.508) % 360; // golden angle → well-spread hues
  if (hue >= 40 && hue <= 75) hue = (hue + 60) % 360; // skip yellow/gold
  return `hsl(${Math.round(hue)} 45% 55%)`;
}
