import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompanyBySlug, getEntriesForCompany } from "@/lib/data";
import { formatLpa, formatYoe, LEVEL_BAND_COLOR } from "@/lib/format";
import BarChart from "@/components/BarChart";

const LEVEL_ORDER = ["Entry", "Mid", "Senior", "Staff", "Principal"] as const;

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const entries = getEntriesForCompany(slug).sort((a, b) => b.totalCompLpa - a.totalCompLpa);

  const chartData = LEVEL_ORDER.filter((l) => company.levelBreakdown[l].count > 0).map((l) => ({
    label: l,
    value: company.levelBreakdown[l].avgTotalCompLpa,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <Link href="/companies" className="text-xs text-slate-500 hover:text-slate-300">
          ← All companies
        </Link>
        <div className="mt-2 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xl text-emerald-400">
              {company.logoInitial}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">{company.name}</h1>
              <p className="text-sm text-slate-500">{company.industry}</p>
            </div>
          </div>
          <Link
            href={`/compare?companies=${company.slug}`}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-white transition-colors"
          >
            Add to comparison
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-slate-500">Average total comp</div>
          <div className="text-xl font-semibold text-emerald-400 mt-1">{formatLpa(company.avgTotalCompLpa)}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-slate-500">Range</div>
          <div className="text-xl font-semibold text-slate-100 mt-1">
            {formatLpa(company.minTotalCompLpa)} – {formatLpa(company.maxTotalCompLpa)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-slate-500">Reports</div>
          <div className="text-xl font-semibold text-slate-100 mt-1">{company.entryCount}</div>
        </div>
      </div>

      {/* Level breakdown chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-sm font-medium text-slate-300 mb-4">Average total comp by level</h2>
        <BarChart data={chartData} format="lpa" />
      </div>

      {/* Entries table */}
      <div>
        <h2 className="text-sm font-medium text-slate-300 mb-3">All reports ({entries.length})</h2>
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr className="text-xs">
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Level</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">YOE</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Base</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Bonus</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{entry.role}</td>
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
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {entry.bonusLpa > 0 ? formatLpa(entry.bonusLpa) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {entry.stockLpa > 0 ? formatLpa(entry.stockLpa) : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400 whitespace-nowrap">
                      {formatLpa(entry.totalCompLpa)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
