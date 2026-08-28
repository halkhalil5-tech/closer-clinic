// Generate the commercial voiceover, one file per beat, then report durations
// so the on-screen action can be timed to the narration.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const env = Object.fromEntries(
  readFileSync("/Users/hassanalkhalil/closer-clinic/.env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")])
);

// Brian — polished, deep, American. (American-only voice rule.)
const VOICE = "nPczCjzI2devNBz1zQrb";
const MODEL = "eleven_multilingual_v2";

export const SCRIPT = [
  { id: "01-hook", text: "Every week, a patient leaves your office without the treatment you know they need. Not because you were wrong. Because of how the conversation went." },
  { id: "02-what", text: "Closer Clinic is a flight simulator for that conversation." },
  { id: "03-stations", text: "Your stations. Shockwave, laser, orthotics — loaded with your services, at your prices." },
  { id: "04-rep", text: "You walk into the room and talk to an A.I. patient who pushes back like a real one." },
  { id: "05-listen", text: "Out loud. In real time." },
  { id: "06-grade", text: "The moment you finish, you're graded on the five things that decide a case: rapport, clinical framing, price delivery, objections, and the close." },
  { id: "07-rewrite", text: "Every rep shows you the exact line that cost you — and the line that would have won it." },
  { id: "08-revenue", text: "Then it follows you into the real chair. Closed revenue. Where consults leak. What the training is actually worth." },
  { id: "09-close", text: "Closer Clinic. Get the yes you already earned." },
];

mkdirSync("vo", { recursive: true });
const out = [];
for (const beat of SCRIPT) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: beat.text,
      model_id: MODEL,
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    console.error(beat.id, res.status, (await res.text()).slice(0, 200));
    process.exit(1);
  }
  const file = `vo/${beat.id}.mp3`;
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  const dur = Number(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${file}`).toString().trim()
  );
  out.push({ ...beat, file, dur: Number(dur.toFixed(2)) });
  console.log(`${beat.id}  ${dur.toFixed(2)}s`);
}
writeFileSync("vo/manifest.json", JSON.stringify(out, null, 2));
console.log("TOTAL VO:", out.reduce((a, b) => a + b.dur, 0).toFixed(1), "s");
