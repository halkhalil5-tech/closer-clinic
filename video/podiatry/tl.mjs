// Shared timeline: which spans of the encounter footage survive the edit.
// Dead gaps (patient finished, doctor line stalled on the network) cut
// invisibly because the frame is static across them.
import { readFileSync, writeFileSync } from "node:fs";
export function buildTimeline() {
  const { slots, part2Start } = JSON.parse(readFileSync("slots.json", "utf8"));
  const { marks } = JSON.parse(readFileSync("enc-meta.json", "utf8"));
  const plines = JSON.parse(readFileSync("plines.json", "utf8"));
  const endClick = marks.find((m) => m.kind === "endClick").t;
  const scOn = marks.find((m) => m.kind === "scorecard").t;
  const scEnd = marks.find((m) => m.kind === "end").t;

  // cuts: (a) dead endSay→doc stalls, (b) patient windows that ran long
  // because the app's TTS fetch was slow — the frame is static in both.
  const cuts = [];
  const evts = marks.filter((m) => ["endSay", "doc"].includes(m.kind));
  for (let i = 0; i < evts.length - 1; i++) {
    const a = evts[i], b = evts[i + 1];
    if (a.kind === "endSay" && b.kind === "doc" && b.t - a.t > 5) cuts.push([a.t + 0.5, b.t - 0.4]);
  }
  for (const l of plines) {
    const excess = (l.endSay - l.say) - l.dur;
    if (excess > 1.5) cuts.push([l.say + l.dur + 0.45, l.endSay - 0.05]);
  }
  cuts.sort((x, y) => x[0] - y[0]);
  const segs = [];
  let cursor = 0;
  for (const [a, b] of cuts) { if (a > cursor) segs.push([cursor, a]); cursor = Math.max(cursor, b); }
  segs.push([cursor, endClick + 1.3]);
  const encLen = segs.reduce((s, [a, b]) => s + (b - a), 0);
  const map = (t) => {
    let acc = 0;
    for (const [a, b] of segs) {
      if (t < a) return part2Start + acc;         // inside a cut → snap to its end
      if (t <= b) return part2Start + acc + (t - a);
      acc += b - a;
    }
    return part2Start + acc;
  };
  const SC_START = part2Start + encLen;
  const SC_LEN = scEnd - (scOn - 0.3);
  const T_END = SC_START + SC_LEN;
  const TOTAL = T_END + 5.6;
  const tl = { part2Start, segs, encLen, scOn, scEnd, SC_START, SC_LEN, T_END, TOTAL,
    phOn: slots[1].start, phOff: slots.find((s) => s.id === "11-part2").start };
  writeFileSync("timeline.json", JSON.stringify(tl, null, 2));
  // one clock for a patient line's caption AND audio
  const cueStart = (l) => {
    let start = map(l.say) + 0.45;
    const prevDoc = marks.filter((x) => x.kind === "doc" && x.t < l.say).pop();
    if (prevDoc) start = Math.min(start, map(prevDoc.t) + prevDoc.dur + 1.2);
    return start;
  };
  return { tl, map, marks, slots, cueStart };
}
