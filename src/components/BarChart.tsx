"use client";

interface BarChartDatum {
  label: string;
  value: number;
  colorClass?: string;
}

interface BarChartProps {
  data: BarChartDatum[];
  /** "lpa" formats values as ₹XX.XL. Kept as a string flag (not a function
   * prop) so this component can be rendered from Server Components too —
   * functions can't cross the server/client boundary as props. */
  format?: "lpa" | "raw";
  height?: number;
}

function formatValue(value: number, format: "lpa" | "raw"): string {
  return format === "lpa" ? `₹${value.toFixed(1)}L` : String(value);
}

/** Minimal dependency-free bar chart. Chosen deliberately over pulling in a
 * charting library for a handful of small visualizations — keeps the bundle
 * lean and the rendering fully predictable/testable as plain SVG. */
export default function BarChart({ data, format = "raw", height = 220 }: BarChartProps) {
  if (data.length === 0) {
    return <div className="text-sm text-slate-500 py-8 text-center">No data to display.</div>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 40);
          const x = i * barWidth;
          const y = height - 24 - barHeight;
          return (
            <g key={d.label}>
              <rect
                x={x + barWidth * 0.15}
                y={y}
                width={barWidth * 0.7}
                height={barHeight}
                rx={1.5}
                className={d.colorClass ?? "fill-emerald-500"}
              />
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="4"
                className="fill-slate-300"
              >
                {formatValue(d.value, format)}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="4"
                className="fill-slate-500"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
