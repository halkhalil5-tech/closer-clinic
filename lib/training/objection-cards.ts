import type { ObjectionCard } from "../types";

/**
 * Podiatry objection card deck — seeded from the curriculum's objection
 * content (Modules 3–5 plays). Canonical source, same pattern as scenarios:
 * dev reads directly, the seed script upserts to the DB. A dental/med-spa
 * deck is another file of records with a different `specialty`.
 *
 * Back-of-card discipline: three lines max — isolate, reframe, close attempt.
 */
export const PODIATRY_OBJECTION_CARDS: ObjectionCard[] = [
  {
    id: "pod-price-alot",
    specialty: "podiatry",
    difficulty: "easy",
    front: "Six hundred dollars is... a lot of money.",
    back: {
      isolate: "“If the cost weren't a factor at all, would you want to do this?”",
      reframe: "“It is real money. Spread over the series it's $200 a session — and another year of these mornings isn't free either.”",
      close: "“Most patients run it on an HSA card. Let's get session one booked.”",
    },
  },
  {
    id: "pod-spouse",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "I need to talk to my husband before I spend that.",
    back: {
      isolate: "“As you should — what's he going to ask you?”",
      reframe: "“Let's arm you with real answers: the finding, why drugstore inserts fail, and what the $525 buys.”",
      close: "“Pencil Thursday — talk tonight, cancel with one text if it's a no.”",
    },
  },
  {
    id: "pod-insurance",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "Why wouldn't my insurance cover this if it actually works?",
    back: {
      isolate: "“Fair — is coverage the blocker, or are you unsure it works?”",
      reframe: "“Insurance covers managing symptoms. This treats the tissue itself — that's the part plans lag on.”",
      close: "“The question that matters: do you want it fixed? Then let's schedule.”",
    },
  },
  {
    id: "pod-think-about-it",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "Let me think about it and I'll call you next week.",
    back: {
      isolate: "“Of course — so I can be useful: is it the money, whether it works, or just not deciding today?”",
      reframe: "Whatever they name, answer THAT — fog isn't an objection, it's a hidden one.",
      close: "“Let's pencil a slot now; if the answer's no, cancel with a text.”",
    },
  },
  {
    id: "pod-cortisone-again",
    specialty: "podiatry",
    difficulty: "easy",
    front: "The cortisone shot helped for a while — can't we just do another one?",
    back: {
      isolate: "“We can — quick question: what happened after the last one wore off?”",
      reframe: "“Exactly. The shot calms inflammation; it never fixed the tissue. Shockwave rebuilds it — that's why results hold.”",
      close: "“Three sessions, three weeks, done. Want to start this week?”",
    },
  },
  {
    id: "pod-friend-anecdote",
    specialty: "podiatry",
    difficulty: "hard",
    front: "My neighbor did shockwave and said it was a total waste of money.",
    back: {
      isolate: "“Do you know if his case looked like yours?”",
      reframe: "“Your ultrasound shows exactly the pattern it treats — 70 to 80% of chronic cases like yours improve.”",
      close: "“Let's judge it on your foot, not his. Mornings or afternoons?”",
    },
  },
  {
    id: "pod-toenails-900",
    specialty: "podiatry",
    difficulty: "hard",
    front: "Nine hundred dollars? For toenails? That's insane.",
    back: {
      isolate: "“Is it the number, or paying anything at all for nails you've been hiding?”",
      reframe: "“Sessions are $150 — but singles rarely clear a nail. Six timed to nail growth is what works: $75 a month.”",
      close: "“Beach trip's in June. Start this month and you're done hiding. Book it?”",
    },
  },
  {
    id: "pod-vicks",
    specialty: "podiatry",
    difficulty: "easy",
    front: "My friend swears Vicks VapoRub cleared her toenail fungus.",
    back: {
      isolate: "“How long has yours been there, and how many nails?”",
      reframe: "“For one early nail, maybe. Four thickened nails with debris under the plate — topicals can't reach it.”",
      close: "“The program clears it as the nail grows out. Shall we start?”",
    },
  },
  {
    id: "pod-half-sessions",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "Can I just do a couple of the sessions and see how it goes?",
    back: {
      isolate: "“Totally fair to ask — is that about the cost, or hedging in case it doesn't work?”",
      reframe: "“Half the series is the one version I can't recommend — it costs money AND doesn't work.”",
      close: "“Do the real thing once. Full series, first session this week?”",
    },
  },
  {
    id: "pod-hurts",
    specialty: "podiatry",
    difficulty: "easy",
    front: "I read online that shockwave really hurts.",
    back: {
      isolate: "“Is that the main thing holding you back?”",
      reframe: "“It's intense pressure for a few minutes, dialed to your tolerance — most patients drive themselves home.”",
      close: "“Fifteen minutes of uncomfortable vs. another year of brutal mornings. Ready?”",
    },
  },
  {
    id: "pod-gabapentin",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "Can't I just stay on the gabapentin? It sort of works.",
    back: {
      isolate: "“It's an option — how's the fog at work been?”",
      reframe: "“'Sort of works' plus foggy days, forever. The laser targets the nerves' blood supply — most patients need less med.”",
      close: "“Six sessions, three weeks. Tuesdays or Fridays easier?”",
    },
  },
  {
    id: "pod-groupon",
    specialty: "podiatry",
    difficulty: "hard",
    front: "I saw a med spa doing laser for half your price on Groupon.",
    back: {
      isolate: "“Worth checking — do you know what machine and who's operating it?”",
      reframe: "“You're not buying laser minutes; you're buying the diagnosis, the protocol, and someone accountable for the result.”",
      close: "“I'd rather do it once, right. Want the first session on the books?”",
    },
  },
  {
    id: "pod-wait-and-see",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "I've lived with it this long — I might just wait and see.",
    back: {
      isolate: "“What made you come in now, after eight months?”",
      reframe: "“That reason doesn't go away by waiting. At 6mm this isn't the pattern that resolves on its own.”",
      close: "“Path one: same mornings next year. Path two: three weeks. Your call — which one?”",
    },
  },
  {
    id: "pod-vip-discount",
    specialty: "podiatry",
    difficulty: "hard",
    front: "I've been coming here for years — surely you can do better on price.",
    back: {
      isolate: "“I appreciate that history — is the price the only thing between you and yes?”",
      reframe: "“The price is real for everyone; that's exactly why you can trust the rest of what I tell you.”",
      close: "“What I can do is get you the best slot on the schedule. This week?”",
    },
  },
  {
    id: "pod-no-time",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "I don't have time for six appointments — my schedule is insane.",
    back: {
      isolate: "“If the visits fit your calendar, is this a yes?”",
      reframe: "“Each session is 20 minutes. Limping through twelve-hour days costs you more time than that.”",
      close: "“We do 7am and lunch slots — which survives your week better?”",
    },
  },
  {
    id: "pod-natural",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "I'd rather fix this naturally — I don't like interventions.",
    back: {
      isolate: "“Which natural approaches have you already given a real shot?”",
      reframe: "“You've done them — months of stretching and inserts. Shockwave IS your body healing; it just restarts the process.”",
      close: "“It's the least invasive thing left that works. Start next week?”",
    },
  },
  {
    id: "pod-second-opinion",
    specialty: "podiatry",
    difficulty: "hard",
    front: "I think I want a second opinion before spending that kind of money.",
    back: {
      isolate: "“Good instinct — what would you want them to double-check?”",
      reframe: "“Take your ultrasound with you — the 6mm reading travels. Any colleague will read it the same way.”",
      close: "“Let's pencil your start date; keep it if the second opinion agrees.”",
    },
  },
  {
    id: "pod-otc-inserts",
    specialty: "podiatry",
    difficulty: "easy",
    front: "The Dr. Scholl's inserts help for a couple weeks, so maybe I just need new ones.",
    back: {
      isolate: "“How many pairs have you been through this year?”",
      reframe: "“They cushion; yours collapse at the arch. Customs correct the collapse — that's why relief lasts years, not weeks.”",
      close: "“Casting takes ten minutes. Do it today while you're here?”",
    },
  },
  {
    id: "pod-payment-plan-fish",
    specialty: "podiatry",
    difficulty: "moderate",
    front: "Is that the best you can do on the price?",
    back: {
      isolate: "“The number's the number — is it in reach, or is something else giving you pause?”",
      reframe: "“I don't move the price, because it's real. What moves is timing and payment mechanics.”",
      close: "“HSA, CareCredit, or start after payday — which helps? Then let's book.”",
    },
  },
  {
    id: "pod-spouse-budget",
    specialty: "podiatry",
    difficulty: "hard",
    front: "We just don't have room in the budget this year. It's a no for now.",
    back: {
      isolate: "“Understood — is it truly the year, or would a smaller first step change it?”",
      reframe: "If it's a real, stable no: respect it the first time. Chart the indication, care inside the constraint (the $38 splint).",
      close: "“If you hit a morning you can't cross the room — that's the day you call.”",
    },
  },
];

/** Random N-card draw (kept out of components for render purity). */
export function drawShuffled<T>(cards: T[], n: number): T[] {
  return [...cards].sort(() => Math.random() - 0.5).slice(0, n);
}
