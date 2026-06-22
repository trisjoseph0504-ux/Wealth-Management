/** Mock holdings repo (Backend B3). Wraps the portfolio-mock holdings so the
 *  portfolio page shows the demo positions; in-memory add/remove. */
import { holdings as seed } from "@/data/portfolio-mock";
import type { HoldingsRepo, PortfolioHolding } from "@/server/data/types";

let items: PortfolioHolding[] = seed.map((h) => ({
  id: h.id,
  symbol: h.symbol,
  quantity: h.quantity,
  avgCost: h.avgCost,
  assetClass: h.assetClass,
  sector: h.sector,
}));

export const mockHoldings: HoldingsRepo = {
  async list() {
    return items;
  },
  async add(_userId, input) {
    const existing = items.find((h) => h.symbol === input.symbol);
    if (existing) {
      items = items.map((h) => (h.symbol === input.symbol ? { ...h, ...input, id: h.id } : h));
      return { ...existing, ...input };
    }
    const it: PortfolioHolding = { id: `h-${Date.now()}`, ...input };
    items = [it, ...items];
    return it;
  },
  async remove(_userId, holdingId) {
    items = items.filter((h) => h.id !== holdingId);
  },
};
