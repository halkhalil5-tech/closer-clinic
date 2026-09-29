// Narration for the Dr. Pelto demo. Brian (American) narrates and doctors;
// "Clozer" respelling keeps the brand name pronounced as intended.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
const env = Object.fromEntries(
  readFileSync("/Users/hassanalkhalil/closer-clinic/.env.local", "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const VOICE = "nPczCjzI2devNBz1zQrb"; // Brian — narrator + doctor
export const BEATS = [
  ["00-title",     "This is Clozer Clinic. A flight simulator for the conversation that decides the case."],
  ["01-import",    "Setup starts with your website. It reads your services and your prices, and builds your training stations from them."],
  ["02-personas",  "Each station is a consult with an AI patient — a name, a history, an insurance plan, and an attitude."],
  ["03-voice",     "Then you walk into the room and talk. The patient answers out loud — and pushes back."],
  ["04-recep",     "The receptivity meter is a live read on the room. Overpromise, and you'll watch it drop."],
  ["05-grades",    "Every rep gets a letter grade, scored on the five skills that decide whether a case closes."],
  ["06-rewrite",   "It quotes the exact line that cost you — and the line that would have won it. You can hear both."],
  ["07-cards",     "Objection flashcards drill the answers your patients actually raise, until they're reflex."],
  ["08-frontdesk", "The front desk trains here too — phone shoppers, deposits, and callbacks."],
  ["09-drills",    "Practice owners assign stations to the whole team, with a due date and a minimum grade."],
  ["10-progress",  "And it follows you into the real chair — close rate, streak, and the revenue you logged."],
  ["11-part2",     "Now watch one full encounter, start to finish. Shockwave therapy, for a runner who's tried everything else. The patient is AI — nothing is scripted."],
  ["12-end",       "Clozer Clinic. Get the yes you already earned."],
];
const manifest = [];
for (const [id, text] of BEATS) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.55, similarity_boost: 0.75, use_speaker_boost: true } }),
  });
  if (!r.ok) { console.error(id, r.status, (await r.text()).slice(0, 120)); process.exit(1); }
  writeFileSync(`vo/${id}.mp3`, Buffer.from(await r.arrayBuffer()));
  const dur = Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 vo/${id}.mp3`).toString().trim());
  manifest.push({ id, text, dur: Number(dur.toFixed(2)) });
  console.log(`${id}  ${dur.toFixed(2)}s`);
}
writeFileSync("vo/manifest.json", JSON.stringify(manifest, null, 2));

// Part-1 slots: each section beat gets its narration length + breathing room,
// with a 8.5s floor so footage never feels rushed.
const slots = [];
let t = 0;
for (const m of manifest) {
  if (m.id === "12-end") break;
  const len = m.id === "00-title" ? Math.max(6, m.dur + 1.2)
    : m.id === "11-part2" ? m.dur + 1.6
    : Math.max(8.5, m.dur + 2.0);
  slots.push({ id: m.id, start: Number(t.toFixed(2)), len: Number(len.toFixed(2)) });
  t += len;
}
writeFileSync("slots.json", JSON.stringify({ slots, part2Start: Number(t.toFixed(2)) }, null, 2));
console.log("\npart 2 starts at", t.toFixed(1) + "s");
