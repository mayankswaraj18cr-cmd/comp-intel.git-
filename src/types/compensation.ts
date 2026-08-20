// Core domain model. "Levels matter more than job titles" (spec core
// principle) — CompensationEntry is keyed around (company, role family,
// level, location), not a raw job title string, so a Google L5 and a
// Meta E5 can be compared on standardized level band rather than title.

export type RoleFamily = "Software Engineer" | "Data Scientist" | "Product Manager";

export type LevelBand = "Entry" | "Mid" | "Senior" | "Staff" | "Principal";

export interface CompensationEntry {
  id: string;
  companySlug: string;
  companyName: string; // raw, pre-normalization display name as submitted
  role: RoleFamily;
  levelBand: LevelBand;
  levelLabel: string; // company-specific label, e.g. "L5", "SDE-3", "E5"
  location: string;
  yearsOfExperience: number;
  baseSalaryLpa: number; // lakhs per annum (INR), base only
  bonusLpa: number; // defaults to 0 if not reported
  stockLpa: number; // annualized, defaults to 0 if not reported
  totalCompLpa: number; // derived: base + bonus + stock
  source: "self-reported" | "estimated";
}

export interface CompanyAggregate {
  slug: string;
  name: string;
  logoInitial: string;
  industry: string;
  entryCount: number;
  avgTotalCompLpa: number;
  minTotalCompLpa: number;
  maxTotalCompLpa: number;
  levelBreakdown: Record<LevelBand, { count: number; avgTotalCompLpa: number }>;
}

export interface CompensationFilters {
  company?: string;
  role?: RoleFamily | "all";
  levelBand?: LevelBand | "all";
  location?: string | "all";
  minComp?: number;
  maxComp?: number;
  sortBy?: "totalCompLpa" | "baseSalaryLpa" | "yearsOfExperience";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
