/**
 * Data-access seam — typed repository interfaces (Backend B0–B2).
 *
 * Both the Mock and the DB implementations satisfy these SAME interfaces, so the
 * mock→DB migration is a dependency-injection swap, not a UI rewrite
 * (BACKEND_ARCHITECTURE §8). Every method takes `userId` for the single-owner
 * model — Mock impls ignore it (single demo user); DB impls scope by it.
 *
 * B0: preferences + watchlists. B2: + saved screens + research notes.
 */

/* ── Preferences ──────────────────────────────────────────────────────────── */
export interface UserPreferences {
  theme: "dark" | "light";
  baseCurrency: string;
  locale: string;
}
export interface PreferencesRepo {
  get(userId: string): Promise<UserPreferences>;
  update(userId: string, patch: Partial<UserPreferences>): Promise<UserPreferences>;
}

/* ── Watchlists ───────────────────────────────────────────────────────────── */
export interface WatchlistItem {
  symbol: string;
  note: string | null;
  sortOrder: number;
}
export interface Watchlist {
  id: string;
  name: string;
  sortOrder: number;
  items: WatchlistItem[];
}
export interface WatchlistsRepo {
  list(userId: string): Promise<Watchlist[]>;
  create(userId: string, name: string): Promise<Watchlist>;
  remove(userId: string, watchlistId: string): Promise<void>;
  addItem(userId: string, watchlistId: string, symbol: string): Promise<void>;
  removeItem(userId: string, watchlistId: string, symbol: string): Promise<void>;
}

/* ── Saved screens ────────────────────────────────────────────────────────── */
export interface SavedScreen {
  id: string;
  name: string;
  criteria: Record<string, unknown>;
}
export interface SavedScreensRepo {
  list(userId: string): Promise<SavedScreen[]>;
  save(userId: string, name: string, criteria: Record<string, unknown>): Promise<SavedScreen>;
  remove(userId: string, id: string): Promise<void>;
}

/* ── Research notes / investment memos ────────────────────────────────────── */
export interface Note {
  id: string;
  title: string;
  body: string;
  symbol: string | null;
  tags: string[];
  pinned: boolean;
  updatedAt: string; // ISO
}
export interface NoteInput {
  title: string;
  body: string;
  symbol?: string | null;
  tags?: string[];
  pinned?: boolean;
}
export interface NotesRepo {
  list(userId: string): Promise<Note[]>;
  get(userId: string, id: string): Promise<Note | null>;
  create(userId: string, input: NoteInput): Promise<Note>;
  update(userId: string, id: string, patch: Partial<NoteInput>): Promise<Note | null>;
  remove(userId: string, id: string): Promise<void>;
}

/* ── Portfolio holdings (B3) ──────────────────────────────────────────────── */
import type { AssetClass } from "@/data/portfolio-mock";

export interface PortfolioHolding {
  id: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  assetClass: AssetClass;
  sector: string;
}
export interface HoldingAddInput {
  symbol: string;
  quantity: number;
  avgCost: number;
  assetClass: AssetClass;
  sector: string;
}
export interface HoldingsRepo {
  list(userId: string): Promise<PortfolioHolding[]>;
  add(userId: string, input: HoldingAddInput): Promise<PortfolioHolding>;
  remove(userId: string, holdingId: string): Promise<void>;
}

/** The set of repositories available to the app. Grows one domain per phase. */
export interface DataSource {
  preferences: PreferencesRepo;
  watchlists: WatchlistsRepo;
  savedScreens: SavedScreensRepo;
  notes: NotesRepo;
  holdings: HoldingsRepo;
}
