import "server-only";

import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

/**
 * Practice-website import: fetch the homepage plus obvious services/pricing
 * pages (same-domain, depth ≤ 2, max 10 pages), then extract service names,
 * descriptions, and listed prices. Services and pricing ONLY — testimonials
 * and anything patient-shaped are never imported.
 */

const PAGE_CAP = 10;
const FETCH_TIMEOUT_MS = 8000;
const PAGE_TEXT_CAP = 8000;
const SERVICE_LINK = /service|pricing|price|treatment|procedure|fee|offer|menu|care|regenerative|stem|biologic|prp|injection|iv-|longevity|wellness/i;
const EXCLUDED_LINK = /testimonial|review|story|stories|blog|news|patient-portal|privacy|terms/i;

export interface CrawledPage {
  url: string;
  text: string;
}

export interface ExtractedService {
  name: string;
  description: string;
  price: string | null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(h[1-4])[^>]*>/gi, "\n\n## ")
    .replace(/<(li|p|tr|div|br)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, PAGE_TEXT_CAP);
}

const MAX_REDIRECTS = 3;
const MAX_BODY_BYTES = 2_000_000;

function isPrivateV4(ip: string): boolean {
  const o = ip.split(".").map(Number);
  if (o.length !== 4 || o.some((n) => Number.isNaN(n) || n > 255)) return true;
  return (
    o[0] === 0 || o[0] === 10 || o[0] === 127 ||
    (o[0] === 100 && o[1] >= 64 && o[1] <= 127) ||
    (o[0] === 169 && o[1] === 254) ||
    (o[0] === 172 && o[1] >= 16 && o[1] <= 31) ||
    (o[0] === 192 && o[1] === 168) ||
    o[0] >= 224
  );
}

/** Parse an IPv6 literal into its 8 groups; null when malformed. */
function v6Groups(host: string): number[] | null {
  let h = host.toLowerCase();
  // dotted-quad tail (::ffff:169.254.169.254) → two trailing hex groups
  const tail = h.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) {
    const o = tail[2].split(".").map(Number);
    if (o.length !== 4 || o.some((n) => Number.isNaN(n) || n > 255)) return null;
    h = `${tail[1]}${(((o[0] << 8) | o[1]) >>> 0).toString(16)}:${(((o[2] << 8) | o[3]) >>> 0).toString(16)}`;
  }
  const halves = h.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":").filter(Boolean) : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":").filter(Boolean) : [];
  const groups =
    halves.length === 2
      ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right]
      : left;
  if (groups.length !== 8) return null;
  const out: number[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    out.push(parseInt(g, 16));
  }
  return out;
}

function isPrivateAddress(addr: string): boolean {
  const a = addr.toLowerCase().replace(/^\[|\]$/g, "").split("%")[0];
  if (!a.includes(":")) return isPrivateV4(a);
  const g = v6Groups(a);
  if (!g) return true; // unparseable → refuse
  const embeddedV4 = (hi: number, lo: number) =>
    isPrivateV4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  const leadZero = (n: number) => g.slice(0, n).every((x) => x === 0);
  if (leadZero(8)) return true;                                   // ::
  if (leadZero(7) && g[7] === 1) return true;                     // ::1
  if (g[0] >= 0xfe80 && g[0] <= 0xfebf) return true;              // link-local
  if (g[0] >> 8 === 0xfc || g[0] >> 8 === 0xfd) return true;      // unique-local
  if (leadZero(5) && g[5] === 0xffff) return embeddedV4(g[6], g[7]);       // v4-mapped (hex or dotted)
  if (leadZero(6)) return embeddedV4(g[6], g[7]);                 // v4-compatible (deprecated)
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0))
    return embeddedV4(g[6], g[7]);                                // NAT64
  if (g[0] === 0x2002) return embeddedV4(g[1], g[2]);             // 6to4
  return false;
}

interface PinnedTarget { address: string; family: number }

/**
 * SSRF guard: only plain http(s) on default ports, to hostnames whose EVERY
 * resolved address is public. Returns the address the caller must connect
 * to — the socket is pinned to it so a second DNS answer (rebinding) can't
 * swap in an internal host between check and connect.
 */
async function assertPublicUrl(u: URL): Promise<PinnedTarget | null> {
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (u.port && u.port !== "80" && u.port !== "443") return null;
  if (u.username || u.password) return null;
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return null;
  if (/^[\d.]+$/.test(host) || host.includes(":")) {
    if (isPrivateAddress(host)) return null;
    return { address: host, family: host.includes(":") ? 6 : 4 };
  }
  try {
    const addrs = await lookup(host, { all: true, verbatim: true });
    if (addrs.length === 0 || addrs.some((x) => isPrivateAddress(x.address))) return null;
    return { address: addrs[0].address, family: addrs[0].family };
  } catch {
    return null;
  }
}

interface PinnedResponse { status: number; contentType: string; location: string | null; body: string | null }

