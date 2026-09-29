// Final audio: narration on slot starts, doctor lines at their marks,
// patient lines anchored to their on-screen end — all in final-cut time.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const sh = (c) => execSync(c, { stdio: ["ignore", "pipe", "pipe"] }).toString();
const { buildTimeline } = await import("./tl.mjs");
const { tl, map, marks, slots, cueStart } = buildTimeline();
const plines = JSON.parse(readFileSync("plines.json", "utf8"));
const T = tl;

const cues = [];
for (const sl of slots) cues.push([`vo/${sl.id}.mp3`, sl.start + 0.35, 1.0]);
for (const m of marks.filter((x) => x.kind === "doc")) cues.push([m.file, map(m.t) - 0.45, 1.0]);
for (const l of plines) cues.push([l.file, cueStart(l), 0.96]);
cues.push(["vo/13-report.mp3", T.SC_START + 0.3, 1.0]);
cues.push(["vo/12-end.mp3", T.T_END + 1.0, 1.0]);
cues.sort((a, b) => a[1] - b[1]);

const inputs = cues.map(([f]) => `-i ${f}`).join(" ");
const legs = cues.map(([f, t, v], i) => `[${i}:a]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=${v}[a${i}]`).join(";");
const mixIn = cues.map((_, i) => `[a${i}]`).join("");
sh(`ffmpeg -y -hide_banner -loglevel error ${inputs} -filter_complex "${legs};${mixIn}amix=inputs=${cues.length}:normalize=0:dropout_transition=0[m];[m]loudnorm=I=-16:TP=-1.5:LRA=11,apad[out]" -map "[out]" -t ${T.TOTAL} -c:a aac -b:a 160k track.m4a`);
console.log("mixed → track.m4a", sh(`ffprobe -v error -show_entries format=duration -of csv=p=0 track.m4a`).trim() + "s");
