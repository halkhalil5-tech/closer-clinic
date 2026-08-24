import "server-only";
import type { Store } from "./store";
import { generateJson } from "./anthropic";
import {
  buildScriptCardPrompt,
  parseScriptCardLines,
  scriptCardContentHash,
  stubScriptCardJson,
  type ScriptCardLines,
} from "./script-card";
import type { Scenario } from "./types";

/** Cached tighten pass: regenerate only when the station's content changed. */
export async function cardLinesFor(
  store: Store,
  userId: string,
  scenario: Scenario
): Promise<ScriptCardLines> {
  const hash = scriptCardContentHash(scenario);
  const cached = await store.getScriptCard(userId, scenario.slug);
  if (cached && cached.contentHash === hash) return cached.lines;

  const { raw } = await generateJson(buildScriptCardPrompt(scenario), 1200, () =>
    stubScriptCardJson(scenario)
  );
  const lines = parseScriptCardLines(raw);
  await store.upsertScriptCard(userId, scenario.slug, hash, lines);
  return lines;
}
