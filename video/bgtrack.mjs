// Render the whole background layer — branded ground, timed captions, and the
// full-frame open/close — as ONE recorded track, so the final composite only
// has to overlay the phone. CSS does the easing; JS drives exact timing.
import { chromium } from "playwright";
import { renameSync, readdirSync, mkdirSync, rmSync } from "node:fs";

rmSync("bg", { recursive: true, force: true });
mkdirSync("bg", { recursive: true });

const URL_LINE = process.env.CC_VIDEO_URL ?? "";   // Fix 3: set CC_VIDEO_URL to show a domain

const CAPS = [
  ["Built for the room", "The conversation that decides the case.", 10.2, 13.3],
  ["Your roster", "Your services. Your prices.", 13.5, 19.8],
  ["Step in", "Walk into the room and talk.", 20.3, 24.6],
  ["Real pushback", "An AI patient who argues back — out loud.", 24.9, 33.2],
  ["Scored on evidence", "Graded on the five things that decide a case.", 34.1, 43.9],
  ["The fix", "The line that cost you. And the one that wins it.", 44.2, 49.5],
  ["Proof", "Then it follows you into the real chair.", 49.8, 55.0],
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: "bg", size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
// load the app first so Cabinet Grotesk / Inter are available, then dress the page
await page.goto("http://localhost:3000/home", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

await page.evaluate(({ caps, URL_LINE }) => {
  const H1 = `font-family:var(--font-cabinet-grotesk),sans-serif;font-weight:700;letter-spacing:-.025em;line-height:1.04`;
  const EY = `font-family:var(--font-inter),sans-serif;font-weight:600;font-size:15px;letter-spacing:.30em;text-transform:uppercase;color:#2EC4A5`;
  const root = document.createElement("div");
  root.id = "__bg";
  root.style.cssText = `position:fixed;inset:0;z-index:2147483647;overflow:hidden;color:#E9F2F2;
    background:#06222A;`;
  // Two slow-drifting glows keep the ground alive — no frame is ever a freeze,
  // and it reads as depth rather than motion.
  const drift = document.createElement("style");
  drift.textContent = `
    @keyframes ccDriftA{0%{transform:translate(-6%,-3%) scale(1)}50%{transform:translate(7%,4%) scale(1.12)}100%{transform:translate(-6%,-3%) scale(1)}}
    @keyframes ccDriftB{0%{transform:translate(5%,4%) scale(1.05)}50%{transform:translate(-7%,-5%) scale(1)}100%{transform:translate(5%,4%) scale(1.05)}}
    .cc-glowA{position:absolute;inset:-25%;background:radial-gradient(760px 540px at 34% 44%, rgba(46,196,165,.16), transparent 68%);animation:ccDriftA 19s ease-in-out infinite}
    .cc-glowB{position:absolute;inset:-25%;background:radial-gradient(1200px 800px at 62% 118%, rgba(16,112,127,.26), transparent 70%);animation:ccDriftB 24s ease-in-out infinite}`;
  document.head.appendChild(drift);
  const gA = document.createElement("div"); gA.className = "cc-glowA";
  const gB = document.createElement("div"); gB.className = "cc-glowB";
  root.innerHTML = `
    <div id="title" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
         justify-content:center;text-align:center;opacity:1;transition:opacity .6s ease">
      <div style="${EY}">Closer Clinic</div>
      <div style="${H1};font-size:96px;margin-top:26px">The case you already won.</div>
      <div style="font-family:var(--font-inter),sans-serif;font-size:25px;color:#8FB0B6;margin-top:24px">
        Practice the conversation that decides it.</div>
    </div>
    <div id="endcard" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
         justify-content:center;text-align:center;opacity:0;transition:opacity .6s ease">
      <div style="${H1};font-size:78px">Closer Clinic</div>
      <div id="endline" style="font-family:var(--font-inter),sans-serif;font-size:27px;color:#BCD2D5;
           margin-top:20px;opacity:0;transition:opacity .7s ease">Get the yes you already earned.</div>
      <div id="endrule" style="width:0;height:2px;background:#2EC4A5;margin-top:34px;opacity:.75;
           transition:width 1.1s cubic-bezier(.22,1,.36,1)"></div>
      <div id="endurl" style="font-family:var(--font-inter),sans-serif;font-size:20px;color:#2EC4A5;
           margin-top:44px;letter-spacing:.05em;opacity:0;transition:opacity .8s ease">${URL_LINE}</div>
    </div>
    ${caps.map((c, i) => `
      <div id="cap${i}" style="position:absolute;left:150px;top:0;bottom:0;width:900px;display:flex;
           flex-direction:column;justify-content:center;opacity:0;transform:translateY(14px);
           transition:opacity .35s ease, transform .5s cubic-bezier(.22,1,.36,1)">
        <div style="${EY}">${c[0]}</div>
        <div style="${H1};font-size:62px;margin-top:22px">${c[1]}</div>
      </div>`).join("")}`;
  root.prepend(gB); root.prepend(gA);
  document.body.appendChild(root);
}, { caps: CAPS, URL_LINE });

const t0 = Date.now();
const until = async (s) => {
  const w = s * 1000 - (Date.now() - t0);
  if (w > 0) await page.waitForTimeout(w);
};
const set = (id, on) =>
  page.evaluate(({ id, on }) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.style.opacity = on ? "1" : "0";
    e.style.transform = on ? "translateY(0)" : "translateY(14px)";
  }, { id, on });

await until(2.0);
await set("title", false);   // product on screen by 2.5s
for (let i = 0; i < CAPS.length; i++) {
  const [, , a, b] = CAPS[i];
  await until(a);
  await set(`cap${i}`, true);
  await until(b);
  await set(`cap${i}`, false);
}
await until(55.2);
await set("endcard", true);
// stage the URL so the close isn't a frozen frame
await until(56.3);
await page.evaluate(() => { document.getElementById("endline").style.opacity = "1"; });
await until(57.4);
await page.evaluate(() => { document.getElementById("endrule").style.width = "220px"; });
await until(58.6);
await page.evaluate(() => { document.getElementById("endurl").style.opacity = "1"; });
await until(60.5);

await context.close();
await browser.close();
const f = readdirSync("bg").find((x) => x.endsWith(".webm"));
renameSync(`bg/${f}`, "bg/track.webm");
console.log("background track recorded → bg/track.webm");
