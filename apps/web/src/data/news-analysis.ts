/**
 * News impact analysis (rules-based). Classifies a real news headline into a
 * macro/sector topic by keyword, and attaches a written explanation of the
 * transmission mechanism — which sectors it moves and WHY — plus a market stance.
 * This is the "why & how" layer: deterministic, sourced from real economic
 * relationships (not an LLM, not random mock). Watchlist matches are flagged so
 * the feed warns about names the user is tracking.
 */
import type { NewsItem } from "@/server/market/news";

export type Stance = "risk-on" | "risk-off" | "mixed" | "neutral";

export interface NewsTopic {
  id: string;
  label: string;
  why: string;
  sectors: string[];
  stance: Stance;
}

interface TopicDef extends NewsTopic {
  keywords: string[];
}

// Order matters: more specific topics first so they win over broad ones.
const TOPICS: TopicDef[] = [
  {
    id: "ai-semis",
    label: "AI & Semiconductors",
    keywords: ["artificial intelligence", " ai ", "ai chip", "ai demand", "semiconductor", "chipmaker", "nvidia", "gpu", "data center", "openai", "datacenter"],
    why: "AI capital spending is the dominant growth engine for chips, cloud and data-center infrastructure. Strong AI demand lifts semiconductor makers and hyperscalers; any sign of a spending slowdown hits the whole complex hard given how richly it's valued.",
    sectors: ["Technology", "Communication"],
    stance: "risk-on",
  },
  {
    id: "crypto",
    label: "Crypto & Digital Assets",
    keywords: ["bitcoin", "crypto", "ethereum", "digital asset", "btc", "blockchain", "stablecoin", "coinbase"],
    why: "Crypto trades as a high-beta risk asset, sensitive to liquidity, interest rates and regulation. Rallies signal broad risk appetite; sharp moves spill into exchanges, miners and crypto-exposed financials.",
    sectors: ["Digital Assets", "Financials"],
    stance: "risk-on",
  },
  {
    id: "geopolitics",
    label: "Geopolitics & Conflict",
    keywords: ["war", "invasion", "missile", "military", "geopolit", "middle east", "ukraine", "taiwan", "conflict", "ceasefire", "sanction"],
    why: "Geopolitical shocks drive risk-off moves: oil and defense names tend to rise on supply fears, while broad equities, travel and other risk assets fall on uncertainty. De-escalation reverses the pattern.",
    sectors: ["Energy", "Industrials"],
    stance: "risk-off",
  },
  {
    id: "tariffs",
    label: "Tariffs & Trade",
    keywords: ["tariff", "trade war", "trade deal", "import duty", "export control", "customs", "trade policy"],
    why: "Tariffs raise input costs and disrupt supply chains. Import-reliant manufacturers, autos, retailers and multinational tech face margin and demand risk, while some domestic producers benefit from reduced foreign competition.",
    sectors: ["Industrials", "Technology", "Consumer Discretionary", "Materials"],
    stance: "risk-off",
  },
  {
    id: "rates",
    label: "Interest Rates & the Fed",
    keywords: ["federal reserve", "the fed", "interest rate", "rate cut", "rate hike", "fomc", "powell", "monetary policy", "basis point", "rate decision", "yield"],
    why: "Rate moves reprice the entire market. Lower rates cut borrowing costs and lift long-duration, rate-sensitive assets (tech/growth, real estate, utilities) but squeeze bank margins; higher rates do the reverse and pressure richly-valued stocks.",
    sectors: ["Technology", "Real Estate", "Utilities", "Financials"],
    stance: "mixed",
  },
  {
    id: "inflation",
    label: "Inflation",
    keywords: ["inflation", "cpi", "ppi", "consumer price", "core price", "disinflation", "deflation", "pce"],
    why: "Inflation data drives rate expectations. Hotter prints push yields up and pressure growth stocks and bonds; cooler prints support risk assets and raise the odds of rate cuts. Staples and pricing-power names are relatively defensive.",
    sectors: ["Consumer Staples", "Technology", "Fixed Income"],
    stance: "mixed",
  },
  {
    id: "jobs",
    label: "Jobs & Labor Market",
    keywords: ["jobs report", "payroll", "nonfarm", "unemployment", "jobless claims", "labor market", "wage growth", "hiring", "layoff"],
    why: "The labor market shapes both Fed policy and consumer strength. A strong report supports earnings but can delay rate cuts (mixed for stocks); a weak report raises recession worry but boosts cut expectations.",
    sectors: ["Consumer Discretionary", "Financials"],
    stance: "mixed",
  },
  {
    id: "energy",
    label: "Oil & Energy",
    keywords: ["oil price", "crude", "opec", "brent", "wti", "natural gas", "gasoline", "energy price", "barrel"],
    why: "Energy prices flow through the whole economy. Higher oil lifts producers but taxes consumers and raises costs for transports, airlines and manufacturers; lower oil eases inflation and helps consumer-facing sectors.",
    sectors: ["Energy", "Industrials", "Consumer Discretionary"],
    stance: "mixed",
  },
  {
    id: "housing",
    label: "Housing & Real Estate",
    keywords: ["housing", "mortgage rate", "home sales", "homebuilder", "real estate", "existing home", "new home"],
    why: "Housing is highly rate-sensitive. Lower mortgage rates boost homebuilders, building materials and REITs and free up consumer spending; higher rates cool the sector and ripple into related retail.",
    sectors: ["Real Estate", "Financials", "Consumer Discretionary"],
    stance: "mixed",
  },
  {
    id: "healthcare",
    label: "Healthcare & FDA",
    keywords: ["fda", "drug pricing", "clinical trial", "biotech", "medicare", "medicaid", "pharmaceutical", "drug approval"],
    why: "Healthcare hinges on regulation and trial outcomes. Drug-pricing policy pressures pharma margins, while FDA approvals and trial data move individual biotech and medical-device names sharply.",
    sectors: ["Health Care"],
    stance: "mixed",
  },
  {
    id: "policy",
    label: "Policy & Washington",
    keywords: ["election", "congress", "senate", "white house", "president", "legislation", "regulation", "executive order", "government shutdown", "debt ceiling", "fiscal", "antitrust", "tax cut", "corporate tax", "tariffs", "stimulus", "budget"],
    why: "Policy shifts change the rules for entire industries. Tax, spending, antitrust and regulatory actions can re-rate sectors quickly — healthcare on drug pricing, banks on capital rules, energy on permitting, big tech on antitrust.",
    sectors: ["Health Care", "Financials", "Energy", "Technology"],
    stance: "mixed",
  },
  {
    id: "consumer",
    label: "Consumer & Retail",
    keywords: ["retail sales", "consumer spending", "consumer confidence", "holiday sales", "e-commerce", "same-store"],
    why: "Consumer spending is roughly 70% of US GDP. Strong retail data supports discretionary names and the broad market; weakness signals caution and tends to favor staples over discretionary.",
    sectors: ["Consumer Discretionary", "Consumer Staples"],
    stance: "mixed",
  },
  {
    id: "deals",
    label: "M&A & Earnings",
    keywords: ["merger", "acquisition", "to acquire", "buyout", "takeover", "earnings", "quarterly results", "guidance", "profit warning", "beats estimates", "misses estimates"],
    why: "Deal and earnings news is company-specific: M&A typically lifts the target and pressures the acquirer, while earnings beats/misses and guidance reset expectations for the name and its closest peers.",
    sectors: [],
    stance: "neutral",
  },
];

