import { readFileSync } from "node:fs";
// Voiced /z/ carries periodic low-frequency energy → markedly lower zero-crossing
// rate than voiceless /s/, which is nearly all high-frequency frication.
function frames(path) {
  const b = readFileSync(path);
  let off = 12;
  while (off < b.length - 8) {
    const id = b.toString("ascii", off, off + 4), sz = b.readUInt32LE(off + 4);
    if (id === "data") { off += 8; break; }
    off += 8 + sz;
  }
  const n = (b.length - off) >> 1;
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = b.readInt16LE(off + i * 2) / 32768;
  const SR = 16000, W = Math.round(SR * 0.02), out = [];
  for (let i = 0; i + W < n; i += W) {
    let zc = 0, e = 0;
    for (let k = 1; k < W; k++) {
      if ((s[i + k - 1] >= 0) !== (s[i + k] >= 0)) zc++;
      e += s[i + k] * s[i + k];
    }
    out.push({ t: (i / SR).toFixed(3), zcr: Math.round((zc / W) * SR), rms: Math.sqrt(e / W) });
  }
  return out;
}
for (const f of ["verify.wav"]) {
  const fr = frames(f).filter((x) => x.rms > 0.012);      // ignore silence
  const peak = fr.reduce((a, b) => (b.zcr > a.zcr ? b : a));
  console.log(`${f}: peak ZCR ${peak.zcr} Hz @ ${peak.t}s   (mean ${Math.round(fr.reduce((a,b)=>a+b.zcr,0)/fr.length)} Hz)`);
}
