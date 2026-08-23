import { notFound, redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { ServiceEdit } from "@/components/service-edit";

export const dynamic = "force-dynamic";

export default async function EditStationPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const store = await getStore();
  const scenario = await store.getScenario(slug);
  if (!scenario?.isCustom || scenario.createdByUserId !== user.id) notFound();

  return (
    <ServiceEdit
      slug={slug}
      initial={{
        title: scenario.title,
        priceDisplay: scenario.priceDisplay,
        priceStructure: scenario.priceStructure,
        serviceDesc: scenario.serviceDesc,
        patientCc: scenario.patientCc,
        clinicalContext: scenario.clinicalContext,
        closeGoal: scenario.closeGoal,
        objectionSeeds: scenario.objectionSeeds,
      }}
    />
  );
}
