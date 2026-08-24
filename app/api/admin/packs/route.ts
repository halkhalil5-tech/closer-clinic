import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const Schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    name: z.string().trim().min(1).max(120),
    vendor: z.string().trim().min(1).max(120),
    specialty: z.enum(["podiatry", "dental", "medspa"]),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    distribution: z.enum(["public", "code"]),
  }),
  z.object({
    action: z.literal("update"),
    packId: z.string().uuid(),
    name: z.string().trim().min(1).max(120).optional(),
    vendor: z.string().trim().min(1).max(120).optional(),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    distribution: z.enum(["public", "code"]).optional(),
  }),
  z.object({
    action: z.literal("attach"),
    packId: z.string().uuid(),
    /** Comma-separated station slugs to move into (or out of, with "-") the pack. */
    slugs: z.string().trim().min(1).max(2000),
  }),
  z.object({ action: z.literal("code"), packId: z.string().uuid() }),
]);

/** Admin-only pack management: create/edit packs, attach stations, mint codes. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user || !isPlatformAdmin(user.email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Requires Supabase" }, { status: 503 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const input = body.data;

  if (input.action === "create") {
    const { data, error } = await admin
      .from("packs")
      .insert({
        name: input.name,
        vendor: input.vendor,
        specialty: input.specialty,
        branding: input.accent ? { accent: input.accent } : {},
        distribution: input.distribution,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ packId: data.id });
  }

  if (input.action === "update") {
    const patch: Record<string, unknown> = {};
    if (input.name) patch.name = input.name;
    if (input.vendor) patch.vendor = input.vendor;
    if (input.distribution) patch.distribution = input.distribution;
    if (input.accent) patch.branding = { accent: input.accent };
    const { error } = await admin.from("packs").update(patch).eq("id", input.packId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (input.action === "attach") {
    const slugs = input.slugs.split(",").map((s) => s.trim()).filter(Boolean);
    const detach = slugs.filter((s) => s.startsWith("-")).map((s) => s.slice(1));
    const attach = slugs.filter((s) => !s.startsWith("-"));
    if (attach.length > 0) {
      const { error } = await admin
        .from("scenarios")
        .update({ pack_id: input.packId })
        .in("slug", attach);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (detach.length > 0) {
      const { error } = await admin.from("scenarios").update({ pack_id: null }).in("slug", detach);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ attached: attach.length, detached: detach.length });
  }

  // action === "code"
  const code = `PACK-${randomBytes(4).toString("hex").toUpperCase()}`;
  const { error } = await admin.from("pack_codes").insert({ code, pack_id: input.packId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code });
}
