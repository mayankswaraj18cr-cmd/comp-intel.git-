import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-white">Company not found</h1>
      <p className="text-slate-400 text-sm mt-2">
        We don&apos;t have compensation data for that company yet.
      </p>
      <Link
        href="/companies"
        className="inline-block mt-6 text-sm px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400 transition-colors"
      >
        Back to companies
      </Link>
    </div>
  );
}
