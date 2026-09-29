// The 1920x1080 background/caption layer: title, Part-1 lower-thirds,
// the Part-2 transition, Doctor/Patient captions, report beat, end card.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, renameSync, readdirSync, rmSync } from "node:fs";
const { buildTimeline } = await import("./tl.mjs");
const { tl, map, marks, slots, cueStart } = buildTimeline();
const plines = JSON.parse(readFileSync("plines.json", "utf8"));
const { part2Start, SC_START, SC_LEN, T_END, TOTAL } = tl;
const cues = [];
for (const m of marks) {
  if (m.kind === "doc") cues.push({ who: "doctor", text: m.text, in: map(m.t) - 0.45, out: map(m.t) - 0.45 + m.dur + 0.7 });
}
for (const l of plines) cues.push({ who: "patient", text: l.text, in: cueStart(l), out: cueStart(l) + l.dur + 0.3 });
cues.sort((a, b) => a.in - b.in);
console.log(`timeline: part2@${part2Start} segs=${JSON.stringify(tl.segs.map(x=>x.map(y=>Number(y.toFixed(1)))))} scorecard@${SC_START.toFixed(1)} total ${TOTAL.toFixed(1)}s`);

const SECTIONS = {
  "01-import":    ["Setup", "Your website builds your stations."],
  "02-personas":  ["Personas", "AI patients with real charts."],
  "03-voice":     ["Live voice", "Talk. Out loud."],
  "04-recep":     ["Receptivity", "A live read on the room."],
  "05-grades":    ["Letter grades", "Graded like it matters."],
  "06-rewrite":   ["The rewrite", "The line that costs you — and the fix."],
  "07-cards":     ["Flashcards", "Objections, drilled to reflex."],
  "08-frontdesk": ["Front desk", "The desk closes cases too."],
  "09-drills":    ["Assigned drills", "Homework for the whole team."],
  "10-progress":  ["Progress", "Proof in the real chair."],
};

rmSync("bg", { recursive: true, force: true });
mkdirSync("bg", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: "bg", size: { width: 1920, height: 1080 } } });
const page = await context.newPage();
await page.goto("http://localhost:3000/home", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => {
  const H1 = `font-family:var(--font-cabinet-grotesk),sans-serif;font-weight:700;letter-spacing:-.025em;line-height:1.06`;
  const EY = `font-family:var(--font-inter),sans-serif;font-weight:600;font-size:14px;letter-spacing:.28em;text-transform:uppercase`;
  const root = document.createElement("div");
  root.id = "__bg";
  root.style.cssText = `position:fixed;inset:0;z-index:2147483647;overflow:hidden;color:#E9F2F2;background:#06222A`;
  const st = document.createElement("style");
  st.textContent = `
    @keyframes dA{0%{transform:translate(-6%,-3%) scale(1)}50%{transform:translate(7%,4%) scale(1.12)}100%{transform:translate(-6%,-3%) scale(1)}}
    @keyframes dB{0%{transform:translate(5%,4%) scale(1.05)}50%{transform:translate(-7%,-5%) scale(1)}100%{transform:translate(5%,4%) scale(1.05)}}
    .gA{position:absolute;inset:-25%;background:radial-gradient(760px 540px at 34% 44%,rgba(46,196,165,.16),transparent 68%);animation:dA 19s ease-in-out infinite}
    .gB{position:absolute;inset:-25%;background:radial-gradient(1200px 800px at 62% 118%,rgba(16,112,127,.26),transparent 70%);animation:dB 24s ease-in-out infinite}`;
  document.head.appendChild(st);
  root.innerHTML = `
    <div id="title" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:1;transition:opacity .6s ease">
      <div style="${EY};color:#2EC4A5">Closer Clinic</div>
      <div style="${H1};font-size:92px;margin-top:24px">The case you already won.</div>
      <div style="font-family:var(--font-inter),sans-serif;font-size:24px;color:#8FB0B6;margin-top:24px">A demo for podiatry practices</div>
    </div>
    <div id="panel" style="position:absolute;left:140px;top:0;bottom:0;width:920px;display:flex;flex-direction:column;justify-content:center;opacity:0;transition:opacity .32s ease">
      <div id="who" style="${EY};color:#2EC4A5"></div>
      <div id="say" style="margin-top:20px;color:#EAF3F3"></div>
    </div>
    <div id="trans" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:0;transition:opacity .6s ease">
      <div style="${EY};color:#2EC4A5">Part two · a live encounter</div>
      <div style="${H1};font-size:76px;margin-top:24px;max-width:22ch">Shockwave, for a runner who's tried everything.</div>
      <div style="font-family:var(--font-inter),sans-serif;font-size:23px;color:#8FB0B6;margin-top:24px">ESWT · chronic Achilles tendinopathy · nothing scripted</div>
    </div>
    <div id="endcard" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:0;transition:opacity .6s ease">
      <div style="${H1};font-size:74px">Closer Clinic</div>
      <div id="e1" style="font-family:var(--font-inter),sans-serif;font-size:26px;color:#BCD2D5;margin-top:20px;opacity:0;transition:opacity .7s ease">Get the yes you already earned.</div>
      <div id="e2" style="width:0;height:2px;background:#2EC4A5;margin-top:32px;opacity:.75;transition:width 1.1s cubic-bezier(.22,1,.36,1)"></div>
    </div>`;
  const a = document.createElement("div"); a.className = "gA";
  const b = document.createElement("div"); b.className = "gB";
  root.prepend(b); root.prepend(a);
  document.body.appendChild(root);
});

