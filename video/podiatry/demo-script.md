# Closer Clinic — Podiatry Shockwave Demo Script

Video: `demo-podiatry-shockwave.mp4` · narrator + doctor voice: ElevenLabs "Brian" (`nPczCjzI2devNBz1zQrb`) · patient voice: the encounter's pinned app voice.

## Price placeholders

| Placeholder | Value spoken in this cut | Where to change |
|---|---|---|
| `[PRICE_PER_SESSION]` | **$250** | 1. `lib/scenarios.ts` → `shockwave-achilles` → `priceDisplay`/`priceStructure` 2. the doctor system prompt in `video/podiatry/film-encounter.mjs` |
| `[PACKAGE_PRICE]` | **$675** (first 3 sessions) | same two places |

To regenerate with new prices: edit both files, then re-run `film-encounter.mjs` → `patient-audio.mjs` → `bg.mjs` → `mix.mjs` → `comp.sh` → `verify.mjs` (dev server running, seeded). The encounter is live AI — the dialogue will differ take to take; the narration (below) is fixed.

## Part 1 — narration

- **00-title** (4.69s): This is Clozer Clinic. A flight simulator for the conversation that decides the case.
- **01-import** (6.32s): Setup starts with your website. It reads your services and your prices, and builds your training stations from them.
- **02-personas** (7.06s): Each station is a consult with an AI patient — a name, a history, an insurance plan, and an attitude.
- **03-voice** (5.06s): Then you walk into the room and talk. The patient answers out loud — and pushes back.
- **04-recep** (5.02s): The receptivity meter is a live read on the room. Overpromise, and you'll watch it drop.
- **05-grades** (5.29s): Every rep gets a letter grade, scored on the five skills that decide whether a case closes.
- **06-rewrite** (6.18s): It quotes the exact line that cost you — and the line that would have won it. You can hear both.
- **07-cards** (5.29s): Objection flashcards drill the answers your patients actually raise, until they're reflex.
- **08-frontdesk** (4.5s): The front desk trains here too — phone shoppers, deposits, and callbacks.
- **09-drills** (4.97s): Practice owners assign stations to the whole team, with a due date and a minimum grade.
- **10-progress** (5.53s): And it follows you into the real chair — close rate, streak, and the revenue you logged.
- **11-part2** (8.41s): Now watch one full encounter, start to finish. Shockwave therapy, for a runner who's tried everything else. The patient is AI — nothing is scripted.
- **12-end** (2.83s): Clozer Clinic. Get the yes you already earned.
- **13-report**: Thirty seconds later: the grade, the receptivity curve, and the exact line to say better next time.

> "Clozer" is the phonetic respelling that makes the voice model pronounce **Closer** correctly (as in *one who closes*). Keep it in any regenerated narration.

## Part 2 — the encounter (live AI, as filmed)

**Patient**: Well, it's about time — six months I've been dealing with this Achilles thing, and I've done everything your people told me to do. I heard you've got some kind of shockwave device now, so let's talk about that.

**Doctor**: You've been patient and you did the work — that actually matters here. Shockwave is exactly the right next step when the basics have been done right and haven't fixed it.

**Patient** *(receptivity 35)*: Okay, but — and I'm going to be straight with you — is this something you're recommending because it's actually right for me, or because you've got a machine sitting in the back that needs to pay for itself?

**Doctor**: Fair question. Your exam and your treatment history are what's driving this — if those didn't fit, I'd tell you to skip it.

**Patient** *(receptivity 35)*: Alright, so walk me through it — what exactly did you find on the exam that makes you think this is the right call for me specifically?

**Doctor**: You've got a tender, fusiform thickening right at mid-tendon — that's classic degenerative tendinosis, the exact pattern shockwave is designed to kick-start healing in.

**Patient** *(receptivity 45)*: Okay, that's... actually a straight answer, I'll give you that. So does my insurance cover any of this, or are you about to tell me I'm writing a check?

**Doctor**: Most insurers call it investigational, so yes — you're writing a check. [PRICE_PER_SESSION] a session, or [PACKAGE_PRICE] if you start with three. That's the number, said once.

**Patient** *(receptivity 45)*: [PRICE_PER_SESSION] a session... so we're talking, what, $750 to over a thousand dollars depending on how many I need? That's real money for something that might not work.

**Doctor**: Honest answer: it helps about two out of three people, and it's not guaranteed — that's exactly why I won't push you. Want me to hold a slot for next week — Tuesday morning or Thursday afternoon — cancel any time, no charge?

**Patient** *(receptivity 55)*: What are the actual odds it gets me running again specifically, given where I'm at with this thing?

**Doctor**: Two-thirds of patients with your exact picture get meaningful improvement — running included — but I can't promise you're in that group. Want to hold Tuesday morning or Thursday afternoon, cancel any time, no charge?

**Patient** *(receptivity 85)*: Thursday afternoon works — and I'll do the three-session package.

*(The doctor then ends the session; the scorecard that follows is this encounter's real grade.)*
