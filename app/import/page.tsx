import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { SiteImport } from "@/components/site-import";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");
  return <SiteImport />;
}
