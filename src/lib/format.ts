export function formatLpa(value: number): string {
  return `₹${value.toFixed(1)}L`;
}

export function formatYoe(value: number): string {
  return `${value.toFixed(1)} yrs`;
}

export const LEVEL_BAND_COLOR: Record<string, string> = {
  Entry: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Mid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Senior: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Staff: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  Principal: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};
