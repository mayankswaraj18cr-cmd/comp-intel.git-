import { NextRequest, NextResponse } from "next/server";
import { getCompanyBySlug, getEntriesForCompany } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) {
    return NextResponse.json({ error: `No company found for slug '${slug}'` }, { status: 404 });
  }
  const entries = getEntriesForCompany(slug).sort((a, b) => b.totalCompLpa - a.totalCompLpa);
  return NextResponse.json({ company, entries });
}
