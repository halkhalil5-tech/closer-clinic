import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { getAuthedUser } from "@/lib/auth";

export default async function RootPage() {
  if (!isSupabaseConfigured()) redirect("/home");
  const user = await getAuthedUser();
  redirect(user ? "/home" : "/login");
}
