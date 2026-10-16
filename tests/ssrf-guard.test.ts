import { describe, expect, it } from "vitest";
import { crawlSite } from "@/lib/site-import";

// The guard rejects before any network call, so these run offline and fast.
describe("site importer SSRF guard", () => {
  const blocked = [
    "http://localhost:3000/api/admin",
    "http://127.0.0.1/",
    "http://169.254.169.254/latest/meta-data/",
    "http://10.0.0.8/",
    "http://172.16.4.2/",
    "http://192.168.1.1/",
    "http://100.64.0.1/",
    "http://[::1]/",
    "http://metadata.internal/",
    "http://foo.local/",
    "https://user:pass@example.com/",
    "https://example.com:8443/",
  ];
  for (const url of blocked) {
    it(`refuses ${url}`, async () => {
      const { pages, error } = await crawlSite(url);
      expect(pages).toHaveLength(0);
      expect(error).toBeTruthy();
    });
  }
});

describe("IPv6 disguises", () => {
  const blocked = [
    "http://[::ffff:a9fe:a9fe]/",
    "http://[::ffff:169.254.169.254]/",
    "http://[::ffff:7f00:1]/",
    "http://[64:ff9b::a9fe:a9fe]/",
    "http://[fe80::1]/",
    "http://[fd00::2]/",
    "http://[2002:a9fe:a9fe::1]/",
  ];
  for (const url of blocked) {
    it(`refuses ${url}`, async () => {
      const { pages, error } = await crawlSite(url);
      expect(pages).toHaveLength(0);
      expect(error).toBeTruthy();
    });
  }
});

import { pinnedLookup } from "@/lib/site-import";

describe("pinned DNS hook answers both callback shapes", () => {
  const pin = { address: "93.184.215.14", family: 4 };
  it("scalar form", () => {
    let got: unknown[] = [];
    pinnedLookup(pin)("example.com", (...a: unknown[]) => (got = a));
    expect(got).toEqual([null, "93.184.215.14", 4]);
  });
  it("array form (all: true — the shape that silently broke imports)", () => {
    let got: unknown[] = [];
    pinnedLookup(pin)("example.com", { all: true, hints: 1024 }, (...a: unknown[]) => (got = a));
    expect(got).toEqual([null, [{ address: "93.184.215.14", family: 4 }]]);
  });
});

describe("crawl success path (network)", () => {
  it("fetches a real public page end to end", async () => {
    const { pages, error } = await crawlSite("https://example.com");
    expect(error).toBeUndefined();
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].text.length).toBeGreaterThan(50);
  }, 20000);
});
