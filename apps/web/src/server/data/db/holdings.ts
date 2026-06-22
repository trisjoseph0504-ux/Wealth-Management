/** DB holdings repo (Backend B3, DATA_SOURCE=db). Operates on the user's default
 *  portfolio (created on demand). Scoped by userId. */
import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { portfolios, holdings } from "@/server/db/schema";
import type { Db } from "@/server/db/client";
import type { AssetClass } from "@/data/portfolio-mock";
import type { HoldingsRepo, PortfolioHolding } from "@/server/data/types";

async function defaultPortfolioId(db: Db, userId: string): Promise<string> {
  const rows = await db.select().from(portfolios).where(eq(portfolios.userId, userId)).limit(1);
  const existing = rows[0];
  if (existing) return existing.id;
  const created = await db
    .insert(portfolios)
    .values({ userId, name: "My Portfolio", isDefault: true })
    .returning();
  const p = created[0];
  if (!p) throw new Error("Failed to create default portfolio");
  return p.id;
}

const toHolding = (r: typeof holdings.$inferSelect): PortfolioHolding => ({
  id: r.id,
  symbol: r.symbol,
  quantity: Number(r.quantity),
  avgCost: Number(r.avgCost),
  assetClass: (r.assetClass ?? "Equities") as AssetClass,
  sector: r.sector ?? "Other",
});

export const dbHoldings: HoldingsRepo = {
  async list(userId) {
    const db = getDb();
    const pid = await defaultPortfolioId(db, userId);
    const rows = await db
      .select()
      .from(holdings)
      .where(and(eq(holdings.userId, userId), eq(holdings.portfolioId, pid)));
    return rows.map(toHolding);
  },
  async add(userId, input) {
    const db = getDb();
    const pid = await defaultPortfolioId(db, userId);
    const rows = await db
      .insert(holdings)
      .values({
        userId,
        portfolioId: pid,
        symbol: input.symbol,
        assetClass: input.assetClass,
        sector: input.sector,
        quantity: String(input.quantity),
        avgCost: String(input.avgCost),
        costCurrency: "USD",
      })
      .onConflictDoUpdate({
        target: [holdings.portfolioId, holdings.symbol],
        set: {
          quantity: String(input.quantity),
          avgCost: String(input.avgCost),
          assetClass: input.assetClass,
          sector: input.sector,
          updatedAt: new Date(),
        },
      })
      .returning();
    const r = rows[0];
    if (!r) throw new Error("Failed to add holding");
    return toHolding(r);
  },
  async remove(userId, holdingId) {
    const db = getDb();
    await db.delete(holdings).where(and(eq(holdings.userId, userId), eq(holdings.id, holdingId)));
  },
};
