import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { ServiceBuilder } from "@/components/service-builder";

export const dynamic = "force-dynamic";

export default async function NewStationPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");
  return <ServiceBuilder />;
}
