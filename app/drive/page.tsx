import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { DriveClient } from "@/components/drive-client";

export const dynamic = "force-dynamic";

/**
 * Drive mode: a full-voice rep with zero screen interaction — windshield
 * time becomes rep time. Audio-only encounter, spoken score summary.
 */
export default async function DrivePage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const store = await getStore();
  const profile = await store.getCurrentUser();
  const specialty = profile?.specialty ?? "podiatry";
  const [scenarios, unlocks] = await Promise.all([
    store.listScenarios(specialty),
    store.listUnlocks(user.id),
  ]);
  if (unlocks.length === 0) redirect("/train");

  return (
    <DriveClient
      scenarios={scenarios.map((s) => ({ slug: s.slug, title: s.title, price: s.priceDisplay }))}
      voiceCaps={{
        tts: Boolean(process.env.ELEVENLABS_API_KEY),
        stt: Boolean(process.env.DEEPGRAM_API_KEY),
      }}
    />
  );
}
