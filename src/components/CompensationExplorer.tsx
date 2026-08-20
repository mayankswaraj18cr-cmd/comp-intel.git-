"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CompensationEntry, LevelBand, RoleFamily } from "@/types/compensation";
import { formatLpa, formatYoe, LEVEL_BAND_COLOR } from "@/lib/format";

interface ApiResponse {
  items: CompensationEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const ROLE_OPTIONS: (RoleFamily | "all")[] = ["all", "Software Engineer", "Data Scientist", "Product Manager"];
const LEVEL_OPTIONS: (LevelBand | "all")[] = ["all", "Entry", "Mid", "Senior", "Staff", "Principal"];
const LOCATION_OPTIONS = ["all", "Bangalore", "Hyderabad", "Pune", "Gurgaon", "Mumbai", "Remote (India)"];

type SortKey = "totalCompLpa" | "baseSalaryLpa" | "yearsOfExperience";

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function SortHeader({
  label,
  sortKey,
  activeSortBy,
  sortDir,
  onToggle,
}: {
  label: string;
  sortKey: SortKey;
  activeSortBy: SortKey;
  sortDir: "asc" | "desc";
  onToggle: (key: SortKey) => void;
}) {
  return (
    <button
      onClick={() => onToggle(sortKey)}
      className="flex items-center gap-1 text-left font-medium text-slate-300 hover:text-white transition-colors"
    >
      {label}
      <span className="text-[10px] text-slate-500 w-2.5 inline-block">
        {activeSortBy === sortKey ? (sortDir === "asc" ? "▲" : "▼") : ""}
      </span>
    </button>
  );
}

export default function CompensationExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [company, setCompany] = useState(searchParams.get("company") ?? "");
  const [role, setRole] = useState<(RoleFamily | "all")>((searchParams.get("role") as RoleFamily) ?? "all");
  const [levelBand, setLevelBand] = useState<(LevelBand | "all")>(
    (searchParams.get("levelBand") as LevelBand) ?? "all"
  );
  const [location, setLocation] = useState(searchParams.get("location") ?? "all");
  const [sortBy, setSortBy] = useState<SortKey>((searchParams.get("sortBy") as SortKey) ?? "totalCompLpa");
  const [sortDir, setSortDir] = useState<"asc" | "desc">((searchParams.get("sortDir") as "asc" | "desc") ?? "desc");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedCompany = useDebounced(company, 300);

  // Reset to page 1 whenever a filter (not page/sort) changes. Done as a
  // render-time state adjustment (React's documented pattern for "resetting
  // state when inputs change") rather than a useEffect, so it doesn't cause
  // an extra render pass.
  const filterKey = `${debouncedCompany}|${role}|${levelBand}|${location}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedCompany) params.set("company", debouncedCompany);
    if (role !== "all") params.set("role", role);
    if (levelBand !== "all") params.set("levelBand", levelBand);
    if (location !== "all") params.set("location", location);
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    params.set("page", String(page));
    params.set("pageSize", "15");
    return params.toString();
  }, [debouncedCompany, role, levelBand, location, sortBy, sortDir, page]);

  useEffect(() => {
    let cancelled = false;
    // Data-fetching-on-dependency-change is the one case React's own docs
    // use this exact setState-then-fetch-then-setState shape for (effects
    // synchronize with an external system — the API — not other React
    // state). The stricter compiler-oriented lint rule flags it anyway;
    // disabled here deliberately rather than restructured, since the
    // alternative (a reducer + AbortController wrapper) adds indirection
    // without changing behavior.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/compensation?${queryString}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((json: ApiResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load compensation data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // Keep the URL shareable/bookmarkable without a full navigation.
    router.replace(`/?${queryString}`, { scroll: false });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortBy === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(key);
        setSortDir("desc");
      }
    },
    [sortBy]
  );

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Search company (e.g. Google, Flipkart)"
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleFamily | "all")}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All roles" : r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Level</label>
          <select
            value={levelBand}
            onChange={(e) => setLevelBand(e.target.value as LevelBand | "all")}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {LEVEL_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l === "all" ? "All levels" : l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {LOCATION_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l === "all" ? "All locations" : l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result meta */}
      <div className="flex items-center justify-between text-sm text-slate-400 px-1">
        <span>
          {loading ? "Loading…" : error ? "—" : `${data?.total ?? 0} results`}
        </span>
        {data && data.totalPages > 1 && (
          <span>
            Page {data.page} of {data.totalPages}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr className="text-xs">
                <th className="px-4 py-3 text-left font-medium text-slate-300">Company</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Level</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Location</th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="YOE" sortKey="yearsOfExperience" activeSortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Base" sortKey="baseSalaryLpa" activeSortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Total Comp" sortKey="totalCompLpa" activeSortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {error && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-rose-400">
                    {error}
                  </td>
                </tr>
              )}
              {!error && loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Loading compensation data…
                  </td>
                </tr>
              )}
              {!error && !loading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No results match these filters. Try widening your search.
                  </td>
                </tr>
              )}
              {!error &&
                !loading &&
                data?.items.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">
                      {entry.companyName}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{entry.role}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${LEVEL_BAND_COLOR[entry.levelBand]}`}
                      >
                        {entry.levelLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{entry.location}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatYoe(entry.yearsOfExperience)}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatLpa(entry.baseSalaryLpa)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400 whitespace-nowrap">
                      {formatLpa(entry.totalCompLpa)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-800 text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 px-2">
            {data.page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-800 text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
