import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/config";

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    // Dev mode: no auth gating; everything runs as the dev user.
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets and images.
    "/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
