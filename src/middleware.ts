import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  // OGPクローラーはSupabase認証をスキップ
  const ua = request.headers.get("user-agent") ?? "";
  if (
    ua.includes("facebookexternalhit") ||
    ua.includes("Twitterbot") ||
    ua.includes("Googlebot")
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
