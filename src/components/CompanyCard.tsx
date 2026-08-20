import Link from "next/link";
import type { CompanyAggregate } from "@/types/compensation";
import { formatLpa } from "@/lib/format";

export default function CompanyCard({ company }: { company: CompanyAggregate }) {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group block rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/50 hover:bg-slate-900 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-emerald-400 group-hover:bg-emerald-500/10">
            {company.logoInitial}
          </div>
          <div>
            <div className="font-semibold text-slate-100">{company.name}</div>
            <div className="text-xs text-slate-500">{company.industry}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-emerald-400">{formatLpa(company.avgTotalCompLpa)}</div>
          <div className="text-[11px] text-slate-500">avg total comp</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{company.entryCount} reports</span>
        <span>
          {formatLpa(company.minTotalCompLpa)} – {formatLpa(company.maxTotalCompLpa)}
        </span>
      </div>
    </Link>
  );
}