const t0 = Date.now();
const until = async (s) => { const w = s * 1000 - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); };
const setPanel = (who, text, mode) => page.evaluate(({ who, text, mode }) => {
  const w = document.getElementById("who"), s = document.getElementById("say"), p = document.getElementById("panel");
  w.textContent = who; s.textContent = text;
  w.style.color = mode === "patient" ? "#2EC4A5" : mode === "doctor" ? "#8FB0B6" : "#2EC4A5";
  if (mode === "section" || mode === "report") {
    s.style.cssText = `margin-top:20px;color:#EAF3F3;font-family:var(--font-cabinet-grotesk),sans-serif;font-weight:700;font-size:54px;line-height:1.1;letter-spacing:-.02em`;
  } else {
    s.style.cssText = `margin-top:20px;color:#EAF3F3;font-family:var(--font-inter),sans-serif;font-weight:400;font-size:31px;line-height:1.5`;
  }
  p.style.opacity = "1";
}, { who, text, mode });
const hidePanel = () => page.evaluate(() => { document.getElementById("panel").style.opacity = "0"; });

// title out
await until(slots[0].len - 0.6);
await page.evaluate(() => { document.getElementById("title").style.opacity = "0"; });
// Part-1 lower-thirds
for (const sl of slots) {
  if (!SECTIONS[sl.id]) continue;
  await until(sl.start + 0.15);
  const [ey, h] = SECTIONS[sl.id];
  await setPanel(ey, h, "section");
  await until(sl.start + sl.len - 0.5);
  await hidePanel();
}
// transition card
const tr = slots.find((s) => s.id === "11-part2");
await until(tr.start + 0.1);
await page.evaluate(() => { document.getElementById("trans").style.opacity = "1"; });
await until(tr.start + tr.len - 0.5);
await page.evaluate(() => { document.getElementById("trans").style.opacity = "0"; });
// Part-2 captions
for (const c of cues) {
  await until(c.in);
  await setPanel(c.who === "doctor" ? "Doctor" : "Patient", c.text, c.who);
  await until(Math.max(c.out, c.in + 1.2));
  await hidePanel();
}
// report beat
await until(SC_START + 0.8);
await setPanel("The report", "Graded, quoted, and rewritten.", "report");
await until(T_END - 0.7);
await hidePanel();
// end card
await until(T_END);
await page.evaluate(() => { document.getElementById("endcard").style.opacity = "1"; });
await until(T_END + 1.2);
await page.evaluate(() => { document.getElementById("e1").style.opacity = "1"; });
await until(T_END + 2.4);
await page.evaluate(() => { document.getElementById("e2").style.width = "240px"; });
await until(TOTAL + 0.5);
await context.close(); await browser.close();
renameSync(`bg/${readdirSync("bg").find((f) => f.endsWith(".webm"))}`, "bg/track.webm");
console.log("bg track recorded");
