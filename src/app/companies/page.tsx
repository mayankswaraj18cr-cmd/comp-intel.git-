import Link from "next/link";
import { getCompanyAggregates } from "@/lib/data";
import CompanyCard from "@/components/CompanyCard";

export default function CompaniesPage() {
  const companies = getCompanyAggregates();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Companies</h1>
          <p className="text-slate-400 text-sm mt-1">{companies.length} companies with reported compensation data.</p>
        </div>
        <Link
          href="/compare"
          className="text-sm px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400 transition-colors"
        >
          Compare companies →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((c) => (
          <CompanyCard key={c.slug} company={c} />
        ))}
      </div>
    </div>
  );
}
