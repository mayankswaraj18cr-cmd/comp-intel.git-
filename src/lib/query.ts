import type { CompensationEntry, CompensationFilters } from "@/types/compensation";
import { getAllEntries } from "@/lib/data";

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function queryCompensation(filters: CompensationFilters): PagedResult<CompensationEntry> {
  let results = getAllEntries();

  if (filters.company) {
    const q = filters.company.toLowerCase();
    results = results.filter((e) => e.companyName.toLowerCase().includes(q));
  }
  if (filters.role && filters.role !== "all") {
    results = results.filter((e) => e.role === filters.role);
  }
  if (filters.levelBand && filters.levelBand !== "all") {
    results = results.filter((e) => e.levelBand === filters.levelBand);
  }
  if (filters.location && filters.location !== "all") {
    results = results.filter((e) => e.location === filters.location);
  }
  if (typeof filters.minComp === "number") {
    results = results.filter((e) => e.totalCompLpa >= filters.minComp!);
  }
  if (typeof filters.maxComp === "number") {
    results = results.filter((e) => e.totalCompLpa <= filters.maxComp!);
  }

  const sortBy = filters.sortBy ?? "totalCompLpa";
  const sortDir = filters.sortDir ?? "desc";
  results = [...results].sort((a, b) => {
    const diff = a[sortBy] - b[sortBy];
    return sortDir === "asc" ? diff : -diff;
  });

  const total = results.length;
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const start = (page - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

/** Parses query-string values into a typed CompensationFilters object,
 * rejecting malformed numeric params instead of silently NaN-ing them. */
export function parseFiltersFromSearchParams(sp: URLSearchParams): CompensationFilters {
  const num = (key: string): number | undefined => {
    const v = sp.get(key);
    if (v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    company: sp.get("company") ?? undefined,
    role: (sp.get("role") as CompensationFilters["role"]) ?? "all",
    levelBand: (sp.get("levelBand") as CompensationFilters["levelBand"]) ?? "all",
    location: sp.get("location") ?? "all",
    minComp: num("minComp"),
    maxComp: num("maxComp"),
    sortBy: (sp.get("sortBy") as CompensationFilters["sortBy"]) ?? "totalCompLpa",
    sortDir: (sp.get("sortDir") as CompensationFilters["sortDir"]) ?? "desc",
    page: num("page") ?? 1,
    pageSize: num("pageSize") ?? 20,
  };
}
