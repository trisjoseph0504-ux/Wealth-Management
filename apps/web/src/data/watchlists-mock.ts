/**
 * Phase 3 watchlist seeds. Lists reference symbols from the shared securities
 * universe (markets-mock) so prices/changes stay consistent everywhere. Includes
 * one empty list to exercise the empty state. Client state is in-memory only —
 * no persistence until a backend lands.
 */

export interface WatchlistSeed {
  id: string;
  name: string;
  symbols: string[];
}

export const watchlistSeeds: WatchlistSeed[] = [
  {
    id: "core",
    name: "Core Holdings",
    symbols: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "BRK.B", "JPM", "UNH"],
  },
  {
    id: "tech",
    name: "Tech Leaders",
    symbols: ["AAPL", "MSFT", "NVDA", "AVGO", "ORCL", "AMD", "CRM", "ADBE"],
  },
  {
    id: "income",
    name: "Dividend & Defensive",
    symbols: ["KO", "PG", "JNJ", "DUK", "NEE", "WMT"],
  },
  {
    id: "ideas",
    name: "New Ideas",
    symbols: [],
  },
];
