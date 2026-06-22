/**
 * Drizzle schema — Backend B0 (single-owner, v1). Implements the model in
 * docs/BACKEND_ARCHITECTURE.md §2. Every domain row is owned by `user_id`; there
 * is NO org tenancy yet (added later behind a contained migration — §5 of the
 * plan). Money is NUMERIC (string in JS, never float — CLAUDE.md §5).
 *
 * Includes the Auth.js core tables (user/account/session/verification_token) so
 * the baseline migration is auth-ready for Phase B1; they are not used until then.
 */
import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  integer,
  jsonb,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

/* ── Identity (Auth.js-managed) ───────────────────────────────────────────── */
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  createdAt,
  updatedAt,
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* ── Preferences ──────────────────────────────────────────────────────────── */
export const userPreferences = pgTable("user_preference", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme", { enum: ["dark", "light"] }).notNull().default("dark"),
  baseCurrency: text("base_currency").notNull().default("USD"),
  locale: text("locale").notNull().default("en-US"),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt,
});

/* ── Portfolios & holdings ────────────────────────────────────────────────── */
export const portfolios = pgTable("portfolio", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  baseCurrency: text("base_currency").notNull().default("USD"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt,
  updatedAt,
});

export const holdings = pgTable(
  "holding",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => portfolios.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    assetClass: text("asset_class"),
    sector: text("sector"),
    // Money/quantity are NUMERIC — string in JS, never float.
    quantity: numeric("quantity", { precision: 28, scale: 8 }).notNull(),
    avgCost: numeric("avg_cost", { precision: 20, scale: 8 }).notNull(),
    costCurrency: text("cost_currency").notNull().default("USD"),
    createdAt,
    updatedAt,
  },
  (t) => [unique("holding_portfolio_symbol_uq").on(t.portfolioId, t.symbol)],
);

/* ── Watchlists ───────────────────────────────────────────────────────────── */
export const watchlists = pgTable("watchlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
  updatedAt,
});

export const watchlistItems = pgTable(
  "watchlist_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    watchlistId: uuid("watchlist_id")
      .notNull()
      .references(() => watchlists.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    note: text("note"),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("watchlist_item_uq").on(t.watchlistId, t.symbol)],
);

/* ── Saved screens ────────────────────────────────────────────────────────── */
export const savedScreens = pgTable("saved_screen", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  criteria: jsonb("criteria").$type<Record<string, unknown>>().notNull().default({}),
  createdAt,
  updatedAt,
});

/* ── Alerts ───────────────────────────────────────────────────────────────── */
export const alertRules = pgTable("alert_rule", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scope: text("scope", { enum: ["instrument", "portfolio", "sector"] }).notNull(),
  target: text("target"),
  condition: jsonb("condition").$type<Record<string, unknown>>().notNull().default({}),
  severityDefault: text("severity_default", { enum: ["info", "caution", "critical"] }).notNull().default("info"),
  channel: text("channel", { enum: ["in_app", "email"] }).notNull().default("in_app"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt,
  updatedAt,
});

export const alertEvents = pgTable("alert_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Null for system-derived alerts (drift, concentration, risk-threshold).
  alertRuleId: uuid("alert_rule_id").references(() => alertRules.id, { onDelete: "set null" }),
  category: text("category").notNull(),
  severity: text("severity", { enum: ["info", "caution", "critical"] }).notNull(),
  title: text("title").notNull(),
  body: text("body"),
  evidence: jsonb("evidence").$type<Record<string, unknown>>().notNull().default({}),
  triggeredAt: timestamp("triggered_at", { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

/* ── Research notes / investment memos ────────────────────────────────────── */
export const researchNotes = pgTable("research_note", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  symbol: text("symbol"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  pinned: boolean("pinned").notNull().default(false),
  createdAt,
  updatedAt,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/* ── Risk analytics persistence ───────────────────────────────────────────── */
export const riskSnapshots = pgTable("risk_snapshot", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  portfolioId: uuid("portfolio_id")
    .notNull()
    .references(() => portfolios.id, { onDelete: "cascade" }),
  asOf: timestamp("as_of", { withTimezone: true }).notNull(),
  metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull().default({}),
  createdAt,
});

/* ── Reference & cross-cutting ────────────────────────────────────────────── */
export const instruments = pgTable("instrument", {
  symbol: text("symbol").primaryKey(),
  name: text("name").notNull(),
  assetClass: text("asset_class"),
  sector: text("sector"),
  exchange: text("exchange"),
  currency: text("currency").notNull().default("USD"),
  updatedAt,
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  createdAt,
});

/** Full schema object for the Drizzle client. */
export const schema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  userPreferences,
  portfolios,
  holdings,
  watchlists,
  watchlistItems,
  savedScreens,
  alertRules,
  alertEvents,
  researchNotes,
  riskSnapshots,
  instruments,
  auditLog,
};
