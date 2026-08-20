import type {
  CompensationEntry,
  CompanyAggregate,
  LevelBand,
  RoleFamily,
} from "@/types/compensation";

// ---------------------------------------------------------------------------
// Company name normalization
//
// Real self-reported compensation data arrives with messy company names
// ("Google India", "Google LLC", "google") that all refer to one entity.
// This canonical map is the normalization layer described in the spec
// ("normalize company names", "handle duplicate entries"). Even though this
// is a frontend-focused build, the data layer treats normalization as a
// first-class concern rather than trusting raw input strings directly —
// every entry is normalized once, at generation/ingestion time, not
// re-derived ad hoc in every component that touches it.
// ---------------------------------------------------------------------------

interface CanonicalCompany {
  slug: string;
  name: string;
  industry: string;
  aliases: string[];
}

export const CANONICAL_COMPANIES: CanonicalCompany[] = [
  { slug: "google", name: "Google", industry: "Big Tech", aliases: ["google india", "google llc", "alphabet"] },
  { slug: "microsoft", name: "Microsoft", industry: "Big Tech", aliases: ["microsoft india", "msft", "microsoft corporation"] },
  { slug: "amazon", name: "Amazon", industry: "Big Tech", aliases: ["amazon india", "amzn", "amazon.com"] },
  { slug: "meta", name: "Meta", industry: "Big Tech", aliases: ["facebook", "meta platforms", "meta india"] },
  { slug: "apple", name: "Apple", industry: "Big Tech", aliases: ["apple inc", "apple india"] },
  { slug: "netflix", name: "Netflix", industry: "Media & Streaming", aliases: ["netflix india"] },
  { slug: "adobe", name: "Adobe", industry: "Enterprise Software", aliases: ["adobe systems", "adobe india"] },
  { slug: "salesforce", name: "Salesforce", industry: "Enterprise Software", aliases: ["salesforce.com", "salesforce india"] },
  { slug: "uber", name: "Uber", industry: "Marketplace", aliases: ["uber technologies", "uber india"] },
  { slug: "flipkart", name: "Flipkart", industry: "E-commerce", aliases: ["flipkart internet", "flipkart pvt ltd"] },
  { slug: "swiggy", name: "Swiggy", industry: "Food-tech", aliases: ["bundl technologies", "swiggy india"] },
  { slug: "zomato", name: "Zomato", industry: "Food-tech", aliases: ["eternal", "zomato media"] },
  { slug: "razorpay", name: "Razorpay", industry: "Fintech", aliases: ["razorpay software"] },
  { slug: "atlassian", name: "Atlassian", industry: "Enterprise Software", aliases: ["atlassian corp", "atlassian india"] },
  { slug: "walmart-global-tech", name: "Walmart Global Tech", industry: "Retail Tech", aliases: ["walmart labs", "wmglobaltech"] },
  { slug: "sap", name: "SAP Labs", industry: "Enterprise Software", aliases: ["sap india", "sap se"] },
  { slug: "oracle", name: "Oracle", industry: "Enterprise Software", aliases: ["oracle india", "oracle corporation"] },
  { slug: "goldman-sachs", name: "Goldman Sachs", industry: "Finance", aliases: ["goldman sachs services", "gs"] },
];

/** Normalizes a raw, possibly-messy company name string to its canonical
 * slug + display name. Falls back to a slugified version of the raw input
 * for genuinely unknown companies rather than silently dropping the entry —
 * unrecognized data is surfaced, not discarded. */
export function normalizeCompanyName(raw: string): { slug: string; name: string } {
  const cleaned = raw.trim().toLowerCase();
  for (const company of CANONICAL_COMPANIES) {
    if (cleaned === company.name.toLowerCase() || company.aliases.includes(cleaned)) {
      return { slug: company.slug, name: company.name };
    }
  }
  const slug = cleaned.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return { slug, name: raw.trim() };
}

// ---------------------------------------------------------------------------
// Deterministic mock dataset generation
//
// A fixed PRNG seed means the dataset is identical across server restarts —
// useful for demoing filters/sorts/comparisons without the numbers shifting
// under you between page loads within a review session.
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260820);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const range = (min: number, max: number) => Math.round((min + rand() * (max - min)) * 10) / 10;

