import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/config";

const CANONICAL_HOST = "www.closerclinic.app";
const LEGACY_HOST = "closer-clinic.vercel.app";

export async function middleware(request: NextRequest) {
  // The pre-domain address keeps working but lands on the real one.
  if (request.nextUrl.hostname === LEGACY_HOST) {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
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
