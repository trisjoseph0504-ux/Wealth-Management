/**
 * Market-data provider interface (B6). A swappable boundary: the app talks to
 * THIS interface, never a vendor SDK (ARCHITECTURE §1). Implementations: mock
 * (local universe) and finnhub (real data). Selected by MARKET_DATA_PROVIDER.
 */
export type InstrumentType = "Stock" | "ETF" | "Fund" | "Other";

export interface SymbolHit {
  symbol: string;
  name: string;
  type: InstrumentType;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  prevClose: number;
}

export interface CompanyProfile {
  name: string;
  exchange?: string;
  marketCapB?: number;
  industry?: string;
}

export interface MarketDataProvider {
  searchSymbols(query: string): Promise<SymbolHit[]>;
  getQuote(symbol: string): Promise<Quote | null>;
  getProfile(symbol: string): Promise<CompanyProfile | null>;
}
