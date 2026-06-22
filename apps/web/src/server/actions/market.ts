"use server";

/** Market-data server actions (B6). Keep the API key server-side; the client
 *  calls these. Failures degrade gracefully (empty results / null quote). */
import { getMarketData } from "@/server/market";
import type { SymbolHit, Quote } from "@/server/market";

export async function searchSecuritiesAction(query: string): Promise<SymbolHit[]> {
  if (!query.trim()) return [];
  try {
    return await getMarketData().searchSymbols(query);
  } catch {
    return [];
  }
}

export async function getQuoteAction(symbol: string): Promise<Quote | null> {
  try {
    return await getMarketData().getQuote(symbol);
  } catch {
    return null;
  }
}
