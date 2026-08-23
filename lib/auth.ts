import "server-only";
import { isSupabaseConfigured, DEV_USER } from "./config";
import { createClient } from "./supabase/server";

export interface AuthedUser {
  id: string;
  email: string;
}

/** Resolve the authenticated user for API routes and server components. */
export async function getAuthedUser(): Promise<AuthedUser | null> {
  if (!isSupabaseConfigured()) {
    return { id: DEV_USER.id, email: DEV_USER.email };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}
