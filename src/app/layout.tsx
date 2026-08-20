import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompIntel — Compensation Intelligence",
  description: "Compare compensation by level, role, and location — not just job title.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-slate-950 text-sm font-bold">
                C
              </span>
              CompIntel
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Explorer
              </Link>
              <Link
                href="/companies"
                className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Companies
              </Link>
              <Link
                href="/compare"
                className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Compare
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-xs text-slate-500">
            CompIntel is a demo MVP built on generated sample data — not real
            submitted compensation. Levels matter more than job titles.
          </div>
        </footer>
      </body>
    </html>
  );
}
