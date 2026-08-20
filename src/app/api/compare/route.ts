import { NextRequest, NextResponse } from "next/server";
import { getCompanyBySlug } from "@/lib/data";

export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get("companies") ?? "";
  const slugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugs.length < 2) {
    return NextResponse.json(
      { error: "Provide at least 2 company slugs via ?companies=a,b" },
      { status: 400 }
    );
  }
  if (slugs.length > 3) {
    return NextResponse.json(
      { error: "Comparison supports a maximum of 3 companies at once" },
      { status: 400 }
    );
  }

  const companies = slugs.map((slug) => getCompanyBySlug(slug)).filter(Boolean);
  const missing = slugs.filter((slug, i) => !companies[i]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Unknown company slug(s): ${missing.join(", ")}` },
      { status: 404 }
    );
  }

  return NextResponse.json({ companies });
}
