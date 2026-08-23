import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** OAuth / email-confirmation callback: exchange the code for a session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // New users land on onboarding; the home page redirects them there
      // if their profile isn't complete, so /home is always a safe target.
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/home"}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
