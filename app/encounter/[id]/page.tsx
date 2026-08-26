import { notFound, redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { EncounterClient } from "@/components/encounter-client";
import { MAX_PROVIDER_TURNS } from "@/lib/types";
import { withPriceSnapshot } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function EncounterPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const store = await getStore();
  const encounter = await store.getEncounter(id, user.id);
  if (!encounter) notFound();
  if (encounter.status === "graded") redirect(`/scorecard/${id}`);

  const baseScenario = await store.getScenario(encounter.scenarioSlug);
  if (!baseScenario) notFound();
  const scenario = withPriceSnapshot(baseScenario, encounter.meta);

  const providerTurns = encounter.transcript.filter((m) => m.role === "provider").length;
  const lastPatient = [...encounter.transcript].reverse().find((m) => m.role === "patient");

  return (
    <EncounterClient
      encounterId={encounter.id}
      startedAt={encounter.startedAt}
      persona={encounter.persona}
      scenario={{
        title: scenario.title,
        priceDisplay: scenario.priceDisplay,
        patientCc: scenario.patientCc,
        clinicalContext: scenario.clinicalContext,
        closeGoal: scenario.closeGoal,
      }}
      difficulty={encounter.difficulty}
      initialMessages={encounter.transcript
        .filter((m) => m.role !== "event")
        .map((m) => ({ role: m.role as "provider" | "patient", text: m.text }))}
      initialTurnsUsed={providerTurns}
      initialReceptivity={lastPatient?.receptivity ?? null}
      maxTurns={MAX_PROVIDER_TURNS}
      voiceCaps={{
        tts: Boolean(process.env.ELEVENLABS_API_KEY),
        stt: Boolean(process.env.DEEPGRAM_API_KEY),
      }}
    />
  );
}
