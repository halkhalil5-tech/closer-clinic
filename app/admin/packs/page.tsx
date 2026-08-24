import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PackCreateForm, PackRow } from "@/components/pack-admin";

export const dynamic = "force-dynamic";

/** Platform-admin pack management (ADMIN_EMAILS). Plain forms by design. */
export default async function AdminPacksPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");
  if (!isPlatformAdmin(user.email)) notFound();

  const admin = createAdminClient();
  const packs: {
    id: string;
    name: string;
    vendor: string;
    distribution: string;
    stationSlugs: string[];
    codes: string[];
  }[] = [];

  if (admin) {
    const [{ data: rows }, { data: stations }, { data: codes }] = await Promise.all([
      admin.from("packs").select("*").order("created_at"),
      admin.from("scenarios").select("slug, pack_id").not("pack_id", "is", null),
      admin.from("pack_codes").select("code, pack_id"),
    ]);
    for (const p of rows ?? []) {
      packs.push({
        id: p.id,
        name: p.name,
        vendor: p.vendor,
        distribution: p.distribution,
        stationSlugs: (stations ?? []).filter((s) => s.pack_id === p.id).map((s) => s.slug),
        codes: (codes ?? []).filter((c) => c.pack_id === p.id).map((c) => c.code),
      });
    }
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-10 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <span className="microlabel">Platform admin</span>
        <Link href="/settings" className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Settings ✕
        </Link>
      </div>
      <h1 className="display mt-2 text-[28px] text-bone">Vendor packs</h1>

      {!admin ? (
        <p className="mt-4 text-sm text-dim">Pack management requires Supabase (production).</p>
      ) : (
        <>
          <section className="mt-4 border border-line bg-panel p-3">
            <div className="microlabel">New pack</div>
            <PackCreateForm />
          </section>

          <section className="mt-4">
            <div className="microlabel">Packs ({packs.length})</div>
            {packs.map((p) => (
              <PackRow key={p.id} pack={p} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
