import { NextRequest, NextResponse } from "next/server";
import { getCompanyAggregates } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  let companies = getCompanyAggregates();
  if (q) {
    companies = companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    );
  }
  return NextResponse.json({ items: companies, total: companies.length });
}
