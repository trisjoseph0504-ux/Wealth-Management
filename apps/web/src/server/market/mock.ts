/**
 * Mock market-data provider (B6). Backs search/quotes from the local securities
 * universe — the offline fallback and the default (MARKET_DATA_PROVIDER=mock).
 */
import { securities, getSecurity } from "@/data/markets-mock";
import type { MarketDataProvider } from "@/server/market/types";

export const mockProvider: MarketDataProvider = {
  async searchSymbols(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return securities
      .filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, 10)
      .map((s) => ({ symbol: s.symbol, name: s.name, type: s.assetType }));
  },
  async getQuote(symbol) {
    const s = getSecurity(symbol);
    if (!s) return null;
    const prevClose = s.price / (1 + s.changePct / 100);
    return { symbol, price: s.price, change: s.price - prevClose, changePct: s.changePct, prevClose };
  },
  async getProfile(symbol) {
    const s = getSecurity(symbol);
    if (!s) return null;
    return { name: s.name, industry: s.sector, marketCapB: s.marketCapB };
  },
};
