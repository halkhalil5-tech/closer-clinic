import { writeFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const BASE = "http://localhost:3000";
const good = JSON.parse(readFileSync("good-rep.json", "utf8"));

// Fresh encounter (opener only): on the first gesture the app speaks the
// opener itself, so the orb goes live and the on-screen text is exactly the
// line we hear. Try a few rolls for a punchy one.
let best = null;
for (let i = 0; i < 4; i++) {
  const s = await fetch(`${BASE}/api/encounters`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioSlug: "shockwave-plantar-fasciitis", difficulty: "moderate" }),
  }).then(r => r.json());
  const first = s.patient.split(/(?<=[.?!])\s/)[0];
  console.log(`roll ${i}: [${first.length}] ${first}`);
  if (!best || (first.length > 45 && first.length < best.first.length)) {
    best = { id: s.encounterId, opener: s.patient, first };
  }
}
console.log("\nCHOSEN:", best.first);
const tts = await fetch(`${BASE}/api/tts`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ encounterId: best.id, text: best.opener }),
});
writeFileSync("patient.mp3", Buffer.from(await tts.arrayBuffer()));
const dur = Number(execSync("ffprobe -v error -show_entries format=duration -of csv=p=0 patient.mp3").toString().trim());
console.log("full opener audio:", dur.toFixed(2), "s");
writeFileSync("demo.json", JSON.stringify({
  repId: good.repId, liveId: best.id, opener: best.opener, openerFirst: best.first,
}, null, 2));
