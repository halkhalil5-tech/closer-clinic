import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore, listRosterForUser } from "@/lib/store";
import { listArchetypes } from "@/lib/personas";
import { CONDITIONS } from "@/lib/prep";
import { PrepForm } from "@/components/prep-form";

export const dynamic = "force-dynamic";

export default async function PrepPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const store = await getStore();
  const profile = await store.getCurrentUser();
  const specialty = profile?.specialty ?? "podiatry";
  const roster = await listRosterForUser(store, user.id, specialty);

  const services = [...roster.custom, ...roster.builtIn].map((s) => ({
    slug: s.slug,
    title: s.title,
    price: s.priceDisplay,
    custom: Boolean(s.isCustom),
  }));

  return (
    <PrepForm
      services={services}
      conditions={CONDITIONS[specialty] ?? CONDITIONS.podiatry}
      archetypes={listArchetypes()}
    />
  );
}
