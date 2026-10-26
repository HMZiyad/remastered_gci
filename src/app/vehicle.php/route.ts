import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  if (slug) {
    return NextResponse.redirect(new URL(`/vehicles/${slug}`, request.url));
  }
  return NextResponse.redirect(new URL("/inventory", request.url));
}
