/**
 * Market-data factory (B6). Returns the active provider by MARKET_DATA_PROVIDER
 * (mock | finnhub). Callers use this seam — never a concrete provider directly.
 */
import { env } from "@/server/env";
import type { MarketDataProvider } from "@/server/market/types";
import { mockProvider } from "@/server/market/mock";
import { finnhubProvider } from "@/server/market/finnhub";

export function getMarketData(): MarketDataProvider {
  return env.MARKET_DATA_PROVIDER === "finnhub" ? finnhubProvider : mockProvider;
}

export type { SymbolHit, Quote, CompanyProfile, InstrumentType } from "@/server/market/types";
