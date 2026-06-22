/**
 * Deterministic per-point axis/tooltip labels for the mock price charts. Built
 * from a FIXED anchor date (the platform "as of" day) and formatted in UTC, so
 * server and client render identical strings (no hydration drift) and no
 * `Date.now()` is used at module scope.
 */
const ANCHOR_UTC = Date.UTC(2026, 5, 21); // Jun 21, 2026
const DAY = 86_400_000;

const SPAN_DAYS: Record<string, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 91,
  YTD: 172,
  "1Y": 365,
  "5Y": 1826,
};

function dateFmt(key: string): Intl.DateTimeFormat {
  const opts: Intl.DateTimeFormatOptions =
    key === "1Y"
      ? { timeZone: "UTC", month: "short" }
      : key === "5Y"
        ? { timeZone: "UTC", year: "numeric" }
        : { timeZone: "UTC", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", opts);
}

/** One label per data point for a given range key (e.g. "1D", "3M", "1Y"). */
export function rangePointLabels(key: string, n: number): string[] {
  const out: string[] = [];
  if (n <= 0) return out;

  if (key === "1D") {
    const startMin = 9 * 60 + 30; // 9:30
    const endMin = 16 * 60; // 16:00
    for (let i = 0; i < n; i++) {
      const m = Math.round(startMin + ((endMin - startMin) * i) / (n - 1 || 1));
      const h = Math.floor(m / 60);
      const mm = m % 60;
      const ap = h >= 12 ? "PM" : "AM";
      const h12 = ((h + 11) % 12) + 1;
      out.push(`${h12}:${String(mm).padStart(2, "0")} ${ap}`);
    }
    return out;
  }

  const spanDays = SPAN_DAYS[key] ?? 91;
  const start = ANCHOR_UTC - spanDays * DAY;
  const fmt = dateFmt(key);
  for (let i = 0; i < n; i++) {
    const t = start + ((ANCHOR_UTC - start) * i) / (n - 1 || 1);
    out.push(fmt.format(new Date(t)));
  }
  return out;
}
