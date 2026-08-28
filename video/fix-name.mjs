// "Closer" as in one who CLOSES the case — /ˈkloʊzər/, not "nearer".
// Respelled phonetically for the voice model; on-screen text is unchanged.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const env = Object.fromEntries(
  readFileSync("/Users/hassanalkhalil/closer-clinic/.env.local", "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")])
);
const VOICE = "nPczCjzI2devNBz1zQrb";     // Brian — same voice as the rest
const MODEL = "eleven_multilingual_v2";   // same model, so timbre matches

const FIX = [
  { id: "02-what", text: "Clozer Clinic is a flight simulator for that conversation." },
  { id: "09-close", text: "Clozer Clinic. Get the yes you already earned." },
];

const manifest = JSON.parse(readFileSync("vo/manifest.json", "utf8"));
for (const beat of FIX) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: beat.text,
      model_id: MODEL,
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) { console.error(beat.id, res.status, (await res.text()).slice(0, 200)); process.exit(1); }
  const file = `vo/${beat.id}.mp3`;
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  const dur = Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${file}`).toString().trim());
  const row = manifest.find((m) => m.id === beat.id);
  console.log(`${beat.id}: ${row.dur}s → ${dur.toFixed(2)}s   "${beat.text}"`);
  row.dur = Number(dur.toFixed(2));
  row.text = beat.text;
}
writeFileSync("vo/manifest.json", JSON.stringify(manifest, null, 2));

// ---- rebuild the mix against the same measured on-screen marks ----
const marks = JSON.parse(readFileSync("marks.json", "utf8"));
const CUES = [
  ["vo/01-hook.mp3", 1.0],
  ["vo/02-what.mp3", marks.appReveal + 0.7],
  ["vo/03-stations.mp3", 13.5],
  ["vo/04-rep.mp3", marks.sheetOpen + 0.5],
  ["vo/05-listen.mp3", marks.patientSpeak - 1.5],
  ["patient-clip.mp3", marks.patientSpeak + 0.3],
  ["vo/06-grade.mp3", marks.scorecardEnter + 0.5],
  ["vo/07-rewrite.mp3", 44.3],
  ["vo/08-revenue.mp3", marks.progressEnter + 0.5],
  ["vo/09-close.mp3", marks.endCard + 1.4],
];
// guard: no beat may run into the next one
for (let i = 0; i < CUES.length - 1; i++) {
  const d = manifest.find((m) => CUES[i][0].includes(m.id))?.dur
    ?? Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${CUES[i][0]}`).toString().trim());
  const overrun = CUES[i][1] + d - CUES[i + 1][1];
  if (overrun > 0) console.log(`  ! ${CUES[i][0]} overruns next cue by ${overrun.toFixed(2)}s`);
}

const inputs = CUES.map(([f]) => `-i ${f}`).join(" ");
const legs = CUES.map(([f], i) =>
  `[${i}:a]adelay=${Math.round(CUES[i][1] * 1000)}|${Math.round(CUES[i][1] * 1000)},volume=${f.includes("patient") ? 0.88 : 1.0}[a${i}]`
).join(";");
const mixIn = CUES.map((_, i) => `[a${i}]`).join("");
execSync(`ffmpeg -y -hide_banner -loglevel error ${inputs} -filter_complex "${legs};${mixIn}amix=inputs=${CUES.length}:normalize=0:dropout_transition=0[m];[m]loudnorm=I=-16:TP=-1.5:LRA=11,apad[out]" -map "[out]" -t 60 -c:a aac -b:a 192k track.m4a`);
console.log("\naudio remixed → track.m4a");
