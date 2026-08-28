/**
 * Seed the Supabase scenarios table from the canonical library in lib/scenarios.ts.
 * Requires SUPABASE_SERVICE_ROLE_KEY (writes bypass RLS; scenarios have no
 * user-write policy by design).
 *
 * Usage (run via npm so the type-stripping flag is applied):
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

// lib/scenarios.ts only has type-only imports, so Node's
// --experimental-strip-types can load it directly.
const { SCENARIOS } = await import("../lib/scenarios.ts");

const supabase = createClient(url, key);

let sort = 1;
for (const s of SCENARIOS) {
  const { error } = await supabase.from("scenarios").upsert(
    {
      slug: s.slug,
      specialty: s.specialty,
      role: s.role ?? "provider",
      title: s.title,
      service_desc: s.serviceDesc,
      price_display: s.priceDisplay,
      price_structure: s.priceStructure,
      clinical_context: s.clinicalContext,
      patient_cc: s.patientCc,
      close_goal: s.closeGoal,
      objection_seeds: s.objectionSeeds,
      difficulty_notes: s.difficultyNotes ?? null,
      insurance_override: s.insuranceOverride ?? null,
      is_custom: false,
      active: s.active,
      sort_order: sort++,
    },
    { onConflict: "slug" }
  );
  if (error) {
    console.error(`Failed to upsert ${s.slug}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ ${s.slug}`);
}
console.log(`Seeded ${SCENARIOS.length} scenarios.`);

// ------------------------------ vendor packs ------------------------------
const {
  NORTHWIND_PACK, NORTHWIND_STATIONS, NORTHWIND_CODE,
  STEMATIC_PACK, STEMATIC_STATIONS, STEMATIC_CODE,
} = await import("../lib/packs.ts");
const VENDOR_PACKS = [
  { pack: NORTHWIND_PACK, stations: NORTHWIND_STATIONS, code: NORTHWIND_CODE },
  { pack: STEMATIC_PACK, stations: STEMATIC_STATIONS, code: STEMATIC_CODE },
];
for (const { pack, stations, code } of VENDOR_PACKS) {
  const { error } = await supabase.from("packs").upsert(
    {
      id: pack.id,
      name: pack.name,
      vendor: pack.vendor,
      specialty: pack.specialty,
      branding: pack.branding,
      distribution: pack.distribution,
    },
    { onConflict: "id" }
  );
  if (error) { console.error("pack upsert failed:", error.message); process.exit(1); }
  for (const s of stations) {
    const { error: e } = await supabase.from("scenarios").upsert(
      {
        slug: s.slug,
        specialty: s.specialty,
        role: s.role ?? "provider",
        title: s.title,
        service_desc: s.serviceDesc,
        price_display: s.priceDisplay,
        price_structure: s.priceStructure,
        clinical_context: s.clinicalContext,
        patient_cc: s.patientCc,
        close_goal: s.closeGoal,
        objection_seeds: s.objectionSeeds,
        difficulty_notes: s.difficultyNotes ?? null,
        margin_note: s.marginNote ?? null,
        is_custom: false,
        active: true,
        sort_order: sort++,
        pack_id: pack.id,
      },
      { onConflict: "slug" }
    );
    if (e) { console.error(`pack station ${s.slug} failed:`, e.message); process.exit(1); }
    console.log(`✓ ${s.slug} (pack)`);
  }
  const { error: ce } = await supabase.from("pack_codes").upsert(
    { code, pack_id: pack.id },
    { onConflict: "code" }
  );
  if (ce) { console.error("pack code failed:", ce.message); process.exit(1); }
  console.log(`✓ pack code ${code}`);
}

// ------------------------- training content -------------------------
// Same canonical-source pattern: packs live in lib/training/*, the seed
// upserts them. A dental pack is another import + spread here.
const { PODIATRY_MODULES, PODIATRY_LESSONS } = await import("../lib/training/podiatry-pack.ts");
const { REGEN_MODULES, REGEN_LESSONS } = await import("../lib/training/regen-pack.ts");
const ALL_MODULES = [...PODIATRY_MODULES, ...REGEN_MODULES];
const ALL_LESSONS = [...PODIATRY_LESSONS, ...REGEN_LESSONS];

for (const m of ALL_MODULES) {
  const { error } = await supabase.from("training_modules").upsert(
    {
      slug: m.slug,
      specialty: m.specialty,
      sort_order: m.order,
      rubric_key: m.rubricKey,
      title: m.title,
      subtitle: m.subtitle,
      core: m.core,
    },
    { onConflict: "slug" }
  );
  if (error) {
    console.error(`Failed to upsert module ${m.slug}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ module ${m.slug}`);
}

for (const l of ALL_LESSONS) {
  const { error } = await supabase.from("training_lessons").upsert(
    {
      slug: l.slug,
      module_slug: l.moduleSlug,
      specialty: l.specialty,
      sort_order: l.order,
      title: l.title,
      minutes: l.minutes,
      content: { cards: l.cards, example: l.example, quiz: l.quiz, drill: l.drill },
    },
    { onConflict: "slug" }
  );
  if (error) {
    console.error(`Failed to upsert lesson ${l.slug}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ lesson ${l.slug}`);
}
console.log(
  `Seeded ${ALL_MODULES.length} training modules and ${ALL_LESSONS.length} lessons.`
);

// ------------------------- objection card deck -------------------------
const { PODIATRY_OBJECTION_CARDS } = await import("../lib/training/objection-cards.ts");
const { REGEN_OBJECTION_CARDS } = await import("../lib/training/regen-objection-cards.ts");
const ALL_CARDS = [...PODIATRY_OBJECTION_CARDS, ...REGEN_OBJECTION_CARDS];
for (const c of ALL_CARDS) {
  const { error } = await supabase.from("objection_cards").upsert(
    {
      id: c.id,
      specialty: c.specialty,
      difficulty: c.difficulty,
      front: c.front,
      back: c.back,
      created_by_user_id: null,
    },
    { onConflict: "id" }
  );
  if (error) {
    console.error(`Failed to upsert card ${c.id}:`, error.message);
    process.exit(1);
  }
}
console.log(`Seeded ${ALL_CARDS.length} objection cards.`);

// ------------------------- module documents -------------------------
const { PODIATRY_MODULE_DOCS } = await import("../lib/training/module-docs.ts");
const { REGEN_MODULE_DOCS } = await import("../lib/training/regen-module-docs.ts");
const ALL_DOCS = [...PODIATRY_MODULE_DOCS, ...REGEN_MODULE_DOCS];
for (const d of ALL_DOCS) {
  const { error } = await supabase.from("training_module_docs").upsert(
    {
      module_slug: d.moduleSlug,
      specialty: d.specialty,
      content: {
        objectives: d.objectives,
        concept: d.concept,
        scripts: d.scripts,
        dialogues: d.dialogues,
        mistakes: d.mistakes,
        repCta: d.repCta,
        flags: d.flags,
      },
    },
    { onConflict: "module_slug" }
  );
  if (error) {
    console.error(`Failed to upsert module doc ${d.moduleSlug}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ module doc ${d.moduleSlug}`);
}
console.log(`Seeded ${ALL_DOCS.length} module docs.`);