const FALLBACK: NewsTopic = {
  id: "market",
  label: "Broad Market",
  why: "A general market headline with no single dominant sector driver. It shapes overall sentiment and the macro backdrop rather than moving one industry on its own.",
  sectors: [],
  stance: "neutral",
};

export interface AnalyzedNews {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  topic: NewsTopic;
  watchlistSymbols: string[];
  ageLabel: string;
}

function ageLabel(unixSeconds: number, nowMs: number): string {
  if (!unixSeconds) return "";
  const mins = Math.max(0, Math.round((nowMs - unixSeconds * 1000) / 60000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

function classify(item: NewsItem): NewsTopic {
  const text = ` ${item.headline} ${item.summary} `.toLowerCase();
  for (const t of TOPICS) {
    if (t.keywords.some((k) => text.includes(k))) {
      const { keywords, ...topic } = t;
      void keywords;
      return topic;
    }
  }
  return FALLBACK;
}

/** Classify + personalize a list of news items, newest first, de-duplicated. */
export function analyzeNews(items: NewsItem[], watchlist: string[]): AnalyzedNews[] {
  const now = Date.now();
  const wl = new Set(watchlist.map((s) => s.toUpperCase()));
  const seen = new Set<string>();

  return items
    .filter((n) => {
      const key = n.headline.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.datetime - a.datetime)
    .map((n) => {
      const related = n.related
        .split(/[,;]/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      const watchlistSymbols = related.filter((s) => wl.has(s));
      return {
        id: n.id,
        headline: n.headline,
        summary: n.summary,
        source: n.source,
        url: n.url,
        topic: classify(n),
        watchlistSymbols,
        ageLabel: ageLabel(n.datetime, now),
      };
    });
}
