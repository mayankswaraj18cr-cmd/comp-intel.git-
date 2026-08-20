import CompareBuilder from "@/components/CompareBuilder";

export default function ComparePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Compare Companies</h1>
        <p className="text-slate-400 text-sm mt-1">
          Pick 2–3 companies to compare average compensation and level-by-level breakdowns side by side.
        </p>
      </div>
      <CompareBuilder />
    </div>
  );
}
