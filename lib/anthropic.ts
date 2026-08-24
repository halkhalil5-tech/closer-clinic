import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { TranscriptMessage } from "./types";
import { PATIENT_OPENING_INSTRUCTION } from "./prompts";

/**
 * All model calls live here and only run server-side. The API key never
 * reaches the client. When ANTHROPIC_API_KEY is absent (local dev without
 * keys), a clearly-labeled stub patient keeps the UI loop testable.
 */

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_TRANSCRIPT_MESSAGES = 30; // token guardrail: truncate context beyond this

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export function hasModelAccess(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
}

/** Map our transcript into Anthropic messages. Patient = assistant, provider/event = user. */
function toModelMessages(transcript: TranscriptMessage[]): Anthropic.MessageParam[] {
  const recent =
    transcript.length > MAX_TRANSCRIPT_MESSAGES
      ? transcript.slice(-MAX_TRANSCRIPT_MESSAGES)
      : transcript;

  const messages: Anthropic.MessageParam[] = [];
  for (const m of recent) {
    const role = m.role === "patient" ? "assistant" : "user";
    const text = m.role === "event" ? `[EVENT] ${m.text}` : m.text;
    const last = messages[messages.length - 1];
    if (last && last.role === role) {
      last.content = `${last.content}\n${text}`;
    } else {
      messages.push({ role, content: text });
    }
  }
  // The API requires the first message to be from the user.
  if (messages.length === 0 || messages[0].role !== "user") {
    messages.unshift({ role: "user", content: PATIENT_OPENING_INSTRUCTION });
  }
  return messages;
}

export async function generatePatientReply(
  systemPrompt: string,
  transcript: TranscriptMessage[]
): Promise<{ text: string; usage: ModelUsage }> {
  if (!hasModelAccess()) {
    return {
      text: stubPatientReply(transcript, systemPrompt),
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 300,
    temperature: 1,
    system: systemPrompt,
    messages: toModelMessages(transcript),
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return {
    text: text || "...",
    usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens },
  };
}

export async function generateGrade(
  graderPrompt: string
): Promise<{ raw: string; usage: ModelUsage }> {
  if (!hasModelAccess()) {
    return { raw: stubGradeJson(), usage: { inputTokens: 0, outputTokens: 0 } };
  }
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1200,
    temperature: 0,
    messages: [{ role: "user", content: graderPrompt }],
  });
  const raw = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return {
    raw,
    usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens },
  };
}

/** One-shot JSON generation (pair scripts, script-card tightening). */
export async function generateJson(
  prompt: string,
  maxTokens = 2000,
  devStub?: () => string
): Promise<{ raw: string; usage: ModelUsage }> {
  if (!hasModelAccess()) {
    return { raw: (devStub ?? stubPairScriptJson)(), usage: { inputTokens: 0, outputTokens: 0 } };
  }
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature: 1,
    messages: [{ role: "user", content: prompt }],
  });
  const raw = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return {
    raw,
    usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens },
  };
}

/* ------------------------- dev stubs (no API key) ------------------------- */

function stubPairScriptJson(): string {
  const a = [
    { speaker: "patient", text: "So what are my options here, doc? [DEV STUB]" },
    { speaker: "doctor", text: "Well, there's a treatment we offer — it's pretty effective, I know the price is a lot though..." },
    { speaker: "patient", text: "How much are we talking?" },
    { speaker: "doctor", text: "It's around six hundred, but, um, do you want to think about it?" },
    { speaker: "patient", text: "Yeah... let me think about it." },
  ];
  const b = [
    { speaker: "patient", text: "So what are my options here, doc? [DEV STUB]" },
    { speaker: "doctor", text: "Based on your exam, this is exactly what the treatment exists for.", beat: "tied it to the findings" },
    { speaker: "patient", text: "How much are we talking?" },
    { speaker: "doctor", text: "The full series is $600.", beat: "said the number and stopped talking" },
    { speaker: "patient", text: "Okay. When can we start?" },
    { speaker: "doctor", text: "Mornings or afternoons work better for you?", beat: "alternative close" },
  ];
  return JSON.stringify({ takes: [{ take: "A", lines: a }, { take: "B", lines: b }] });
}

function stubPatientReply(transcript: TranscriptMessage[], systemPrompt = ""): string {
  // Quote the actual price from the system prompt, so price overrides are
  // visible in the dev loop exactly as they will be with the real model.
  const price =
    systemPrompt.match(/ at (\$[\d,]+(?:–\$[\d,]+)?(?:\s*program)?) \(/)?.[1] ?? "that much";
  const lines = [
    ["Hi doc. [DEV STUB — set ANTHROPIC_API_KEY for a real AI patient] My heel's been bothering me for months.", 55],
    ["Hmm, okay. How much does something like that run?", 48],
    [`${price}? That's a lot of money. Why wouldn't my insurance cover it?`, 31],
    ["I don't know... let me think about it, maybe I'll call next week.", 26],
    ["Alright — you make a fair point. What times do you have?", 86],
  ] as const;
  const patientTurns = transcript.filter((m) => m.role === "patient").length;
  const [text, receptivity] = lines[Math.min(patientTurns, lines.length - 1)];
  return `${text}\n{"receptivity": ${receptivity}}`;
}

function stubGradeJson(): string {
  return JSON.stringify({
    closed: true,
    scores: { rapport: 14, framing: 12, price: 10, objections: 11, close: 13 },
    total: 60,
    momentIndex: 2,
    rewrite: {
      you_said: "It's six hundred dollars, but we do have payment plans if that helps at all...",
      better: "The full series is $600. Most patients put it on an HSA card — let's get session one scheduled.",
    },
    moment:
      "[DEV STUB] Set ANTHROPIC_API_KEY to get real grading. The close was won when the provider asked for the schedule directly.",
    worked: ["[DEV STUB] Stated the price plainly.", "[DEV STUB] Asked a closing question."],
    fixes: ["[DEV STUB] Tie the recommendation to the ultrasound finding.", "[DEV STUB] Isolate the insurance objection with a question."],
    drill: "[DEV STUB] Practice the alternative close: 'Mornings or afternoons work better for you?'",
  });
}
