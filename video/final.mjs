// Final assembly: branded ground, timed side captions, phone footage on the
// right, full-frame open/close, and the narration mix.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const marks = JSON.parse(readFileSync("marks.json", "utf8"));
const sh = (c) => execSync(c, { stdio: ["ignore", "pipe", "pipe"] }).toString();

const PH = 940, PW = 434, PX = 1316, PY = 70;      // phone plate, right third
const F = 0.35;                                     // caption crossfade

// caption windows, aligned to the narration cues
const CAPS = [
  ["cap1", 10.2, 13.3],
  ["cap2", 13.5, 19.8],
  ["cap3", 20.3, 24.6],
  ["cap4", 24.9, 33.2],
  ["cap5", 34.1, 43.9],
  ["cap6", 44.2, 49.5],
  ["cap7", 49.8, 55.0],
];

const inputs = [
  `-loop 1 -framerate 30 -t 61 -i cards/plain.png`,
  ...CAPS.map(([n]) => `-loop 1 -framerate 30 -t 61 -i cards/${n}.png`),
  `-i raw/walkthrough.webm`,
  `-loop 1 -framerate 30 -t 61 -i cards/title.png`,
  `-loop 1 -framerate 30 -t 61 -i cards/end.png`,
  `-i track.m4a`,
].join(" ");

const iCap = (k) => 1 + k;
const iPhone = 1 + CAPS.length;
const iTitle = iPhone + 1;
const iEnd = iTitle + 1;
const iAudio = iEnd + 1;

const parts = [];
// captions fade themselves in and out; alpha is 0 outside their window
CAPS.forEach(([, a, b], k) => {
  parts.push(
    `[${iCap(k)}:v]format=rgba,fade=t=in:st=${a}:d=${F}:alpha=1,` +
    `fade=t=out:st=${(b - F).toFixed(2)}:d=${F}:alpha=1[c${k}]`
  );
});
let chain = "[0:v]";
CAPS.forEach((_, k) => {
  const out = `s${k}`;
  parts.push(`${chain}[c${k}]overlay=0:0[${out}]`);
  chain = `[${out}]`;
});

// phone plate
parts.push(
  `[${iPhone}:v]scale=${PW}:${PH}:flags=lanczos,setsar=1,format=rgba,` +
  `fade=t=in:st=9.8:d=0.6:alpha=1,fade=t=out:st=55.0:d=0.5:alpha=1[ph]`
);
parts.push(`${chain}[ph]overlay=${PX}:${PY}[withph]`);
parts.push(
  `[withph]drawbox=x=${PX - 1}:y=${PY - 1}:w=${PW + 2}:h=${PH + 2}:` +
  `color=0x2EC4A5@0.28:t=2:enable='between(t,10.0,55.2)'[framed]`
);

// full-frame open and close sit above everything
parts.push(`[${iTitle}:v]format=rgba,fade=t=out:st=9.4:d=0.6:alpha=1[ti]`);
parts.push(`[framed][ti]overlay=0:0[withtitle]`);
parts.push(`[${iEnd}:v]format=rgba,fade=t=in:st=55.2:d=0.6:alpha=1[en]`);
parts.push(`[withtitle][en]overlay=0:0[full]`);
parts.push(`[full]fade=t=in:st=0:d=0.5,fade=t=out:st=59.3:d=0.7,format=yuv420p[v]`);
parts.push(`[${iAudio}:a]afade=t=out:st=59.3:d=0.7[a]`);

const cmd =
  `ffmpeg -y -hide_banner -loglevel error ${inputs} ` +
  `-filter_complex "${parts.join(";")}" -map "[v]" -map "[a]" ` +
  `-t 60 -r 30 -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p ` +
  `-c:a aac -b:a 192k -movflags +faststart closer-clinic-60s.mp4`;

console.log("rendering 16:9 master…");
sh(cmd);
console.log(sh(`ffprobe -v error -show_entries format=duration,size:stream=width,height -of default=nw=1 closer-clinic-60s.mp4`).trim());

// 9:16 cut: phone fills the frame, captions ride underneath it
console.log("\nrendering 9:16 cut…");
const VH2 = 1560, VW2 = Math.round((390 / 844) * VH2 / 2) * 2;
sh(`ffmpeg -y -hide_banner -loglevel error -loop 1 -framerate 30 -t 61 -i cards/plain.png -i raw/walkthrough.webm -i track.m4a \
 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg]; \
   [1:v]scale=${VW2}:${VH2}:flags=lanczos,setsar=1[ph]; \
   [bg][ph]overlay=(W-w)/2:(H-h)/2:shortest=1[o]; \
   [o]drawbox=x=(1080-${VW2})/2-1:y=(1920-${VH2})/2-1:w=${VW2 + 2}:h=${VH2 + 2}:color=0x2EC4A5@0.26:t=2[o2]; \
   [o2]fade=t=in:st=0:d=0.5,fade=t=out:st=59.3:d=0.7,format=yuv420p[v]; \
   [2:a]afade=t=out:st=59.3:d=0.7[a]" \
 -map "[v]" -map "[a]" -t 60 -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
 -c:a aac -b:a 192k -movflags +faststart closer-clinic-60s-vertical.mp4`);
console.log(sh(`ffprobe -v error -show_entries format=duration,size:stream=width,height -of default=nw=1 closer-clinic-60s-vertical.mp4`).trim());
