import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { crawlSite, heuristicExtract, buildSiteExtractionPrompt } from "@/lib/site-import";
import { generateGrade, hasModelAccess } from "@/lib/anthropic";

const Schema = z.object({ url: z.string().trim().min(4).max(300) });

const IMPORTS_PER_DAY = 3;

const ResultSchema = z.object({
  services: z.array(
    z.object({
      name: z.string().min(1).max(80),
      description: z.string().max(300).default(""),
      price: z.string().max(40).nullable().default(null),
    })
  ),
});

export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Enter your practice URL." }, { status: 400 });

  const store = await getStore();
  const today = await store.countSiteImportsToday(user.id);
  if (today >= IMPORTS_PER_DAY) {
    return NextResponse.json(
      { error: `Import limit reached (${IMPORTS_PER_DAY}/day). Try again tomorrow or use the manual builder.` },
      { status: 429 }
    );
  }

  const { pages, error } = await crawlSite(body.data.url);
  if (error || pages.length === 0) {
    return NextResponse.json(
      { error: error ?? "Couldn't read the site.", fallback: true },
      { status: 422 }
    );
  }
  await store.recordSiteImport(user.id, body.data.url);

  let services;
  if (!hasModelAccess()) {
    services = heuristicExtract(pages);
  } else {
    try {
      const res = await generateGrade(buildSiteExtractionPrompt(pages));
      const raw = res.raw.trim();
      services = ResultSchema.parse(
        JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1))
      ).services;
    } catch (err) {
      console.error("AI site extraction failed; falling back to heuristic", err);
      services = heuristicExtract(pages);
    }
  }

  if (services.length === 0) {
    return NextResponse.json(
      {
        error:
          "We read the site but couldn't find a service list. Add your services with the manual builder instead.",
        fallback: true,
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ services, pagesRead: pages.length });
}
