"use client";

/**
 * Live market clock + NYSE session indicator. Shows a ticking current time in
 * US/Central (CT) next to an open/closed badge. The open/closed status is still
 * determined in US/Eastern — the market's own timezone, the only correct basis —
 * but every time shown to the user is Central. Regular hours: Mon–Fri 9:30 AM –
 * 4:00 PM ET (8:30 AM – 3:00 PM CT), excluding 2026 US market holidays.
 *
 * Time is resolved in an effect (not during render) so SSR and the first client
 * paint match — avoiding hydration drift from clock differences.
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/primitives";

// NYSE full-day closures for 2026 (YYYY-MM-DD, US/Eastern calendar date).
const HOLIDAYS_2026 = new Set([
  "2026-01-01", // New Year's Day
  "2026-01-19", // MLK Jr. Day
  "2026-02-16", // Presidents' Day
  "2026-04-03", // Good Friday
  "2026-05-25", // Memorial Day
  "2026-06-19", // Juneteenth
  "2026-07-03", // Independence Day (observed)
  "2026-09-07", // Labor Day
  "2026-11-26", // Thanksgiving
  "2026-12-25", // Christmas
]);

interface Status {
  open: boolean;
  reason: string; // tooltip detail (Central time)
}

function computeStatus(): Status {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = get("weekday"); // Mon, Tue, …
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0; // some engines emit "24" at midnight
  const minutes = hour * 60 + Number(get("minute"));

  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const isHoliday = HOLIDAYS_2026.has(date);
  const OPEN = 9 * 60 + 30; // 9:30 ET
  const CLOSE = 16 * 60; // 16:00 ET
  const inSession = minutes >= OPEN && minutes < CLOSE;

  if (isWeekend) return { open: false, reason: "Weekend · market opens Monday 8:30 AM CT" };
  if (isHoliday) return { open: false, reason: "Market holiday · NYSE closed today" };
  if (!inSession) {
    const which = minutes < OPEN ? "Pre-market" : "After hours";
    return { open: false, reason: `${which} · regular session 8:30 AM – 3:00 PM CT` };
  }
  return { open: true, reason: "Open · regular session 8:30 AM – 3:00 PM CT" };
}

// Current wall-clock time in Central, e.g. "10:31 PM CT".
function centralTime(): string {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date()) + " CT"
  );
}

export function MarketStatus({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      setStatus(computeStatus());
      setNow(centralTime());
    };
    tick();
    const id = setInterval(tick, 15_000); // keeps the clock current to the minute
    return () => clearInterval(id);
  }, []);

  // Pre-mount neutral state (matches SSR output → no hydration mismatch).
  if (!status || !now) {
    return (
      <span className={cn("items-center gap-2", className)} title="Checking market hours…">
        <Badge tone="neutral">
          <span className="size-1.5 rounded-full bg-fg-subtle" />
          Markets
        </Badge>
      </span>
    );
  }

  return (
    <span className={cn("items-center gap-2", className)} title={status.reason}>
      <span className="tnum hidden text-[11px] tabular-nums text-fg-subtle lg:inline">{now}</span>
      <Badge tone={status.open ? "emerald" : "neutral"}>
        <span className={`size-1.5 rounded-full ${status.open ? "bg-emerald" : "bg-fg-subtle"}`} />
        {status.open ? "Markets Open" : "Markets Closed"}
      </Badge>
    </span>
  );
}
