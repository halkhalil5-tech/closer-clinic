/**
 * Runtime mode. When Supabase env vars are absent the app runs in DEV MODE:
 * in-memory store, auto-signed-in dev user, stub patient if no Anthropic key.
 * Production (Vercel + Supabase) always has these set.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const DEV_USER = {
  id: "00000000-0000-4000-8000-00000000dev0",
  email: "dev@closerclinic.local",
  name: "Dev Provider",
};
