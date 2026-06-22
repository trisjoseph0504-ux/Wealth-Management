/**
 * Backend B3 — pure portfolio derivation. Takes raw holdings (from the data seam:
 * mock or Postgres) and enriches them from the shared securities universe to
 * produce everything the Portfolio page renders: enriched holdings, summary,
 * asset/sector allocation, and movers. Same shapes as portfolio-mock, so the
 * existing components are reused unchanged (just prop-driven).
 *
 * The portfolio's prices come from the securities universe = one source of truth.
 * Plain `number` is mock-display only (CLAUDE.md §5).
 */
import { getSecurity, type Security } from "@/data/markets-mock";
import type { Holding, AssetClass } from "@/data/portfolio-mock";

/** Minimal holding as stored (seam input). */
export interface RawHolding {
  id: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  assetClass: AssetClass;
  sector: string;
}

export interface Allocation {
  label: string;
  value: number;
  weightPct: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPct: number;
  dayChangeUsd: number;
  dayChangePct: number;
  cash: number;
  holdingsCount: number;
  ytdReturnPct: number;
  incomeYieldPct: number;
  asOf: string;
}

export interface PortfolioView {
  holdings: Holding[];
  assetAllocation: Allocation[];
  sectorAllocation: Allocation[];
  movers: { winners: Holding[]; losers: Holding[] };
  summary: PortfolioSummary;
}

/** Infer the broad asset class for a security being added by symbol. */
export function inferAssetClass(sec: Security | undefined): AssetClass {
  if (!sec) return "Equities";
  const c = (sec.category ?? "").toLowerCase();
  if (c.includes("bond") || c.includes("treasury") || c.includes("government")) return "Fixed Income";
  if (c.includes("digital")) return "Digital Assets";
  if (c.includes("gold") || c.includes("commodit") || c.includes("real estate")) return "Real Assets";
  return "Equities";
}

function enrich(inputs: RawHolding[]): Holding[] {
  const items = inputs.map((h): Holding => {
    const sec = getSecurity(h.symbol);
    const isCash = h.assetClass === "Cash" || h.symbol === "USD";
    const price = sec?.price ?? (isCash ? 1 : h.avgCost);
    const name = sec?.name ?? (isCash ? "Cash & Money Market" : h.symbol);
    const dayChangePct = isCash ? 0 : (sec?.changePct ?? 0);
    const trend = sec?.trend ?? [price, price, price, price, price, price, price];
    const marketValue = h.quantity * price;
    const costValue = h.quantity * h.avgCost;
    const gainUsd = marketValue - costValue;
    const gainPct = costValue > 0 ? (gainUsd / costValue) * 100 : 0;
    return {
      id: h.id,
      symbol: h.symbol,
      name,
      assetClass: h.assetClass,
      sector: h.sector,
      accountId: "",
      quantity: h.quantity,
      avgCost: h.avgCost,
      price,
      dayChangePct,
      trend,
      marketValue,
      costValue,
      gainUsd,
      gainPct,
      weightPct: 0,
    };
  });
  const total = items.reduce((s, h) => s + h.marketValue, 0) || 1;
  return items.map((h) => ({ ...h, weightPct: (h.marketValue / total) * 100 }));
}

function aggregate(holdings: Holding[], key: "assetClass" | "sector"): Allocation[] {
  const total = holdings.reduce((s, h) => s + h.marketValue, 0) || 1;
  const map = new Map<string, number>();
  for (const h of holdings) map.set(h[key], (map.get(h[key]) ?? 0) + h.marketValue);
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value, weightPct: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export function buildPortfolio(inputs: RawHolding[]): PortfolioView {
  const holdings = enrich(inputs);
  const totalValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalCost = holdings.reduce((s, h) => s + h.costValue, 0);
  const totalGain = totalValue - totalCost;
  const investable = holdings.filter((h) => h.assetClass !== "Cash");
  const dayChangeUsd = investable.reduce((s, h) => s + (h.marketValue * h.dayChangePct) / 100, 0);

  return {
    holdings,
    assetAllocation: aggregate(holdings, "assetClass"),
    sectorAllocation: aggregate(holdings, "sector"),
    movers: {
      winners: investable.slice().sort((a, b) => b.dayChangePct - a.dayChangePct).slice(0, 4),
      losers: investable.slice().sort((a, b) => a.dayChangePct - b.dayChangePct).slice(0, 4),
    },
    summary: {
      totalValue,
      totalCost,
      totalGain,
      totalGainPct: totalCost > 0 ? (totalGain / totalCost) * 100 : 0,
      dayChangeUsd,
      dayChangePct: totalValue > 0 ? (dayChangeUsd / totalValue) * 100 : 0,
      cash: holdings.filter((h) => h.assetClass === "Cash").reduce((s, h) => s + h.marketValue, 0),
      holdingsCount: investable.length,
      // Illustrative trailing figures — only meaningful when the book is funded.
      ytdReturnPct: holdings.length > 0 ? 14.82 : 0,
      incomeYieldPct: holdings.length > 0 ? 1.94 : 0,
      asOf: "Jun 21, 2026 · 4:00 PM ET",
    },
  };
}
