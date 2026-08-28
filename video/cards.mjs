// Render the full-frame cards and side captions as 1920x1080 PNGs, using the
// app's own document so Cabinet Grotesk / Inter render exactly as in product.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("cards", { recursive: true });
const BG = `radial-gradient(900px 620px at 34% 44%, rgba(46,196,165,.11), transparent 70%),
            radial-gradient(1500px 950px at 60% 125%, rgba(16,112,127,.18), transparent 70%), #06222A`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:3000/home", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

async function shot(name, inner) {
  await page.evaluate(({ inner, BG }) => {
    document.getElementById("__frame")?.remove();
    const d = document.createElement("div");
    d.id = "__frame";
    d.style.cssText = `position:fixed;inset:0;z-index:2147483647;background:${BG};
      color:#E9F2F2;font-family:var(--font-inter),sans-serif;overflow:hidden;`;
    d.innerHTML = inner;
    document.body.appendChild(d);
  }, { inner, BG });
  await page.waitForTimeout(140);
  await page.screenshot({ path: `cards/${name}.png` });
}

const H1 = `font-family:var(--font-cabinet-grotesk),sans-serif;font-weight:700;letter-spacing:-.025em;line-height:1.04`;
const EYEBROW = `font-family:var(--font-inter),sans-serif;font-weight:600;font-size:15px;
  letter-spacing:.30em;text-transform:uppercase;color:#2EC4A5`;

// ---- full-frame open / close ----
await shot("title", `
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
              justify-content:center;text-align:center">
    <div style="${EYEBROW}">Closer Clinic</div>
    <div style="${H1};font-size:96px;margin-top:26px">The case you already won.</div>
    <div style="font-size:25px;color:#8FB0B6;margin-top:24px">Practice the conversation that decides it.</div>
  </div>`);

await shot("end", `
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
              justify-content:center;text-align:center">
    <div style="${H1};font-size:78px">Closer Clinic</div>
    <div style="font-size:27px;color:#BCD2D5;margin-top:20px">Get the yes you already earned.</div>
    <div style="font-size:20px;color:#2EC4A5;margin-top:44px;letter-spacing:.05em">closer-clinic.vercel.app</div>
  </div>`);

// ---- left-hand captions (phone lives on the right) ----
const CAPS = [
  ["cap1", "Built for the room", "The conversation that decides the case."],
  ["cap2", "Your roster", "Your services. Your prices."],
  ["cap3", "Step in", "Walk into the room and talk."],
  ["cap4", "Real pushback", "An AI patient who argues back — out loud."],
  ["cap5", "Scored on evidence", "Graded on the five things that decide a case."],
  ["cap6", "The fix", "The line that cost you. And the one that wins it."],
  ["cap7", "Proof", "Then it follows you into the real chair."],
];
for (const [name, eyebrow, headline] of CAPS) {
  await shot(name, `
    <div style="position:absolute;left:150px;top:0;bottom:0;width:900px;display:flex;
                flex-direction:column;justify-content:center">
      <div style="${EYEBROW}">${eyebrow}</div>
      <div style="${H1};font-size:62px;margin-top:22px">${headline}</div>
    </div>`);
}
await shot("plain", "");

await browser.close();
console.log("cards rendered:", ["title", "end", ...CAPS.map((c) => c[0]), "plain"].join(", "));
