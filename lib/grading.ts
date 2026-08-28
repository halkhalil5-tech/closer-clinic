import { z } from "zod";
import type { RubricScores } from "./types";

const score = z.number().int().min(0).max(20);

export const GradeResultSchema = z.object({
  closed: z.boolean(),
  scores: z.object({
    rapport: score,
    framing: score,
    price: score,
    objections: score,
    close: score,
  }),
  total: z.number().int().min(0).max(100),
  moment: z.string().min(1),
  /** 0-based index of the provider turn where the close was won or lost. */
  momentIndex: z.number().int().min(0).nullish(),
  worked: z.array(z.string().min(1)).min(1).max(6),
  rewrite: z
    .object({ you_said: z.string().min(1), better: z.string().min(1) })
    .nullish(),
  fixes: z.array(z.string().min(1)).min(1).max(6),
  drill: z.string().min(1),
  /** Regen graders only; absent (and never required) for other specialties. */
  compliance: z
    .object({ score, flags: z.array(z.string()).max(12) })
    .nullish(),
});

export type GradeResult = z.infer<typeof GradeResultSchema>;

export function sumScores(scores: RubricScores): number {
  return scores.rapport + scores.framing + scores.price + scores.objections + scores.close;
}

/**
 * Parse and validate the grader model's output. Tolerates markdown fences and
 * leading/trailing prose around the JSON object. Recomputes `total`
 * server-side — the model's arithmetic is not trusted.
 * Throws on unrecoverable output; the caller retries once.
 */
export function parseGradeResult(raw: string): GradeResult {
  const jsonText = extractJsonObject(raw);
  const parsed = GradeResultSchema.parse(JSON.parse(jsonText));
  return { ...parsed, total: sumScores(parsed.scores) };
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in grader output");
  }
  return trimmed.slice(start, end + 1);
}
