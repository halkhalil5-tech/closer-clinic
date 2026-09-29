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
