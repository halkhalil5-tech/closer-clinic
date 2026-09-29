// Fetch each patient line's voice (the encounter's pinned voice) and anchor it
// so audio ends where the app's speaking indicator ended on screen.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
const { id, marks } = JSON.parse(readFileSync("enc-meta.json", "utf8"));
mkdirSync("pa", { recursive: true });
const lines = [];
for (let i = 0; i < marks.length; i++) {
  if (marks[i].kind !== "say") continue;
  const end = marks.slice(i + 1).find((m) => m.kind === "endSay");
  if (!end) continue;
  lines.push({ idx: lines.length, text: marks[i].text, say: marks[i].t, endSay: end.t });
}
for (const l of lines) {
  const f = `pa/p${l.idx}.mp3`;
  let ok = false;
  for (let a = 0; a < 4 && !ok; a++) {
    try {
      const r = await fetch("http://localhost:3000/api/tts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encounterId: id, text: l.text }),
        signal: AbortSignal.timeout(60000),
      });
      if (!r.ok) throw new Error(String(r.status));
      writeFileSync(f, Buffer.from(await r.arrayBuffer()));
      ok = true;
    } catch (e) { if (a === 3) throw e; await new Promise((z) => setTimeout(z, 3000)); }
  }
  l.file = f;
  l.dur = Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${f}`).toString().trim());
  l.start = Math.max(l.say - 0.4, l.endSay - l.dur);
  console.log(`p${l.idx}: ${l.dur.toFixed(1)}s audio, ${(l.endSay - l.say).toFixed(1)}s on screen`);
}
writeFileSync("plines.json", JSON.stringify(lines, null, 2));
