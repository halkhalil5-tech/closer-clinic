import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getStore, resolveScenarioForUser } from "@/lib/store";
import { cardLinesFor } from "@/lib/script-card-service";
import { renderScriptCards } from "@/lib/script-card-pdf";

export const maxDuration = 60;

/** One station's printable script card as a PDF. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { slug } = await ctx.params;
  const store = await getStore();
  const scenario = await resolveScenarioForUser(store, user.id, slug);
  if (!scenario) return NextResponse.json({ error: "Station not found" }, { status: 404 });

  try {
    const [lines, clinicName] = await Promise.all([
      cardLinesFor(store, user.id, scenario),
      store.getClinicName(user.id),
    ]);
    const pdf = await renderScriptCards([{ scenario, lines }], clinicName);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="script-card-${slug}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Script card failed", err);
    return NextResponse.json({ error: "Couldn't build the card. Try again." }, { status: 502 });
  }
}
