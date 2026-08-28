// Run an adaptive, genuinely strong rep: an "expert provider" reads each
// patient reply and answers it before advancing, so the scorecard we film is
// earned by the transcript rather than staged.
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync("/Users/hassanalkhalil/closer-clinic/.env.local", "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")])
);
const BASE = "http://localhost:3000";

const SYSTEM = `You are an expert podiatrist running a cash-pay case-acceptance conversation, being scored on: rapport (reflect the patient's own words), clinical framing (tie to THIS chart — 6mm thickened fascia on ultrasound, failed cortisone/orthotics/night splint — plus the consequence of waiting), price delivery (state "$600 for the three-session series" plainly, once, then stop talking), objection handling (ISOLATE the real objection with a question before answering), and the close (assumptive/alternative: offer two concrete options).

HARD RULES:
- ANSWER every question the patient actually asks, in their words, BEFORE advancing your agenda. Skipping a question is the single biggest scoring failure.
- One to three sentences. Spoken language, contractions. No lists, no lecturing.
- Never apologize for the price. Never offer an unprompted discount.
- Only attempt the close once the patient's stated concerns have been answered.
Return ONLY the provider's next spoken line.`;

async function providerLine(transcript) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 250,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Conversation so far:\n\n${transcript}\n\nYour next line:`,
      }],
    }),
  });
  const data = await res.json();
  return (data.content?.[0]?.text ?? "").trim().replace(/^["“]|["”]$/g, "");
}

const start = await fetch(`${BASE}/api/encounters`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scenarioSlug: "shockwave-plantar-fasciitis", difficulty: "moderate" }),
}).then((r) => r.json());

const id = start.encounterId;
let transcript = `PATIENT: ${start.patient}`;
console.log("PATIENT:", start.patient.slice(0, 110));

for (let turn = 0; turn < 7; turn++) {
  const line = await providerLine(transcript);
  transcript += `\nPROVIDER: ${line}`;
  console.log("\nPROVIDER:", line.slice(0, 140));
  const res = await fetch(`${BASE}/api/encounters/${id}/turn`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: line }),
  });
  const data = await res.json();
  if (!res.ok) { console.log("turn error", res.status, JSON.stringify(data).slice(0, 120)); break; }
  transcript += `\nPATIENT: ${data.patient}`;
  console.log("PATIENT:", data.patient.slice(0, 140), `[receptivity ${data.receptivity}]`);
  if (data.receptivity >= 88 && turn >= 3) break; // they're booking — stop selling
}

await fetch(`${BASE}/api/encounters/${id}/grade`, { method: "POST" });
const html = await fetch(`${BASE}/scorecard/${id}`).then((r) => r.text());
const total = (html.match(/(\d+)<span class="[^"]*">\/100/) || [])[1];
const scores = [...html.matchAll(/>(\d+)<span class="text-muted">\/20/g)].map((m) => m[1]);
console.log(`\n=> ${id}  total ${total}  scores ${scores.join(",")}  closed=${/Closed/.test(html)}  rewrite=${/The better line/.test(html)}`);
const rw = (html.match(/The better line<\/div>[\s\S]*?&ldquo;([^&]+)&rdquo;/) || [])[1] || "";
const dirty = /\[(pause|beat|laughs?|sighs?|smiles?)\]/i.test(rw);
console.log("rewrite:", rw.slice(0, 150));
console.log(dirty ? "ARTIFACT — rejecting this rep" : "clean rewrite");
if (dirty) process.exit(3);
writeFileSync("good-rep.json", JSON.stringify({ repId: id, total, scores }, null, 2));
