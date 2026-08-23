import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { AppNav } from "@/components/app-nav";
import { SettingsClient } from "@/components/settings-client";
import { isSupabaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const store = await getStore();
  const profile = await store.getCurrentUser();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-24">
      <header className="border-b border-line px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <h1 className="display text-[28px] text-ink">Settings</h1>
        <p className="mt-1 font-mono text-[11px] text-muted">{profile?.email ?? user.email}</p>
      </header>
      <SettingsClient
        specialty={profile?.specialty ?? "podiatry"}
        hasRealAuth={isSupabaseConfigured()}
      />
      <AppNav />
    </div>
  );
}
