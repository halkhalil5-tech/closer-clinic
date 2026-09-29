// Verification per the brief: (1) transcribe the final audio and label it,
// (2) hunt silent gaps > 2s inside the encounter, (3) pull frames.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
const sh = (c) => execSync(c, { stdio: ["ignore", "pipe", "pipe"] }).toString();
const env = Object.fromEntries(
  readFileSync("/Users/hassanalkhalil/closer-clinic/.env.local", "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const T = JSON.parse(readFileSync("timeline.json", "utf8"));

// 1 — transcript via ElevenLabs STT with speaker diarization
sh(`ffmpeg -y -hide_banner -loglevel error -i demo-podiatry-shockwave.mp4 -vn -acodec libmp3lame -b:a 96k audio-final.mp3`);
const form = new FormData();
form.append("file", new Blob([readFileSync("audio-final.mp3")], { type: "audio/mpeg" }), "audio.mp3");
form.append("model_id", "scribe_v1");
form.append("diarize", "true");
const stt = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
  method: "POST", headers: { "xi-api-key": env.ELEVENLABS_API_KEY }, body: form,
}).then((r) => r.json());
if (!stt.words) { console.error("STT failed:", JSON.stringify(stt).slice(0, 300)); process.exit(1); }
// group into utterances by speaker + pauses
const utts = [];
for (const w of stt.words.filter((x) => x.type === "word")) {
  const last = utts[utts.length - 1];
  if (last && last.speaker === w.speaker_id && w.start - last.end < 1.4) {
    last.text += " " + w.text; last.end = w.end;
  } else utts.push({ speaker: w.speaker_id, text: w.text, start: w.start, end: w.end });
}
writeFileSync("transcript-raw.json", JSON.stringify(utts, null, 2));
console.log(`--- transcript: ${utts.length} utterances ---`);
for (const u of utts) console.log(`[${u.start.toFixed(1)}–${u.end.toFixed(1)}] ${u.speaker}: ${u.text.slice(0, 110)}`);

// 2 — silent gaps inside the encounter span
const sil = sh(`ffmpeg -hide_banner -i demo-podiatry-shockwave.mp4 -af silencedetect=noise=-38dB:d=2.0 -f null - 2>&1`);
const gaps = [...sil.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)]
  .map((m) => [Number(m[1]), Number(m[2])])
  .filter(([a, b]) => b > T.part2Start + 2 && a < T.SC_START - 1);
console.log(`\n--- silent gaps >2s inside the encounter (${T.part2Start.toFixed(0)}–${T.SC_START.toFixed(0)}s) ---`);
if (!gaps.length) console.log("none");
for (const [a, b] of gaps) console.log(`  ${a.toFixed(1)} → ${b.toFixed(1)}  (${(b - a).toFixed(1)}s)`);

// 3 — frames
mkdirSync("frames", { recursive: true });
const total = Number(sh(`ffprobe -v error -show_entries format=duration -of csv=p=0 demo-podiatry-shockwave.mp4`).trim());
const ts = [3, 20, 55, 95, T.part2Start + 8, T.part2Start + 60, T.SC_START + 5, total - 3].map((x) => Math.min(x, total - 1));
for (const t of ts) sh(`ffmpeg -y -hide_banner -loglevel error -ss ${t} -i demo-podiatry-shockwave.mp4 -frames:v 1 -vf scale=640:-1 frames/f${Math.round(t)}.png`);
console.log("\nframes:", ts.map((t) => Math.round(t)).join(", "));
