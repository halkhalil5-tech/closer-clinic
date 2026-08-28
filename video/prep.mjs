// Stage the demo data the commercial films: one strong graded rep (for the
// scorecard beat) and one fresh encounter (for the live session beat), plus
// the patient's opener audio pulled from the app's own TTS route so the
// soundtrack can carry a real AI-patient line.
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const BASE = "http://localhost:3000";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}

// ---- 1. a strong rep, graded: the scorecard we film ----
const strong = await post("/api/encounters", {
  scenarioSlug: "shockwave-plantar-fasciitis",
  difficulty: "moderate",
});
const repId = strong.data.encounterId;
console.log("graded rep:", repId, strong.status);

const LINES = [
  "Before we talk about options — you said the mornings are the worst part. Walk me through yesterday morning.",
  "So a year of this, on your feet all day, after you've already done the shots and the orthotics. Here's what your chart tells me: your ultrasound shows the fascia thickened to six millimeters, and three conservative treatments have failed. That combination is exactly what shockwave exists for.",
  "The full series is six hundred dollars.",
  "Can I ask you something — if the cost weren't a factor at all, would you want to do this?",
  "That tells me the treatment is right and the timing is the question. We can start next week, or the first week of next month. Which works better for you?",
];
for (const text of LINES) {
  const r = await post(`/api/encounters/${repId}/turn`, { text });
  if (!r.ok) console.log("turn failed", r.status, JSON.stringify(r.data).slice(0, 120));
}
const graded = await post(`/api/encounters/${repId}/grade`);
console.log("grade:", graded.status, JSON.stringify(graded.data).slice(0, 200));

// ---- 2. a fresh encounter: the live session we film ----
const live = await post("/api/encounters", {
  scenarioSlug: "laser-nail-fungus-program",
  difficulty: "moderate",
});
const liveId = live.data.encounterId;
const opener = live.data.patient;
console.log("live encounter:", liveId);
console.log("opener:", opener);

// ---- 3. the opener's real voice, for the soundtrack ----
const tts = await fetch(`${BASE}/api/tts`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ encounterId: liveId, text: opener }),
});
if (!tts.ok) {
  console.error("tts failed", tts.status, (await tts.text()).slice(0, 200));
  process.exit(1);
}
writeFileSync("patient.mp3", Buffer.from(await tts.arrayBuffer()));
const dur = Number(
  execSync("ffprobe -v error -show_entries format=duration -of csv=p=0 patient.mp3").toString().trim()
);
console.log("patient audio:", dur.toFixed(2), "s");

writeFileSync(
  "demo.json",
  JSON.stringify({ repId, liveId, opener, patientDur: Number(dur.toFixed(2)) }, null, 2)
);
