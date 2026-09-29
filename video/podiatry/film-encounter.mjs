// Part 2: a live ESWT encounter where BOTH sides speak.
// Doctor lines: adaptive model → Brian TTS, generated during the patient's
// previous line. The /turn response is fetched in parallel but only delivered
// once the doctor's audio window has elapsed, so replies land on the beat.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, renameSync, readdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
const env = Object.fromEntries(
  readFileSync("/Users/hassanalkhalil/closer-clinic/.env.local", "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const BASE = "http://localhost:3000";
const W = 390, H = 844, MAX_TURNS = 8;   // close mode starts at turn 5; we end on acceptance
const DOC_VOICE = "nPczCjzI2devNBz1zQrb"; // Brian — matches the narrator

const SYSTEM = `You are a podiatrist recommending extracorporeal shockwave therapy (ESWT) to a patient with chronic mid-portion Achilles tendinopathy: late-40s recreational runner, ~6 months of pain, already failed rest, NSAIDs, heel lifts, and a full PT course with eccentric loading. Exam: tender fusiform thickening above the insertion. This is degenerative tendinosis.

WHAT YOU KNOW AND SAY HONESTLY WHEN RELEVANT:
- Plain-language mechanism: focused sound-wave pulses that trigger the body's own repair response in a tendon that has stopped healing on its own. No needles, no downtime; sessions take about 15 minutes.
- Fit: it's the guideline next step precisely BECAUSE conservative care failed; you didn't offer it first because most people get better with the basics, and they did those properly.
- Realistic expectations: usually 3 to 5 weekly sessions; improvement builds over weeks to months after the course; meaningful improvement in roughly two out of three patients — and you say plainly it is NOT guaranteed.
- Steroid injections near the Achilles are avoided (rupture risk).
- Coverage: most insurers class ESWT as investigational, so it is cash-pay — say that straight, don't apologize for it.
- State the price a single time, plainly, without apologizing, and do not repeat it unprompted: "$250 a session. If you'd rather commit to the first three up front, it's $675."
- If accused of selling: no defensiveness — the exam and their failed-treatment history drive the recommendation, not the machine; it's completely fine to say no, and surgery is not on the table today either way.
- On "let me think about it": isolate what they'd be weighing, answer it, then offer a zero-pressure close: hold a slot for next week, cancel any time, no charge.
- End by asking for the booking with an alternative close (two concrete times).

TURN BUDGET: you have at most six turns, so move briskly — empathy and mechanism can share a turn; never spend a whole turn on rapport alone.

HARD RULES: never guarantee, never say "cure", never invent numbers beyond the two-thirds figure, never pressure. Never voice coaching or sales-training language ("said once", "the ask", "the close") — the patient must only ever hear things a doctor would actually say. ONE to TWO SHORT spoken sentences per turn, under 160 characters total — this is out-loud dialogue, contractions, warm and unhurried. Answer their actual question before advancing. Return ONLY the doctor's next spoken line.`;

const CLOSE_NUDGE = `\n\nCLOSE MODE: answer their last point in ONE short honest sentence (if they quote internet success numbers, give the real two-out-of-three figure without dismissing them), then ask for the booking with the zero-pressure hold — a slot they can cancel any time at no charge — and two concrete times (Tuesday morning or Thursday afternoon). No new topics.`;

async function rfetch(url, opts, tries = 4) {
  for (let a = 0; a < tries; a++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(45000) });
      if (r.status >= 500 && a < tries - 1) { await new Promise((z) => setTimeout(z, 3000 * (a + 1))); continue; }
      return r;
    } catch (e) { if (a === tries - 1) throw e; await new Promise((z) => setTimeout(z, 3000 * (a + 1))); }
  }
}
async function doctorLine(transcript, extra = "") {
  for (let attempt = 0; attempt < 3; attempt++) {
    const nag = attempt === 0 ? "" : "\n\nYour previous draft was too long. Say it again in UNDER 150 characters.";
    const r = await rfetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 220, system: SYSTEM + extra,
        messages: [{ role: "user", content: `Conversation so far:\n\n${transcript}\n\nYour next line:${nag}` }] }),
    }).then((x) => x.json());
    const line = (r.content?.[0]?.text ?? "").trim().replace(/^["“]|["”]$/g, "");
    const prices = line.match(/\$\s?[\d,]+/g) ?? [];
    const priceOk = prices.every((x) => ["$250", "$675"].includes(x.replace(/\s/g, "")));
    if (priceOk && line.length <= (extra ? 300 : 185)) return line;
  }
  return null;
}
async function tts(text, file) {
  const r = await rfetch(`https://api.elevenlabs.io/v1/text-to-speech/${DOC_VOICE}?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`tts ${r.status}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  return Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${file}`).toString().trim());
}

rmSync("rawenc", { recursive: true, force: true });
mkdirSync("rawenc", { recursive: true });
mkdirSync("da", { recursive: true });

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"] });
const context = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: "rawenc", size: { width: W, height: H } },
  colorScheme: "light",
});
const page = await context.newPage();
await page.addInitScript(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = `nextjs-portal,[data-nextjs-toast]{display:none!important}
      ::-webkit-scrollbar{width:0!important;height:0!important}*{scrollbar-width:none!important}
      textarea{color:transparent!important;caret-color:transparent!important}`;
    document.head.appendChild(s);
  });
});

// Deliver /turn responses only after the doctor's audio window has elapsed.
let holdUntil = 0;
let lastReply = null;
await page.route("**/api/encounters/*/turn", async (route) => {
  const resp = await route.fetch();                    // server thinks in parallel
  try { lastReply = JSON.parse(await resp.text()); } catch { lastReply = null; }
  const wait = holdUntil - Date.now();
  if (wait > 0) await new Promise((s) => setTimeout(s, wait));
  await route.fulfill({ response: resp, body: JSON.stringify(lastReply) });
});

let enc;
for (let roll = 0; roll < 12; roll++) {
  enc = await (await fetch(`${BASE}/api/encounters`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioSlug: "shockwave-achilles", difficulty: "moderate" }),
  })).json();
  console.log(`roll ${roll}: opener ${enc.patient.length} chars`);
  if (enc.patient.length <= 240) break;
}
console.log("encounter:", enc.encounterId);

const t0 = Date.now();
const el = () => Number(((Date.now() - t0) / 1000).toFixed(2));
const marks = [];
const note = (kind, extra = {}) => { const m = { t: el(), kind, ...extra }; marks.push(m); console.log(`  ${m.t}s  ${kind}`); return m; };
const speaking = page.getByText("Patient speaking", { exact: false });

await page.goto(`${BASE}/encounter/${enc.encounterId}`, { waitUntil: "networkidle" });
note("sessionEnter");
await page.waitForTimeout(900);
await page.mouse.click(W / 2, 120);
await speaking.waitFor({ state: "visible", timeout: 9000 }).catch(() => {});
note("say", { who: "patient", text: enc.patient });

const accepted = (text, recep) => {
  if (typeof recep === "number" && recep >= 84) return true;
  return /\b(book (me|it)|hold (the|that|a) (spot|slot)|let'?s do (it|tuesday|thursday)|sign me up|i'?m in\b|tuesday (morning )?works|thursday (afternoon )?works|see you (then|tuesday|thursday)|schedule (it|me)|put me down)\b/i.test(text) && !/\b(but|though|however)\b/i.test(text.slice(-80));
};
let transcript = `PATIENT: ${enc.patient}`;
for (let turn = 0; turn < MAX_TURNS; turn++) {
  // think + record the doctor's voice while the patient is still talking
  const prep = (async () => {
    const line = await doctorLine(transcript, turn >= 5 ? CLOSE_NUDGE : "");
    const dur = await tts(line, `da/d${turn}.mp3`);
    return { line, dur };
  })();
  await speaking.waitFor({ state: "hidden", timeout: 90000 }).catch(() => {});
  note("endSay", { who: "patient" });
  const { line, dur } = await prep;
  if (!line) { console.log("no usable doctor line — aborting"); process.exit(2); }
  transcript += `\nDOCTOR: ${line}`;

  await page.waitForTimeout(650);
  holdUntil = Date.now() + Math.round((dur + 0.45) * 1000) + 650;
  const box = page.locator("textarea");
  await box.click();
  await box.fill(line);
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  note("doc", { who: "doctor", text: line, dur, file: `da/d${turn}.mp3` });

  await page.getByText("Patient responding", { exact: false }).waitFor({ state: "hidden", timeout: 90000 }).catch(() => {});
  const last = lastReply?.patient ?? "";
  const recep = lastReply?.receptivity ?? null;
  transcript += `\nPATIENT: ${last}`;
  await speaking.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  note("say", { who: "patient", text: last, receptivity: recep });
  if (turn >= 3 && accepted(last, recep)) { console.log("  → patient accepted (receptivity " + recep + ")"); break; }
}
await speaking.waitFor({ state: "hidden", timeout: 90000 }).catch(() => {});
note("endSay", { who: "patient" });
await page.waitForTimeout(900);

// end the session for real — the grading state is part of the footage
await page.getByRole("button", { name: /end session/i }).click();
note("endClick");
await page.waitForURL(/\/scorecard\//, { timeout: 120000 });
note("scorecard");
await page.waitForTimeout(2800);
const glide = (px, ms) => page.evaluate(({ px, ms }) => new Promise((done) => {
  const s0 = window.scrollY, t = performance.now();
  const step = (n) => { const p = Math.min(1, (n - t) / ms); window.scrollTo(0, s0 + px * (1 - Math.pow(1 - p, 3))); p < 1 ? requestAnimationFrame(step) : done(); };
  requestAnimationFrame(step);
}), { px, ms });
await glide(260, 2200); await page.waitForTimeout(1500);
await glide(300, 2300); await page.waitForTimeout(1500);
await glide(300, 2300); await page.waitForTimeout(2400);
note("end");

await context.close(); await browser.close();
renameSync(`rawenc/${readdirSync("rawenc").find((f) => f.endsWith(".webm"))}`, "rawenc/encounter.webm");
writeFileSync("enc-meta.json", JSON.stringify({ id: enc.encounterId, marks }, null, 2));
console.log("\nencounter filmed → rawenc/encounter.webm");
