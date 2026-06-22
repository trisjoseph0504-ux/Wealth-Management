/**
 * News impact analysis (rules-based). Classifies a real news headline into a
 * macro/sector topic by keyword and attaches a written explanation of the
 * transmission mechanism — which sectors it moves and WHY — plus a market stance.
 * Each topic carries several explanation variants; one is chosen deterministically
 * per article (hashed from the headline) so a feed of same-topic stories doesn't
 * repeat the identical sentence. Watchlist matches are flagged.
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

interface TopicDef {
  id: string;
  label: string;
  sectors: string[];
  stance: Stance;
  keywords: string[];
  whys: string[];
}

// Order matters: more specific topics first so they win over broad ones.
const TOPICS: TopicDef[] = [
  {
    id: "ai-semis",
    label: "AI & Semiconductors",
    sectors: ["Technology", "Communication"],
    stance: "risk-on",
    keywords: ["artificial intelligence", " ai ", "ai chip", "ai demand", "semiconductor", "chipmaker", "nvidia", "gpu", "data center", "openai", "datacenter"],
    whys: [
      "AI capital spending is the dominant earnings driver for chipmakers and cloud providers right now. Strong demand signals lift the whole supply chain — chips, networking, power — while any hint of a spending slowdown hits hardest given how richly the group is valued.",
      "This feeds the market's biggest swing factor: the durability of AI infrastructure spend. Hyperscalers' capex flows straight to semis and data-center suppliers, so the read-through extends well beyond the single name in the headline.",
      "Because mega-cap tech now drives a large share of index earnings, AI demand shifts move the broad market, not just chips. Watch the second-order beneficiaries too — power, cooling, and memory.",
    ],
  },
  {
    id: "crypto",
    label: "Crypto & Digital Assets",
    sectors: ["Digital Assets", "Financials"],
    stance: "risk-on",
    keywords: ["bitcoin", "crypto", "ethereum", "digital asset", "btc", "blockchain", "stablecoin", "coinbase"],
    whys: [
      "Crypto trades as a high-beta risk asset tied to liquidity and rate expectations. Big moves spill into exchanges, miners, and the financials with crypto exposure.",
      "Regulatory and adoption headlines reprice the entire digital-asset complex quickly. Watch it as a real-time gauge of risk appetite across the market.",
    ],
  },
  {
    id: "geopolitics",
    label: "Geopolitics & Conflict",
    sectors: ["Energy", "Industrials"],
    stance: "risk-off",
    keywords: ["war", "invasion", "missile", "military", "geopolit", "middle east", "ukraine", "taiwan", "conflict", "ceasefire", "sanction"],
    whys: [
      "Geopolitical shocks trigger risk-off rotations: oil and defense names tend to rally on supply and security fears while broad equities and travel fall on uncertainty.",
      "Escalation pressures global supply chains and energy prices; de-escalation reverses it. Markets price the tail risk quickly, so volatility often spikes regardless of the eventual outcome.",
    ],
  },
  {
    id: "tariffs",
    label: "Tariffs & Trade",
    sectors: ["Industrials", "Technology", "Consumer Discretionary", "Materials"],
    stance: "risk-off",
    keywords: ["tariff", "trade war", "trade deal", "import duty", "export control", "customs", "trade policy"],
    whys: [
      "Tariffs raise input costs and scramble supply chains. Import-reliant manufacturers, autos, retailers, and multinational tech face margin pressure, while some domestic producers gain.",
      "Trade barriers hit globally-exposed earnings first and can invite retaliation. The market reads them as a tax on growth, so cyclicals and exporters carry the most risk.",
    ],
  },
  {
    id: "rates",
    label: "Interest Rates & the Fed",
    sectors: ["Technology", "Real Estate", "Utilities", "Financials"],
    stance: "mixed",
    keywords: ["federal reserve", "the fed", "interest rate", "rate cut", "rate hike", "fomc", "powell", "monetary policy", "basis point", "rate decision", "yield"],
    whys: [
      "Rate moves reprice everything. Lower rates lift long-duration assets — tech, real estate, utilities — but squeeze bank margins; higher rates do the reverse and pressure richly-valued stocks.",
      "This shifts the discount rate on future earnings, so it hits the most growth-tilted, longest-duration names hardest. Bonds and rate-sensitive sectors move first.",
      "The path of Fed policy sets the cost of capital across the economy. Even hints about the timing of cuts or hikes can re-rate financials, housing, and growth in opposite directions.",
    ],
  },
  {
    id: "inflation",
    label: "Inflation",
    sectors: ["Consumer Staples", "Technology", "Fixed Income"],
    stance: "mixed",
    keywords: ["inflation", "cpi", "ppi", "consumer price", "core price", "disinflation", "deflation", "pce"],
    whys: [
      "Inflation data drives rate expectations. A hot print pushes yields up and pressures growth stocks and bonds; a cool one supports risk assets and raises the odds of cuts.",
      "Prices feed straight into Fed policy and real consumer spending power. Companies with pricing power and staples hold up better when inflation runs hot.",
    ],
  },
  {
    id: "jobs",
    label: "Jobs & Labor Market",
    sectors: ["Consumer Discretionary", "Financials"],
    stance: "mixed",
    keywords: ["jobs report", "payroll", "nonfarm", "unemployment", "jobless claims", "labor market", "wage growth", "hiring", "layoff"],
    whys: [
      "The labor market shapes both Fed policy and consumer strength. A strong report supports earnings but can delay rate cuts; a weak one stokes recession worry but boosts cut odds.",
      "Wages and hiring drive roughly two-thirds of the economy through consumer spending — and they're a key input the Fed watches when setting rates.",
    ],
  },
  {
    id: "energy",
    label: "Oil & Energy",
    sectors: ["Energy", "Industrials", "Consumer Discretionary"],
    stance: "mixed",
    keywords: ["oil price", "crude", "opec", "brent", "wti", "natural gas", "gasoline", "energy price", "barrel"],
    whys: [
      "Energy prices flow through the whole economy. Higher oil lifts producers but taxes consumers and raises costs for transports and manufacturers; lower oil eases inflation.",
      "Crude is both an inflation input and a demand signal. Supply-driven spikes hurt consumers; demand-driven moves say something about global growth.",
    ],
  },
  {
    id: "housing",
    label: "Housing & Real Estate",
    sectors: ["Real Estate", "Financials", "Consumer Discretionary"],
    stance: "mixed",
    keywords: ["housing", "mortgage rate", "home sales", "homebuilder", "real estate", "existing home", "new home"],
    whys: [
      "Housing is highly rate-sensitive. Lower mortgage rates boost homebuilders, building materials, and REITs and free up consumer spending; higher rates cool the sector.",
      "Home activity ripples into furniture, appliances, renovation, and bank lending — so housing data reads as a broad signal on the rate-sensitive consumer.",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare & FDA",
    sectors: ["Health Care"],
    stance: "mixed",
    keywords: ["fda", "drug pricing", "clinical trial", "biotech", "medicare", "medicaid", "pharmaceutical", "drug approval"],
    whys: [
      "Healthcare hinges on regulation and trial outcomes. Drug-pricing policy pressures pharma margins, while approvals and trial data move individual biotech and device names sharply.",
      "Binary catalysts — an FDA decision, trial readout, or pricing rule — can re-rate a name overnight and ripple to its peers and suppliers.",
    ],
  },
  {
    id: "policy",
    label: "Policy & Washington",
    sectors: ["Health Care", "Financials", "Energy", "Technology"],
    stance: "mixed",
    keywords: ["election", "congress", "senate", "white house", "president", "legislation", "regulation", "executive order", "government shutdown", "debt ceiling", "fiscal", "antitrust", "tax cut", "corporate tax", "tariffs", "stimulus", "budget"],
    whys: [
      "Policy shifts change the rules for whole industries. Tax, spending, antitrust, and regulatory actions can re-rate sectors fast — healthcare on drug pricing, banks on capital rules, energy on permitting, big tech on antitrust.",
      "Washington sets the operating backdrop: corporate tax rates flow to after-tax earnings, regulation reshapes margins, and fiscal decisions move growth and rates.",
      "Markets price political outcomes through a sector lens — which industries get tailwinds (subsidies, deregulation) versus headwinds (taxes, antitrust, price caps).",
    ],
  },
  {
    id: "consumer",
    label: "Consumer & Retail",
    sectors: ["Consumer Discretionary", "Consumer Staples"],
    stance: "mixed",
    keywords: ["retail sales", "consumer spending", "consumer confidence", "holiday sales", "e-commerce", "same-store"],
    whys: [
      "Consumer spending is roughly 70% of US GDP. Strong data supports discretionary names and the broad market; weakness favors staples over discretionary.",
      "The health of the consumer is the market's pulse check on growth — and a key swing factor for retailers, restaurants, and travel.",
    ],
  },
  {
    id: "deals",
    label: "M&A & Earnings",
    sectors: [],
    stance: "neutral",
    keywords: ["merger", "acquisition", "to acquire", "buyout", "takeover", "earnings", "quarterly results", "guidance", "profit warning", "beats estimates", "misses estimates"],
    whys: [
      "Deal and earnings news is company-specific: M&A usually lifts the target and pressures the acquirer, while beats, misses, and guidance reset expectations for the name and its peers.",
      "Results and deals are the clearest signal on a company's fundamentals — and guidance often matters more than the quarter itself, since it resets the forward estimates the stock trades on.",
    ],
  },
];

const FALLBACK: TopicDef = {
  id: "market",
  label: "Broad Market",
  sectors: [],
  stance: "neutral",
  keywords: [],
  whys: [
    "A general market headline with no single dominant sector driver. It shapes overall sentiment and the macro backdrop rather than moving one industry on its own.",
    "This is broad-tape context rather than a single-sector catalyst — useful for gauging risk appetite, but not a reason to act on any one holding.",
  ],
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

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
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
  const def = TOPICS.find((t) => t.keywords.some((k) => text.includes(k))) ?? FALLBACK;
  const why = def.whys[hashStr(item.headline) % def.whys.length]!;
  return { id: def.id, label: def.label, sectors: def.sectors, stance: def.stance, why };
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