/** GET over a socket pinned to the pre-validated address (TLS still verifies the hostname). */
function pinnedGet(u: URL, pin: PinnedTarget): Promise<PinnedResponse | null> {
  return new Promise((resolve) => {
    const mod = u.protocol === "https:" ? httpsRequest : httpRequest;
    const req = mod(
      u,
      {
        lookup: ((_h: string, opts: unknown, cb: unknown) => {
          const done = (typeof opts === "function" ? opts : cb) as (e: null, a: string, f: number) => void;
          done(null, pin.address, pin.family);
        }) as never,
        headers: { "User-Agent": "CloserClinic-Importer/1.0 (+services & pricing only)" },
        timeout: FETCH_TIMEOUT_MS,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const contentType = String(res.headers["content-type"] ?? "");
        const location = res.headers.location ?? null;
        if (status >= 300 && status < 400) {
          res.resume();
          return resolve({ status, contentType, location, body: null });
        }
        let size = 0;
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => {
          size += c.length;
          if (size > MAX_BODY_BYTES) { req.destroy(); resolve(null); return; }
          chunks.push(c);
        });
        res.on("end", () => resolve({ status, contentType, location, body: Buffer.concat(chunks).toString("utf8") }));
        res.on("error", () => resolve(null));
      }
    );
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.on("error", () => resolve(null));
    req.end();
  });
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    let current = new URL(url);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const pin = await assertPublicUrl(current);
      if (!pin) return null;
      const res = await pinnedGet(current, pin);
      if (!res) return null;
      if (res.status >= 300 && res.status < 400) {
        if (!res.location || hop === MAX_REDIRECTS) return null;
        current = new URL(res.location, current);
        continue;
      }
      if (res.status !== 200 || !res.contentType.includes("html") || res.body === null) return null;
      return res.body;
    }
    return null;
  } catch {
    return null;
  }
}

function sameDomainLinks(html: string, base: URL): string[] {
  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)].map((m) => m[1]);
  const out = new Set<string>();
  for (const h of hrefs) {
    try {
      const u = new URL(h, base);
      if (u.hostname !== base.hostname) continue;
      if (EXCLUDED_LINK.test(u.pathname)) continue;
      if (!SERVICE_LINK.test(u.pathname)) continue;
      u.hash = "";
      u.search = "";
      out.add(u.toString());
    } catch {
      /* ignore malformed */
    }
  }
  return [...out];
}

export async function crawlSite(rawUrl: string): Promise<{ pages: CrawledPage[]; error?: string }> {
  let base: URL;
  try {
    base = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
  } catch {
    return { pages: [], error: "That doesn't look like a URL." };
  }

  const pages: CrawledPage[] = [];
  const seen = new Set<string>([base.toString()]);

  const homeHtml = await fetchPage(base.toString());
  if (!homeHtml) {
    return {
      pages: [],
      error:
        "We couldn't read that site (it may be down, blocking robots, or fully JavaScript-rendered).",
    };
  }
  pages.push({ url: base.toString(), text: htmlToText(homeHtml) });

  // Depth 1: service-looking links from the homepage; depth 2: from those.
  let frontier = sameDomainLinks(homeHtml, base);
  for (let depth = 1; depth <= 2 && pages.length < PAGE_CAP; depth++) {
    const next: string[] = [];
    for (const url of frontier) {
      if (pages.length >= PAGE_CAP) break;
      if (seen.has(url)) continue;
      seen.add(url);
      const html = await fetchPage(url);
      if (!html) continue;
      pages.push({ url, text: htmlToText(html) });
      if (depth === 1) next.push(...sameDomainLinks(html, base));
    }
    frontier = next;
  }
  return { pages };
}

/**
 * Dev-mode heuristic extractor (also the fallback): headings followed by
 * text, `$` amounts nearby become prices. The AI extractor replaces this
 * when a model key is present.
 */
export function heuristicExtract(pages: CrawledPage[]): ExtractedService[] {
  const services = new Map<string, ExtractedService>();
  // The homepage's lead heading is the practice name, not a service.
  const siteName = pages[0]?.text.match(/## ([^\n]+)/)?.[1]?.trim().toLowerCase();
  for (const page of pages) {
    const sections = page.text.split(/\n## /).slice(0, 40);
    for (const section of sections) {
      const [head, ...rest] = section.split("\n");
      const name = head?.trim();
      if (!name || name.length < 3 || name.length > 60) continue;
      if (/testimonial|review|about|contact|home|welcome|our team|blog/i.test(name)) continue;
      if (siteName && name.toLowerCase() === siteName) continue;
      const bodyText = rest.join(" ").trim();
      const price = section.match(/\$\s?\d[\d,]*(?:\s*(?:per|\/)\s*\w+)?/)?.[0]?.replace(/\s+/g, " ") ?? null;
      // Keep only sections that look like clinical services: price present or
      // treatment-ish words in the name/body.
      if (!price && !/therapy|treatment|laser|injection|surgery|orthotic|care|program|session/i.test(name + bodyText)) {
        continue;
      }
      if (!services.has(name.toLowerCase())) {
        services.set(name.toLowerCase(), {
          name,
          description: bodyText.slice(0, 200),
          price,
        });
      }
    }
  }
  return [...services.values()].slice(0, 12);
}

/** AI extraction prompt: services and pricing only, never patient content. */
export function buildSiteExtractionPrompt(pages: CrawledPage[]): string {
  const corpus = pages
    .map((p) => `--- PAGE: ${p.url} ---\n${p.text}`)
    .join("\n\n")
    .slice(0, 40_000);
  return `You are extracting a healthcare practice's SERVICE MENU from its website text, for a training tool.

Extract ONLY services the practice performs, with any listed prices. HARD RULES:
- NEVER extract testimonials, reviews, patient stories, staff bios, or anything containing a person's name or experience. Services and pricing only.
- Skip insurance boilerplate, blog content, and generic conditions pages without a treatable service.
- "price": the price exactly as listed (e.g. "$600", "$150/session"), or null when none is shown.

WEBSITE TEXT
${corpus}

Respond with ONLY a JSON object, no markdown fences:
{"services": [{"name": "...", "description": "one line, from the site's own wording", "price": "$..." | null}]}
Cap at 12 services.`;
}
