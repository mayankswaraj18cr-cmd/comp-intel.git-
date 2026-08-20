import { NextRequest, NextResponse } from "next/server";
import { queryCompensation } from "@/lib/query";
import { parseFiltersFromSearchParams } from "@/lib/query";

export async function GET(request: NextRequest) {
  const filters = parseFiltersFromSearchParams(request.nextUrl.searchParams);
  const result = queryCompensation(filters);
  return NextResponse.json(result);
}
