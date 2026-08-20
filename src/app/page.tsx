import { Suspense } from "react";
import CompensationExplorer from "@/components/CompensationExplorer";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Compensation Explorer
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Search and filter real-shaped compensation reports by role, level band, and location.
        </p>
      </div>
      <Suspense fallback={<div className="text-slate-500 text-sm">Loading…</div>}>
        <CompensationExplorer />
      </Suspense>
    </div>
  );
}