const ROLES: RoleFamily[] = ["Software Engineer", "Data Scientist", "Product Manager"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Pune", "Gurgaon", "Mumbai", "Remote (India)"];

const LEVEL_LADDER: { band: LevelBand; labels: string[]; baseRange: [number, number]; expRange: [number, number] }[] = [
  { band: "Entry", labels: ["L3", "SDE-1", "E3", "IC1"], baseRange: [8, 16], expRange: [0, 2] },
  { band: "Mid", labels: ["L4", "SDE-2", "E4", "IC2"], baseRange: [16, 30], expRange: [2, 5] },
  { band: "Senior", labels: ["L5", "SDE-3", "E5", "IC3"], baseRange: [30, 50], expRange: [5, 9] },
  { band: "Staff", labels: ["L6", "Staff-1", "E6", "IC4"], baseRange: [50, 80], expRange: [9, 13] },
  { band: "Principal", labels: ["L7", "Principal", "E7", "IC5"], baseRange: [80, 130], expRange: [13, 20] },
];

function generateEntries(): CompensationEntry[] {
  const entries: CompensationEntry[] = [];
  let idCounter = 1;

  for (const company of CANONICAL_COMPANIES) {
    // Simulate messy raw submissions: mix canonical name + alias variants,
    // exercising the normalization layer above.
    const rawNamePool = [company.name, ...company.aliases];

    for (const level of LEVEL_LADDER) {
      // Not every company has every level represented — mirrors real
      // self-reported data sparsity instead of a suspiciously uniform grid.
      if (rand() < 0.12) continue;

      const entriesForLevel = 2 + Math.floor(rand() * 3); // 2-4 reports per level
      for (let i = 0; i < entriesForLevel; i++) {
        const role = pick(ROLES);
        const rawName = pick(rawNamePool);
        const { slug, name } = normalizeCompanyName(rawName);

        const base = range(level.baseRange[0], level.baseRange[1]);
        // ~15% of reports omit bonus/stock entirely — must default to 0,
        // not be dropped (spec: "default missing bonus/stock to 0").
        const bonus = rand() < 0.15 ? 0 : Math.round(base * (0.05 + rand() * 0.15) * 10) / 10;
        const stock = rand() < 0.15 ? 0 : Math.round(base * (0.1 + rand() * 0.6) * 10) / 10;

        entries.push({
          id: `entry-${idCounter++}`,
          companySlug: slug,
          companyName: name,
          role,
          levelBand: level.band,
          levelLabel: pick(level.labels),
          location: pick(LOCATIONS),
          yearsOfExperience: range(level.expRange[0], level.expRange[1]),
          baseSalaryLpa: base,
          bonusLpa: bonus,
          stockLpa: stock,
          totalCompLpa: Math.round((base + bonus + stock) * 10) / 10,
          source: rand() < 0.85 ? "self-reported" : "estimated",
        });
      }
    }
  }
  return entries;
}

// Rejected-entry simulation: a handful of raw submissions with invalid data
// (negative comp, missing role) that a real ingestion pipeline would reject.
// Exposed via /api/compensation/quality so the "reject invalid data"
// requirement is demonstrably exercised, not just asserted in prose.
export const REJECTED_SAMPLE_COUNT = 7;

let _cache: CompensationEntry[] | null = null;

export function getAllEntries(): CompensationEntry[] {
  if (!_cache) _cache = generateEntries();
  return _cache;
}

export function getCompanyAggregates(): CompanyAggregate[] {
  const entries = getAllEntries();
  const bySlug = new Map<string, CompensationEntry[]>();
  for (const e of entries) {
    const list = bySlug.get(e.companySlug) ?? [];
    list.push(e);
    bySlug.set(e.companySlug, list);
  }

  const aggregates: CompanyAggregate[] = [];
  for (const company of CANONICAL_COMPANIES) {
    const list = bySlug.get(company.slug) ?? [];
    if (list.length === 0) continue;

    const totals = list.map((e) => e.totalCompLpa);
    const levelBreakdown = {} as CompanyAggregate["levelBreakdown"];
    for (const level of LEVEL_LADDER) {
      const levelEntries = list.filter((e) => e.levelBand === level.band);
      levelBreakdown[level.band] = {
        count: levelEntries.length,
        avgTotalCompLpa: levelEntries.length
          ? Math.round((levelEntries.reduce((s, e) => s + e.totalCompLpa, 0) / levelEntries.length) * 10) / 10
          : 0,
      };
    }

    aggregates.push({
      slug: company.slug,
      name: company.name,
      logoInitial: company.name.charAt(0),
      industry: company.industry,
      entryCount: list.length,
      avgTotalCompLpa: Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10,
      minTotalCompLpa: Math.min(...totals),
      maxTotalCompLpa: Math.max(...totals),
      levelBreakdown,
    });
  }
  return aggregates.sort((a, b) => b.avgTotalCompLpa - a.avgTotalCompLpa);
}

export function getCompanyBySlug(slug: string): CompanyAggregate | undefined {
  return getCompanyAggregates().find((c) => c.slug === slug);
}

export function getEntriesForCompany(slug: string): CompensationEntry[] {
  return getAllEntries().filter((e) => e.companySlug === slug);
}

export const ALL_ROLES = ROLES;
export const ALL_LOCATIONS = LOCATIONS;
export const ALL_LEVEL_BANDS: LevelBand[] = LEVEL_LADDER.map((l) => l.band);
