// Film the walkthrough as one continuous take, driven to a fixed timeline so
// the narration lines up without cutting. The only measured (not assumed)
// moment is when the patient's voice actually starts.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, renameSync, readdirSync } from "node:fs";

const demo = JSON.parse(readFileSync("demo.json", "utf8"));
const BASE = "http://localhost:3000";
const W = 390, H = 844;

mkdirSync("raw", { recursive: true });

const browser = await chromium.launch({
  args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars", "--force-prefers-reduced-motion=false"],
});
const context = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: "raw", size: { width: W, height: H } },
  colorScheme: "light",
});
const page = await context.newPage();

// Keep the dev overlay and scrollbars out of the frame.
const CHROME_HIDE = `
  nextjs-portal, #__next-build-watcher, [data-nextjs-toast] { display: none !important; }
  ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
  * { scrollbar-width: none !important; }
`;
await page.addInitScript((css) => {
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  });
}, CHROME_HIDE);

const t0 = Date.now();
const marks = {};
const el = () => (Date.now() - t0) / 1000;
const mark = (name) => { marks[name] = Number(el().toFixed(2)); console.log(`  ${marks[name]}s  ${name}`); };
async function until(sec) {
  const wait = sec * 1000 - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
}

/** Full-bleed brand card injected into the app's own document (real fonts). */
async function card(html, ms = 500) {
  await page.evaluate(({ html, ms }) => {
    document.getElementById("__cc_card")?.remove();
    const d = document.createElement("div");
    d.id = "__cc_card";
    d.style.cssText = `position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;
      align-items:center;justify-content:center;text-align:center;padding:0 40px;
      background:radial-gradient(120% 70% at 50% 0%, rgba(46,196,165,.10), transparent 60%), #0A3540;
      color:#E9F2F2;opacity:0;transition:opacity ${ms}ms ease;`;
    d.innerHTML = html;
    document.body.appendChild(d);
    requestAnimationFrame(() => { d.style.opacity = "1"; });
  }, { html, ms });
}
async function clearCard(ms = 500) {
  await page.evaluate((ms) => {
    const d = document.getElementById("__cc_card");
    if (!d) return;
    d.style.transition = `opacity ${ms}ms ease`;
    d.style.opacity = "0";
    setTimeout(() => d.remove(), ms + 60);
  }, ms);
}
/** Eased scroll so the roster glides rather than jumps. */
async function glide(px, ms) {
  await page.evaluate(({ px, ms }) => new Promise((done) => {
    const start = window.scrollY, t = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t) / ms);
      window.scrollTo(0, start + px * (1 - Math.pow(1 - p, 3)));
      p < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  }), { px, ms });
}

// ------------------------------------------------- 0.0  stations, pre-armed
// The full-frame title card covers 0–2.5s, so the phone opens straight onto
// the product instead of holding a second static title.
await page.goto(`${BASE}/home`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  const s = document.createElement("style");
  s.textContent = `@keyframes ccIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
    .cc-stagger > div{animation:ccIn .5s cubic-bezier(.22,1,.36,1) both}`;
  document.head.appendChild(s);
});
mark("open");

// ------------------------------------------------- 2.5  the roster, in motion
await until(2.3);
await page.evaluate(() => {
  // stagger the station cards in as the title card clears
  const list = [...document.querySelectorAll("div")].find(
    (d) => d.children.length > 3 && d.querySelector("button")?.textContent?.includes("$")
  );
  if (!list) return;
  list.classList.add("cc-stagger");
  [...list.children].forEach((c, i) => (c.style.animationDelay = `${i * 90}ms`));
});
mark("rosterIn");

// hold on the three stations the pitch names, rather than a static list
// warm the session encounter now — the POST includes an opener model call,
// so doing it here keeps the 23.0s cut instant (clock still reads ~0:13)
const freshPromise = page.evaluate(async () => {
  const r = await fetch("/api/encounters", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioSlug: "shockwave-plantar-fasciitis", difficulty: "moderate" }),
  });
  return (await r.json()).encounterId;
});

await until(6.0);  await glide(150, 1500);   // Shockwave series
await until(9.0);  await glide(170, 1600);   // Laser nail fungus program
await until(12.2); await glide(190, 1700);   // Insurance objection
await until(15.4); await glide(210, 2000);   // the rest of the roster
await until(17.8); await glide(-720, 1900);  // back to the top
mark("rosterScrolled");

// ------------------------------------------------------- 20.0 launch sheet
await until(20.0);
await page.locator("button").filter({ hasText: "Shockwave series" }).first().click();
await page.waitForTimeout(350);
mark("sheetOpen");
await page.getByRole("button", { name: /start rep/i }).hover().catch(() => {});

await until(23.0);
const fresh = await freshPromise;
await page.goto(`${BASE}/encounter/${fresh}`, { waitUntil: "networkidle" });
mark("sessionEnter");

// patient speaks the opener — orb goes live, PATIENT SPEAKING pulses
await until(23.2);
await page.mouse.click(W / 2, 150);
await page.getByText("Patient speaking", { exact: false })
  .waitFor({ state: "visible", timeout: 4000 }).catch(() => {});
mark("patientSpeak");

// provider types (continuous motion), then the price lands and draws pushback
await until(24.2);
await page.locator("textarea").click();
await page.locator("textarea").type(
  "Your ultrasound shows 6mm of thickening — the series is $600.",
  { delay: 20 }
);
mark("typed");
await until(25.9);
await page.keyboard.press("Enter");          // → responding dots, then the objection
mark("sent");
await page.getByText("Patient responding", { exact: false })
  .waitFor({ state: "hidden", timeout: 6000 }).catch(() => {});
mark("objection");                            // receptivity dips, turns decrement

// --------------------------------------------------------- 33.5 scorecard
await until(33.0);
await page.goto(`${BASE}/scorecard/${demo.repId}?demo=1`, { waitUntil: "networkidle" });
mark("scorecardEnter");
await until(36.0); await glide(240, 2200);   // sub-scores
await until(39.0); await glide(260, 2200);   // receptivity chart
await until(42.0); await glide(280, 2300);   // the moment
await until(45.0); await glide(240, 2200);   // the rewrite cards
await until(47.6); await glide(130, 1500);

// ---------------------------------------------------------- 49.4 progress
await until(49.0);
await page.goto(`${BASE}/progress?window=30&demo=1`, { waitUntil: "networkidle" });
mark("progressEnter");
await until(50.4); await glide(110, 1600);
await until(52.4); await glide(120, 1700);
await until(54.0); await glide(70, 1200);

await until(60.0);
mark("end");

await context.close();
await browser.close();

const file = readdirSync("raw").find((f) => f.endsWith(".webm"));
renameSync(`raw/${file}`, "raw/walkthrough.webm");
writeFileSync("marks.json", JSON.stringify(marks, null, 2));
console.log("\nrecorded raw/walkthrough.webm");
