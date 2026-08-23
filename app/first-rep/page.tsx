import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { FirstRepStart } from "@/components/first-rep-start";

export const dynamic = "force-dynamic";

/**
 * First rep in 60 seconds: a brand-new user talks to an AI patient before
 * specialty pickers, before the curriculum pitch. The aha moment is hearing
 * the patient talk back — everything else gates after it, never before.
 */
export default async function FirstRepPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const store = await getStore();
  const prior = await store.listEncountersWithGrades(user.id, { limit: 1 });
  if (prior.length > 0) {
    const profile = await store.getCurrentUser();
    redirect(profile?.onboarded ? "/home" : "/onboarding");
  }

  // Flagship first-rep station (default specialty until they pick one).
  const scenarios = await store.listScenarios("podiatry");
  const scenario = scenarios[0];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
      <div className="microlabel">Closer Clinic</div>
      <h1 className="display mt-5 text-[34px] leading-[1.02] text-bone">
        Your first
        <br />
        patient is
        <br />
        already waiting
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-dim">
        No tour, no forms. There&apos;s a patient in the room with{" "}
        {scenario ? <span className="text-ink">{scenario.patientCc.split("—")[0].trim().toLowerCase()}</span> : "a real complaint"}{" "}
        and a real reason to say no. Walk in, talk like you would in clinic,
        and ask for the close.
      </p>
      <div className="mt-4 divide-y divide-hairline">
        <div className="flex items-baseline justify-between py-2.5">
          <span className="text-[13px] text-dim">Station</span>
          <span className="text-[13px] text-ink">{scenario?.title ?? "Flagship"}</span>
        </div>
        <div className="flex items-baseline justify-between py-2.5">
          <span className="text-[13px] text-dim">The ask</span>
          <span className="font-mono text-[13px] font-semibold tabular-nums text-bone">
            {scenario?.priceDisplay ?? ""}
          </span>
        </div>
        <div className="flex items-baseline justify-between py-2.5">
          <span className="text-[13px] text-dim">Takes</span>
          <span className="text-[13px] text-ink">About 3 minutes, voice or text</span>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <FirstRepStart scenarioSlug={scenario?.slug ?? ""} />
        <p className="mt-2.5 text-center text-[11px] leading-snug text-muted">
          You&apos;ll get a full graded scorecard. Setup comes after — never before.
        </p>
      </div>
    </main>
  );
}
