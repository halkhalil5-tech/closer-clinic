import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { ObjectionDeck } from "@/components/objection-deck";
import { drawShuffled } from "@/lib/training/objection-cards";

export const dynamic = "force-dynamic";

export default async function ObjectionCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ shuffle?: string }>;
}) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const shuffleN = Number(sp.shuffle) || 0;

  const store = await getStore();
  const profile = await store.getCurrentUser();
  let cards = await store.listObjectionCards(user.id, profile?.specialty ?? "podiatry");

  if (shuffleN > 0) {
    cards = drawShuffled(cards, shuffleN);
  }

  return <ObjectionDeck cards={cards} shuffled={shuffleN > 0} />;
}
