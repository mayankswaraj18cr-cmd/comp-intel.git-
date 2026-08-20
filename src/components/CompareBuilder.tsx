"use client";

import { useEffect, useMemo, useState } from "react";
import type { CompanyAggregate, LevelBand } from "@/types/compensation";
import { formatLpa } from "@/lib/format";
import BarChart from "@/components/BarChart";

const LEVEL_ORDER: LevelBand[] = ["Entry", "Mid", "Senior", "Staff", "Principal"];
const MAX_SELECTION = 3;

export default function CompareBuilder() {
  const [allCompanies, setAllCompanies] = useState<CompanyAggregate[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparison, setComparison] = useState<CompanyAggregate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((json) => setAllCompanies(json.items))
      .finally(() => setLoadingList(false));
  }, []);

  const toggle = (slug: string) => {
    setSelected((prev) => {
      let next: string[];
      if (prev.includes(slug)) {
        next = prev.filter((s) => s !== slug);
      } else if (prev.length >= MAX_SELECTION) {
        next = prev; // silently caps at 3 — button also disabled
      } else {
        next = [...prev, slug];
      }
      // Clearing stale comparison results on deselect is a direct response
      // to this user interaction, not an effect syncing with fetch — done
      // here rather than in the data-fetching effect below.
      if (next.length < 2) {
        setComparison(null);
        setError(null);
      }
      return next;
    });
  };

  useEffect(() => {
    if (selected.length < 2) return;
    // See CompensationExplorer.tsx for rationale on this documented
    // fetch-on-dependency-change pattern vs. the stricter compiler lint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingCompare(true);
    setError(null);
    fetch(`/api/compare?companies=${selected.join(",")}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((json) => setComparison(json.companies))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingCompare(false));
  }, [selected]);

  const chartData = useMemo(
    () =>
      (comparison ?? []).map((c) => ({
        label: c.name,
        value: c.avgTotalCompLpa,
      })),
    [comparison]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300">
            Select 2–3 companies to compare
          </h2>
          <span className="text-xs text-slate-500">{selected.length}/{MAX_SELECTION} selected</span>
        </div>
        {loadingList ? (
          <div className="text-sm text-slate-500 py-4">Loading companies…</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allCompanies.map((c) => {
              const isSelected = selected.includes(c.slug);
              const disabled = !isSelected && selected.length >= MAX_SELECTION;
              return (
                <button
                  key={c.slug}
                  onClick={() => toggle(c.slug)}
                  disabled={disabled}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 border-emerald-500 font-medium"
                      : disabled
                        ? "border-slate-800 text-slate-600 cursor-not-allowed"
                        : "border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected.length === 1 && (
        <p className="text-sm text-slate-500 text-center py-4">
          Select at least one more company to see a comparison.
        </p>
      )}
      {error && <p className="text-sm text-rose-400 text-center py-4">{error}</p>}
      {loadingCompare && <p className="text-sm text-slate-500 text-center py-4">Comparing…</p>}

      {comparison && comparison.length >= 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Average total compensation</h3>
            <BarChart data={chartData} format="lpa" />
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Metric</th>
                  {comparison.map((c) => (
                    <th key={c.slug} className="px-4 py-3 text-left font-medium text-slate-300">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                <tr>
                  <td className="px-4 py-3 text-slate-400">Industry</td>
                  {comparison.map((c) => (
                    <td key={c.slug} className="px-4 py-3 text-slate-300">
                      {c.industry}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-400">Reports</td>
                  {comparison.map((c) => (
                    <td key={c.slug} className="px-4 py-3 text-slate-300">
                      {c.entryCount}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-400">Avg total comp</td>
                  {comparison.map((c) => (
                    <td key={c.slug} className="px-4 py-3 font-semibold text-emerald-400">
                      {formatLpa(c.avgTotalCompLpa)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-400">Range</td>
                  {comparison.map((c) => (
                    <td key={c.slug} className="px-4 py-3 text-slate-300">
                      {formatLpa(c.minTotalCompLpa)} – {formatLpa(c.maxTotalCompLpa)}
                    </td>
                  ))}
                </tr>
                {LEVEL_ORDER.map((level) => (
                  <tr key={level}>
                    <td className="px-4 py-3 text-slate-400">{level} avg</td>
                    {comparison.map((c) => {
                      const stat = c.levelBreakdown[level];
                      return (
                        <td key={c.slug} className="px-4 py-3 text-slate-300">
                          {stat.count > 0 ? `${formatLpa(stat.avgTotalCompLpa)} (n=${stat.count})` : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
