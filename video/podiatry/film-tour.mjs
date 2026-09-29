// Part 1: the section tour, one continuous phone take timed to slots.json.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, renameSync, readdirSync, rmSync } from "node:fs";
const { slots } = JSON.parse(readFileSync("slots.json", "utf8"));
const S = Object.fromEntries(slots.map((s) => [s.id, s]));
const BASE = "http://localhost:3000";
const W = 390, H = 844;
rmSync("rawtour", { recursive: true, force: true });
mkdirSync("rawtour", { recursive: true });

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"] });
const context = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: "rawtour", size: { width: W, height: H } },
  colorScheme: "light",
});
const page = await context.newPage();
await page.addInitScript(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = `nextjs-portal,[data-nextjs-toast]{display:none!important}
      ::-webkit-scrollbar{width:0!important;height:0!important}*{scrollbar-width:none!important}`;
    document.head.appendChild(s);
  });
});
const t0 = Date.now();
const until = async (s) => { const w = s * 1000 - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); };
const glide = (px, ms) => page.evaluate(({ px, ms }) => new Promise((done) => {
  const s0 = window.scrollY, t = performance.now();
  const step = (n) => { const p = Math.min(1, (n - t) / ms); window.scrollTo(0, s0 + px * (1 - Math.pow(1 - p, 3))); p < 1 ? requestAnimationFrame(step) : done(); };
  requestAnimationFrame(step);
}), { px, ms });

// find a seeded graded rep for the scorecard beats
await page.goto(`${BASE}/progress?window=30`, { waitUntil: "networkidle" });
const repId = await page.evaluate(async () => {
  const h = await fetch("/progress?window=30").then((r) => r.text());
  const m = h.match(/\/scorecard\/([0-9a-f-]{36})/);
  return m ? m[1] : null;
});
console.log("seeded rep:", repId);

// 01 — URL onboarding
await page.goto(`${BASE}/import`, { waitUntil: "networkidle" });
await until(S["01-import"].start + 1.0);
const urlBox = page.locator("input").first();
await urlBox.click().catch(() => {});
await urlBox.type("yourclinic.com", { delay: 90 }).catch(() => {});

// 02 — roster + launch sheet (personas); also pre-create the orb encounter
const orbPromise = page.evaluate(async () => {
  const r = await fetch("/api/encounters", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioSlug: "shockwave-achilles", difficulty: "moderate" }),
  });
  return (await r.json()).encounterId;
});
await until(S["02-personas"].start);
await page.goto(`${BASE}/home`, { waitUntil: "networkidle" });
await glide(180, 1400);
await until(S["02-personas"].start + 3.4);
await page.locator("button").filter({ hasText: "Shockwave — Achilles" }).first().click().catch(() => {});

// 03 — live voice (orb speaks the opener)
await until(S["03-voice"].start);
const orbId = await orbPromise;
await page.goto(`${BASE}/encounter/${orbId}`, { waitUntil: "networkidle" });
await page.mouse.click(W / 2, 150);
await page.getByText("Patient speaking", { exact: false }).waitFor({ state: "visible", timeout: 5000 }).catch(() => {});

// 04 — receptivity gauge (top of the session screen)
await until(S["04-recep"].start);
await glide(-200, 900);

// 05 — letter grades
await until(S["05-grades"].start);
await page.goto(`${BASE}/scorecard/${repId}?demo=1`, { waitUntil: "networkidle" });
await page.waitForTimeout(600); await glide(150, 1800);

// 06 — rewrites
await until(S["06-rewrite"].start);
await glide(620, 1900);
await until(S["06-rewrite"].start + 4.0); await glide(160, 1200);

// 07 — objection cards (flip one)
await until(S["07-cards"].start);
await page.goto(`${BASE}/train/cards`, { waitUntil: "networkidle" });
await until(S["07-cards"].start + 2.2);
await page.mouse.click(W / 2, 420);
await until(S["07-cards"].start + 5.4);
await page.mouse.click(W / 2, 420);

// 08 — front desk stations
await until(S["08-frontdesk"].start);
await page.goto(`${BASE}/home`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /front desk/i }).first().click().catch(() => {});
await page.waitForTimeout(400); await glide(120, 1300);

// 09 — assigned drills
await until(S["09-drills"].start);
await page.evaluate(() => {
  const el = [...document.querySelectorAll("div,section")].find((d) => /Assigned/.test(d.textContent ?? "") && d.getBoundingClientRect().height < 600);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
});

// 10 — progress
await until(S["10-progress"].start);
await page.goto(`${BASE}/progress?window=30&demo=1`, { waitUntil: "networkidle" });
await page.waitForTimeout(700); await glide(200, 1800);
await until(S["10-progress"].start + 6.0); await glide(180, 1500);

await until(S["11-part2"].start + 0.5);   // phone is under the full-frame card by now
await context.close(); await browser.close();
renameSync(`rawtour/${readdirSync("rawtour").find((f) => f.endsWith(".webm"))}`, "rawtour/tour.webm");
writeFileSync("tour-meta.json", JSON.stringify({ repId }, null, 2));
console.log("tour recorded → rawtour/tour.webm");
