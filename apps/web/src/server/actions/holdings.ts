"use server";

/**
 * Holdings server actions (Backend B3). Read/write the user's portfolio holdings
 * through the data seam (mock in-memory now, Postgres when DATA_SOURCE=db). When
 * adding by symbol, the asset class + sector are inferred from the securities
 * universe so the user only supplies symbol, quantity, and average cost.
 */
import { getData } from "@/server/data";
import { getCurrentUser } from "@/server/auth/current-user";
import { getSecurity } from "@/data/markets-mock";
import { inferAssetClass } from "@/data/portfolio-derive";
import type { PortfolioHolding } from "@/server/data/types";

export async function listHoldingsAction(): Promise<PortfolioHolding[]> {
  const user = await getCurrentUser();
  return getData().holdings.list(user.id);
}

export async function addHoldingAction(
  symbol: string,
  quantity: number,
  avgCost: number,
): Promise<PortfolioHolding | { error: string }> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return { error: "Enter a ticker symbol." };
  if (!Number.isFinite(quantity) || quantity <= 0) return { error: "Quantity must be greater than 0." };
  if (!Number.isFinite(avgCost) || avgCost < 0) return { error: "Average cost must be 0 or more." };

  const user = await getCurrentUser();
  const sec = getSecurity(sym);
  const assetClass = inferAssetClass(sec);
  const sector = sec?.sector ?? "Other";
  return getData().holdings.add(user.id, { symbol: sym, quantity, avgCost, assetClass, sector });
}

export async function removeHoldingAction(holdingId: string): Promise<void> {
  const user = await getCurrentUser();
  await getData().holdings.remove(user.id, holdingId);
}
