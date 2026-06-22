/**
 * Seed script — Backend B0. Populates `instrument` from the mock universe and a
 * demo user (Tristan) with the default portfolio + watchlists drawn from the
 * existing mock data, so the first real login looks exactly like the demo
 * (BACKEND_ARCHITECTURE §8.3).
 *
 * Requires a provisioned database:
 *   DATA_SOURCE=db DATABASE_URL=postgres://… npx tsx src/server/db/seed.ts
 * NOTE: not executed in B0 (no database yet) — present and type-checked. `tsx`
 * resolves the `@/` alias via tsconfig paths.
 */
import "@/server/load-env"; // MUST be first: loads .env.local before env is read.
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import {
  users,
  instruments,
  portfolios,
  holdings,
  watchlists,
  watchlistItems,
} from "@/server/db/schema";
import { securities } from "@/data/markets-mock";
import { watchlistSeeds } from "@/data/watchlists-mock";
import { holdings as mockHoldings } from "@/data/portfolio-mock";

const DEMO_EMAIL = "tristan@lewiswealth.example";
// MUST match DEMO_USER.id in src/server/auth/current-user.ts so the app (demo
// mode) reads the seeded data as the same owner.
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
  const db = getDb();

  // 1. Instrument reference cache.
  await db
    .insert(instruments)
    .values(
      securities.map((s) => ({
        symbol: s.symbol,
        name: s.name,
        assetClass: "Equities",
        sector: s.sector,
        exchange: null,
        currency: "USD",
      })),
    )
    .onConflictDoNothing();

  // 2. Demo user (idempotent).
  const userRows = await db
    .insert(users)
    .values({ id: DEMO_USER_ID, email: DEMO_EMAIL, name: "Tristan Lewis" })
    .onConflictDoUpdate({ target: users.email, set: { name: "Tristan Lewis" } })
    .returning();
  const user = userRows[0];
  if (!user) throw new Error("Failed to upsert demo user");

  // 3. Default portfolio + holdings (fresh).
  await db.delete(portfolios).where(eq(portfolios.userId, user.id));
  const pfRows = await db
    .insert(portfolios)
    .values({ userId: user.id, name: "Lewis Family Office", baseCurrency: "USD", isDefault: true })
    .returning();
  const portfolio = pfRows[0];
  if (!portfolio) throw new Error("Failed to create portfolio");

  await db.insert(holdings).values(
    mockHoldings.map((h) => ({
      userId: user.id,
      portfolioId: portfolio.id,
      symbol: h.symbol,
      assetClass: h.assetClass,
      sector: h.sector,
      quantity: String(h.quantity),
      avgCost: String(h.avgCost),
      costCurrency: "USD",
    })),
  );

  // 4. Watchlists + items (fresh).
  await db.delete(watchlists).where(eq(watchlists.userId, user.id));
  for (let i = 0; i < watchlistSeeds.length; i++) {
    const seed = watchlistSeeds[i]!;
    const wlRows = await db
      .insert(watchlists)
      .values({ userId: user.id, name: seed.name, sortOrder: i })
      .returning();
    const wl = wlRows[0];
    if (!wl) continue;
    if (seed.symbols.length > 0) {
      await db.insert(watchlistItems).values(
        seed.symbols.map((symbol, j) => ({
          userId: user.id,
          watchlistId: wl.id,
          symbol,
          sortOrder: j,
        })),
      );
    }
  }

  console.log(`Seeded demo user ${user.email}: ${mockHoldings.length} holdings, ${watchlistSeeds.length} watchlists.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
