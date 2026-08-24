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

/**
 * Plan prices for the subscription-payback line on Progress. Constants for
 * now; Phase 2 wires these to the live billing plan.
 */
export const PLAN_PRICE_INDIVIDUAL_CENTS = 4900;
export const PLAN_PRICE_CLINIC_CENTS = 9900;

export const DEV_USER = {
  id: "00000000-0000-4000-8000-00000000dev0",
  email: "dev@closerclinic.local",
  name: "Dev Provider",
};
