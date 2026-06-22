"use client";

/**
 * "New Report" action — generates a portfolio report from live data (server) and
 * downloads it as a text file. Shows a brief generating state; surfaces errors.
 */
import { useState } from "react";
import { generatePortfolioReportAction } from "@/server/actions/report";
import { IconPlus } from "@/components/ui/icons";

export function ReportButton() {
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const { filename, content } = await generatePortfolioReportAction();
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      className="reduce-motion-safe hidden items-center gap-2 rounded-[4px] bg-emerald px-3 py-2 text-xs font-semibold text-accent-contrast transition hover:bg-emerald-bright disabled:opacity-60 sm:inline-flex"
    >
      <IconPlus size={15} />
      {busy ? "Generating…" : "New Report"}
    </button>
  );
}
