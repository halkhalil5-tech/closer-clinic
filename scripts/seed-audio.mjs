// Pre-seed the "Common close / The fix" audio pairs for the default podiatry
// stations, so the first user never waits on generation. Run once after deploy:
//
//   node scripts/seed-audio.mjs https://closer-clinic.vercel.app
//
// Reads SUPABASE_SERVICE_ROLE_KEY from .env.local (the target server verifies
// it). Safe to re-run: cached pairs return instantly without regenerating.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const target = process.argv[2] ?? "http://localhost:3000";

const env = Object.fromEntries(
  readFileSync(resolve(import.meta.dirname, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")])
);
const seedKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!seedKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing from .env.local");

const SLUGS = [
  "shockwave-plantar-fasciitis",
  "laser-nail-fungus-program",
  "mls-laser-neuropathy",
  "custom-orthotics",
  "insurance-objection-shockwave",
  "amniotic-injection-fasciitis",
];

for (const slug of SLUGS) {
  const started = Date.now();
  process.stdout.write(`${slug} ... `);
  const res = await fetch(`${target}/api/audio/pair`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-seed-key": seedKey },
    body: JSON.stringify({ stationSlug: slug }),
  });
  const data = await res.json().catch(() => ({}));
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(res.ok ? `${data.status} (${secs}s)` : `FAILED ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
}
