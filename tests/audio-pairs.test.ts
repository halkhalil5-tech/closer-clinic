import { describe, expect, it } from "vitest";
import { pairContentHash, withStartTimes, MP3_BYTES_PER_MS } from "@/lib/audio-pairs-core";
import { SCENARIOS } from "@/lib/scenarios";
import type { Scenario } from "@/lib/types";

const base = SCENARIOS[0];

describe("pairContentHash — the cache scope", () => {
  it("is stable for identical content (global cache for default stations)", () => {
    expect(pairContentHash(base)).toBe(pairContentHash({ ...base }));
  });

  it("changes when the price is customized (per-clinic cache entry)", () => {
    const edited: Scenario = { ...base, priceDisplay: "$750" };
    expect(pairContentHash(edited)).not.toBe(pairContentHash(base));
  });

  it("changes when objections change, but not for irrelevant fields", () => {
    expect(pairContentHash({ ...base, objectionSeeds: ["new objection"] })).not.toBe(
      pairContentHash(base)
    );
    // title/sort order don't shape the script → same cache entry
    expect(pairContentHash({ ...base, title: "Renamed" } as Scenario)).toBe(pairContentHash(base));
  });

  it("scopes by module focus", () => {
    expect(pairContentHash(base, "Price delivery")).not.toBe(pairContentHash(base));
  });
});

describe("withStartTimes", () => {
  it("accumulates estimated segment durations", () => {
    const lines = [
      { speaker: "patient" as const, text: "a" },
      { speaker: "doctor" as const, text: "b" },
      { speaker: "patient" as const, text: "c" },
    ];
    const out = withStartTimes(lines, [8000, 16000, 4000]);
    expect(out[0].startMs).toBe(0);
    expect(out[1].startMs).toBe(8000 / MP3_BYTES_PER_MS);
    expect(out[2].startMs).toBe(8000 / MP3_BYTES_PER_MS + 16000 / MP3_BYTES_PER_MS);
  });

  it("preserves beats and text", () => {
    const out = withStartTimes([{ speaker: "doctor", text: "x", beat: "said the number" }], [100]);
    expect(out[0].beat).toBe("said the number");
  });
});

describe("stripMp3Metadata", () => {
  // Minimal MPEG1 Layer III 64kbps 44.1kHz frame: length 208, sync header.
  const frame = (fill: number) => {
    const f = Buffer.alloc(208, fill);
    f[0] = 0xff; f[1] = 0xfb; f[2] = 0x50; f[3] = 0x00; // MPEG1 L3, 64kbps, 44.1kHz
    return f;
  };

  it("removes a leading ID3v2 tag and Xing frame, keeps audio frames", async () => {
    const { stripMp3Metadata } = await import("@/lib/audio-pairs");
    const id3 = Buffer.concat([Buffer.from("ID3"), Buffer.from([3, 0, 0, 0, 0, 0, 20]), Buffer.alloc(20)]);
    const xing = frame(0);
    Buffer.from("Xing").copy(xing, 36);
    const audio = Buffer.concat([frame(0xaa), frame(0xbb)]);
    const out = stripMp3Metadata(Buffer.concat([id3, xing, audio]));
    expect(out.equals(audio)).toBe(true);
  });

  it("leaves a clean frame stream untouched", async () => {
    const { stripMp3Metadata } = await import("@/lib/audio-pairs");
    const audio = Buffer.concat([frame(0x11), frame(0x22)]);
    expect(stripMp3Metadata(audio).equals(audio)).toBe(true);
  });
});
