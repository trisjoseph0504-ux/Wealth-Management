"use client";

/**
 * Dashboard alerts — create price-trigger alerts (symbol + above/below + price)
 * that persist in the browser (localStorage), so the panel is functional without
 * a backend alerts table. Lists active alerts with quick removal.
 */
import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button, EmptyState } from "@/components/ui/primitives";
import { SymbolCombobox } from "@/components/ui/symbol-combobox";
import { cn } from "@/lib/cn";
import { IconBell, IconPlus, IconClose, IconTrash } from "@/components/ui/icons";

interface PriceAlert {
  id: string;
  symbol: string;
  condition: "above" | "below";
  price: number;
}

const KEY = "lwi-dashboard-alerts";

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setAlerts(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  function save(next: PriceAlert[]) {
    setAlerts(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function add() {
    setError(null);
    const sym = symbol.trim().toUpperCase();
    const p = Number(price);
    if (!sym) return setError("Choose a symbol.");
    if (!Number.isFinite(p) || p <= 0) return setError("Enter a valid price.");
    save([{ id: `${sym}-${condition}-${p}-${alerts.length}`, symbol: sym, condition, price: p }, ...alerts]);
    setSymbol("");
    setPrice("");
    setShowForm(false);
  }

  function remove(id: string) {
    save(alerts.filter((a) => a.id !== id));
  }

  const hasAlerts = alerts.length > 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Alerts"
        subtitle="Price & risk triggers"
        icon={<IconBell size={16} />}
        action={
          loaded && (hasAlerts || showForm) ? (
            <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
              {showForm ? <IconClose size={14} /> : <IconPlus size={14} />} {showForm ? "Close" : "New"}
            </Button>
          ) : undefined
        }
      />

      {showForm && (
        <div className="border-b border-hairline bg-inset/30 px-5 py-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
            <label className="col-span-2 block sm:col-span-1">
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">Symbol</span>
              <SymbolCombobox value={symbol} onChange={setSymbol} onSelect={(h) => setSymbol(h.symbol)} placeholder="Search e.g. AAPL" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">Condition</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as "above" | "below")}
                className="w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-[13px] text-fg focus:border-emerald/40 focus:outline-none"
              >
                <option value="above">Rises above</option>
                <option value="below">Falls below</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">Price</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="250.00"
                className="tnum w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-[13px] text-fg placeholder:text-fg-subtle focus:border-emerald/40 focus:outline-none"
              />
            </label>
            <Button variant="primary" onClick={add} className="h-[38px] justify-center">
              Add
            </Button>
          </div>
          {error && <p className="mt-2 text-[12px] text-neg">{error}</p>}
        </div>
      )}

      {!loaded || !hasAlerts ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<IconBell size={18} />}
            title="No active alerts"
            description="Set price targets to be notified the moment conditions change."
            action={
              !showForm ? (
                <Button variant="outline" onClick={() => setShowForm(true)}>
                  <IconPlus size={14} />
                  Create alert
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <ul className="divide-y divide-hairline">
          {alerts.map((a) => (
            <li key={a.id} className="group flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-[6px] bg-inset text-[11px] font-semibold text-fg">
                  {a.symbol.slice(0, 4)}
                </span>
                <div className="leading-tight">
                  <p className="text-[13px] font-medium text-fg">{a.symbol}</p>
                  <p className="text-[11px] text-fg-subtle">
                    Notify when {a.condition === "above" ? "rises above" : "falls below"}{" "}
                    <span className={cn("tnum font-medium", a.condition === "above" ? "text-pos" : "text-neg")}>
                      ${a.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(a.id)}
                aria-label={`Remove ${a.symbol} alert`}
                className="reduce-motion-safe inline-flex size-7 items-center justify-center rounded-[4px] text-fg-subtle opacity-0 transition hover:bg-surface hover:text-neg focus-visible:opacity-100 group-hover:opacity-100"
              >
                <IconTrash size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
