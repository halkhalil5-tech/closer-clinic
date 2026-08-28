// Compose the finished spot: branded backdrop + phone footage + narration mix.
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const marks = JSON.parse(readFileSync("marks.json", "utf8"));
const vo = JSON.parse(readFileSync("vo/manifest.json", "utf8"));
const dur = Object.fromEntries(vo.map((b) => [b.id, b.dur]));
const sh = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString();

// ---------------------------------------------------------------- backdrop
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.setContent(`<!doctype html><html><body style="margin:0;width:1920px;height:1080px;
  background:
    radial-gradient(900px 620px at 50% 42%, rgba(46,196,165,.10), transparent 70%),
    radial-gradient(1400px 900px at 50% 120%, rgba(16,112,127,.16), transparent 70%),
    #06222A;"></body></html>`);
await page.screenshot({ path: "backdrop.png" });
await browser.close();
console.log("backdrop rendered");

// ------------------------------------------------------------------- audio
// Narration placed against the measured on-screen marks; the patient's real
// voice sits in the gap the narration leaves for it.
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
console.log("\naudio cues:");
CUES.forEach(([f, t]) => console.log(`  ${t.toFixed(2).padStart(6)}s  ${f}`));

const inputs = CUES.map(([f]) => `-i ${f}`).join(" ");
// The patient line is the product talking — keep it a touch under the VO.
const legs = CUES.map(([f, t], i) => {
  const gain = f.includes("patient") ? 0.88 : 1.0;
  return `[${i}:a]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=${gain}[a${i}]`;
}).join(";");
const mixIn = CUES.map((_, i) => `[a${i}]`).join("");
sh(`ffmpeg -y -hide_banner -loglevel error ${inputs} -filter_complex "${legs};${mixIn}amix=inputs=${CUES.length}:normalize=0:dropout_transition=0[m];[m]loudnorm=I=-16:TP=-1.5:LRA=11,apad[out]" -map "[out]" -t 60 -c:a aac -b:a 192k track.m4a`);
console.log("audio mixed →", sh("ffprobe -v error -show_entries format=duration -of csv=p=0 track.m4a").trim(), "s");

// ------------------------------------------------------------ 16:9 master
// Phone footage centered on the backdrop with a hairline mint edge.
const PH = 1000, PW = 462, X = (1920 - PW) / 2, Y = (1080 - PH) / 2;
sh(`ffmpeg -y -hide_banner -loglevel error \
 -loop 1 -i backdrop.png -i raw/walkthrough.webm -i track.m4a \
 -filter_complex "[1:v]scale=${PW}:${PH}:flags=lanczos,setsar=1[ph]; \
   [0:v][ph]overlay=${X}:${Y}:shortest=1[bg]; \
   [bg]drawbox=x=${X - 1}:y=${Y - 1}:w=${PW + 2}:h=${PH + 2}:color=0x2EC4A5@0.30:t=2[fr]; \
   [fr]fade=t=in:st=0:d=0.6,fade=t=out:st=59.2:d=0.8,format=yuv420p[v]; \
   [2:a]afade=t=out:st=59.2:d=0.8[a]" \
 -map "[v]" -map "[a]" -t 60 -r 30 -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart closer-clinic-60s.mp4`);
console.log("16:9 master built");

// --------------------------------------------------------- 9:16 for social
const VW = 1080, VH = 1920, PH2 = 1560, PW2 = Math.round((390 / 844) * PH2 / 2) * 2;
sh(`ffmpeg -y -hide_banner -loglevel error \
 -loop 1 -i backdrop.png -i raw/walkthrough.webm -i track.m4a \
 -filter_complex "[0:v]scale=${VW}:${VH}:force_original_aspect_ratio=increase,crop=${VW}:${VH}[bgv]; \
   [1:v]scale=${PW2}:${PH2}:flags=lanczos,setsar=1[ph]; \
   [bgv][ph]overlay=(W-w)/2:(H-h)/2:shortest=1[bg]; \
   [bg]fade=t=in:st=0:d=0.6,fade=t=out:st=59.2:d=0.8,format=yuv420p[v]; \
   [2:a]afade=t=out:st=59.2:d=0.8[a]" \
 -map "[v]" -map "[a]" -t 60 -r 30 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart closer-clinic-60s-vertical.mp4`);
console.log("9:16 built");

for (const f of ["closer-clinic-60s.mp4", "closer-clinic-60s-vertical.mp4"]) {
  const info = sh(`ffprobe -v error -show_entries format=duration,size:stream=width,height,codec_name -of default=nw=1 ${f}`);
  console.log(`\n${f}\n${info.trim()}`);
}
writeFileSync("cues.json", JSON.stringify(CUES, null, 2));
