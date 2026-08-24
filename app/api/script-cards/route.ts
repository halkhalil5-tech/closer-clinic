import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getStore, listRosterForUser } from "@/lib/store";
import { cardLinesFor } from "@/lib/script-card-service";
import { renderScriptCards } from "@/lib/script-card-pdf";

export const maxDuration = 60;

/** Every active station's script card, concatenated into one PDF. */
export async function GET() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const store = await getStore();
  const profile = await store.getCurrentUser();
  const roster = await listRosterForUser(store, user.id, profile?.specialty ?? "podiatry");
  const stations = [...roster.custom, ...roster.builtIn];
  if (stations.length === 0) {
    return NextResponse.json({ error: "No stations to print" }, { status: 404 });
  }

  try {
    const clinicName = await store.getClinicName(user.id);
    const cards = [];
    for (const scenario of stations) {
      cards.push({ scenario, lines: await cardLinesFor(store, user.id, scenario) });
    }
    const pdf = await renderScriptCards(cards, clinicName);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="script-cards.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Script cards failed", err);
    return NextResponse.json({ error: "Couldn't build the cards. Try again." }, { status: 502 });
  }
}
