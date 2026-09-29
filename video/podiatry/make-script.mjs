// demo-script.md: every spoken line in the video, editable for regeneration.
// The encounter dialogue is written with [PRICE_PER_SESSION]/[PACKAGE_PRICE]
// placeholders wherever the filmed values ($250 / $675) were spoken.
import { readFileSync, writeFileSync } from "node:fs";
const vo = JSON.parse(readFileSync("vo/manifest.json", "utf8"));
const { marks } = JSON.parse(readFileSync("enc-meta.json", "utf8"));
const ph = (t) => t
  .replace(/\$\s?250/g, "[PRICE_PER_SESSION]")
  .replace(/two[- ]fifty/gi, "[PRICE_PER_SESSION]")
  .replace(/\$\s?675/g, "[PACKAGE_PRICE]")
  .replace(/six seventy[- ]five/gi, "[PACKAGE_PRICE]");

let md = `# Closer Clinic — Podiatry Shockwave Demo Script

Video: \`demo-podiatry-shockwave.mp4\` · narrator + doctor voice: ElevenLabs "Brian" (\`nPczCjzI2devNBz1zQrb\`) · patient voice: the encounter's pinned app voice.

## Price placeholders

| Placeholder | Value spoken in this cut | Where to change |
|---|---|---|
| \`[PRICE_PER_SESSION]\` | **$250** | 1. \`lib/scenarios.ts\` → \`shockwave-achilles\` → \`priceDisplay\`/\`priceStructure\` 2. the doctor system prompt in \`video/podiatry/film-encounter.mjs\` |
| \`[PACKAGE_PRICE]\` | **$675** (first 3 sessions) | same two places |

To regenerate with new prices: edit both files, then re-run \`film-encounter.mjs\` → \`patient-audio.mjs\` → \`bg.mjs\` → \`mix.mjs\` → \`comp.sh\` → \`verify.mjs\` (dev server running, seeded). The encounter is live AI — the dialogue will differ take to take; the narration (below) is fixed.

## Part 1 — narration

`;
for (const b of vo) {
  if (b.id === "13-report") continue;
  md += `- **${b.id}** (${b.dur}s): ${b.text}\n`;
}
md += `- **13-report**: Thirty seconds later: the grade, the receptivity curve, and the exact line to say better next time.\n`;
md += `\n> "Clozer" is the phonetic respelling that makes the voice model pronounce **Closer** correctly (as in *one who closes*). Keep it in any regenerated narration.\n`;
md += `\n## Part 2 — the encounter (live AI, as filmed)\n\n`;
for (const m of marks) {
  if (m.kind === "say" && m.text) md += `**Patient**${typeof m.receptivity === "number" ? ` *(receptivity ${m.receptivity})*` : ""}: ${ph(m.text)}\n\n`;
  if (m.kind === "doc") md += `**Doctor**: ${ph(m.text)}\n\n`;
}
md += `*(The doctor then ends the session; the scorecard that follows is this encounter's real grade.)*\n`;
writeFileSync("demo-script.md", md);
console.log("demo-script.md written");
