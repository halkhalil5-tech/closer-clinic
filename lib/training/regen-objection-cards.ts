import type { ObjectionCard } from "../types";

/**
 * Regenerative-medicine objection deck — same flip format as podiatry's.
 * The compliance-sensitive cards (FDA, guarantee, embryo) are worded so the
 * "back" is truthful under regulatory read-back: no approval implication,
 * no promised outcome, no invented numbers.
 */
export const REGEN_OBJECTION_CARDS: ObjectionCard[] = [
  {
    id: "rg-how-much",
    specialty: "regen",
    difficulty: "easy",
    front: "Forty-five hundred dollars? For one injection?",
    back: {
      isolate: "“If the cost weren't part of the picture — is this what you'd want to do?”",
      reframe: "“It's real money, at the top of a ladder you've already climbed — PT, the injections that stopped working, the consult. It's what sits between here and surgery.”",
      close: "“Most patients run it through an HSA. The material takes six weeks either way — let's get your date held.”",
    },
  },
  {
    id: "rg-fda",
    specialty: "regen",
    difficulty: "hard",
    front: "Is this FDA approved? Because what I read says it isn't.",
    back: {
      isolate: "“Fair question — and after I answer it straight, tell me: is the approval itself the concern, or whether you can trust this clinic?”",
      reframe: "“No — it's not an FDA-approved treatment, and anyone who implies otherwise earned those warning letters you read. It's a regulated, lot-tested tissue product — a different thing, and I'll put that difference in writing.”",
      close: "“You came in with better questions than most. Take the written expectations home tonight — and let's hold Thursday for the evaluation.”",
    },
  },
  {
    id: "rg-insurance",
    specialty: "regen",
    difficulty: "moderate",
    front: "Insurance won't cover ANY of it? Not even part?",
    back: {
      isolate: "“If it were covered tomorrow, would you do it? Then let's talk about the actual barrier.”",
      reframe: "“Payers class these products as investigational — that's the honest reason, not a loophole we forgot. Coverage follows big trials, and for this condition they don't exist yet.”",
      close: "“So the real comparison is this against another year of managing it. The protocol is $4,500 — shall we look at dates?”",
    },
  },
  {
    id: "rg-ortho-scam",
    specialty: "regen",
    difficulty: "hard",
    front: "My orthopedist flat-out said stem cell clinics are a scam.",
    back: {
      isolate: "“What was he reacting to — the injections themselves, or the industry around them? Those deserve different answers.”",
      reframe: "“For a lot of what's sold under that name, he's right. Here's what's different about this protocol — lot testing, physician review, written expectations, no guarantees — and I'll send him every bit of it today.”",
      close: "“Take the packet to him. If he still objects to the specifics, I want to hear why. Either way — hold Thursday's slot; one text cancels it.”",
    },
  },
  {
    id: "rg-guarantee",
    specialty: "regen",
    difficulty: "hard",
    front: "What's your success rate? Can you guarantee this works?",
    back: {
      isolate: "“Before I answer — if I could hand you certainty, is this what you'd want? Because what I can hand you is accountability.”",
      reframe: "“No guarantee — and walk out of any clinic that offers one. What we do instead: define success for YOUR knee in writing at week zero, measure it at week twelve, and you hear the honest answer from me first.”",
      close: "“That written definition is step one either way. Let's draft it at the evaluation — Tuesday or Thursday?”",
    },
  },
  {
    id: "rg-embryo",
    specialty: "regen",
    difficulty: "moderate",
    front: "Where does this actually come from? Is it from embryos?",
    back: {
      isolate: "“Important question — is it the source itself you want settled, or how it's screened?”",
      reframe: "“Not embryos — birth tissue. Donated after healthy scheduled C-sections with the mother's consent, from tissue otherwise discarded; mother and baby unharmed. Every lot is screened and tested.”",
      close: "“It's the most-asked question in this field and you deserved a straight answer. Anything else standing between you and a yes?”",
    },
  },
  {
    id: "rg-prp-cheaper",
    specialty: "regen",
    difficulty: "moderate",
    front: "My cousin got PRP for $700. Why is yours three times that?",
    back: {
      isolate: "“If they cost the same, which would you pick? Then it's a value question, not a price question — let me answer that one.”",
      reframe: "“They're different materials for different jobs — PRP concentrates your own blood; this is donor tissue with lab-verified contents. For what YOUR imaging shows, this is what the doctor recommended. If PRP were the right call, it'd be on this table.”",
      close: "“The right comparison is against your knee's actual findings. The protocol is $4,500 — want to see the dates?”",
    },
  },
  {
    id: "rg-how-many",
    specialty: "regen",
    difficulty: "moderate",
    front: "How many of these am I going to need? Is this going to turn into a subscription?",
    back: {
      isolate: "“Fair worry. If one round did what we defined on paper — would that settle it?”",
      reframe: "“The plan is ONE protocol, measured at twelve weeks against written goals. If the honest answer then is 'it didn't move,' the answer is not 'buy another one' — it's a different conversation entirely.”",
      close: "“One round, measured honestly. Let's get the baseline visit booked.”",
    },
  },
  {
    id: "rg-leadtime",
    specialty: "regen",
    difficulty: "easy",
    front: "Four to six WEEKS? Why can't you just do it this month?",
    back: {
      isolate: "“Is the wait itself the problem, or were you hoping to schedule around something specific?”",
      reframe: "“The material is ordered for your case specifically, under the doctor's direction — it isn't shelf stock, and honestly you want it that way. The clock starts when we order.”",
      close: "“Which is the argument for deciding today: order now and six weeks out is yours instead of twelve. The deposit holds your date — card or HSA?”",
    },
  },
  {
    id: "rg-spouse",
    specialty: "regen",
    difficulty: "moderate",
    front: "I need to talk to my wife before I spend this kind of money.",
    back: {
      isolate: "“Of course — a $4,500 decision should survive the kitchen table. What's the first thing she'll ask you?”",
      reframe: "“Let me arm you: what it is, what it honestly does and doesn't do, and what happens if it doesn't work — on paper, tonight. She should grill that sheet, not your memory of it.”",
      close: "“Pencil Thursday's slot now; one text cancels it if the answer's no. You lose nothing by holding the date.”",
    },
  },
  {
    id: "rg-think",
    specialty: "regen",
    difficulty: "moderate",
    front: "I just... need to think about it.",
    back: {
      isolate: "“Absolutely — so I can be useful: is it the money, the evidence, or whether you can trust this industry at all? That last one's fair and deserves a real answer.”",
      reframe: "“Thinking works better with structure: the written expectations tonight, your questions by phone Friday, and a held slot a single text cancels.”",
      close: "“So — Friday morning or Friday afternoon for that call?”",
    },
  },
];
