import "server-only";

import { lookup } from "node:dns/promises";

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
  if (o.length !== 4 || o.some((n) => Number.isNaN(n))) return true;
  return (
    o[0] === 0 || o[0] === 10 || o[0] === 127 ||
    (o[0] === 100 && o[1] >= 64 && o[1] <= 127) ||
    (o[0] === 169 && o[1] === 254) ||
    (o[0] === 172 && o[1] >= 16 && o[1] <= 31) ||
    (o[0] === 192 && o[1] === 168) ||
    o[0] >= 224
  );
}

function isPrivateAddress(addr: string): boolean {
  const a = addr.toLowerCase();
  if (a.includes(":")) {
    // IPv6: loopback, unspecified, link-local, unique-local, and v4-mapped.
    if (a === "::" || a === "::1") return true;
    if (a.startsWith("fe8") || a.startsWith("fe9") || a.startsWith("fea") || a.startsWith("feb")) return true;
    if (a.startsWith("fc") || a.startsWith("fd")) return true;
    const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? isPrivateV4(mapped[1]) : false;
  }
  return isPrivateV4(a);
}

/**
 * SSRF guard: only plain http(s) on default ports, to hostnames whose EVERY
 * resolved address is public. Blocks localhost, RFC1918, link-local (cloud
 * metadata), CGNAT, and v6 equivalents. DNS is re-resolved per request;
 * redirects are followed manually so every hop passes the same check.
 */
async function assertPublicUrl(u: URL): Promise<boolean> {
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  if (u.port && u.port !== "80" && u.port !== "443") return false;
  if (u.username || u.password) return false;
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (/^[\d.]+$/.test(host) || host.includes(":")) return !isPrivateAddress(host);
  try {
    const addrs = await lookup(host, { all: true, verbatim: true });
    return addrs.length > 0 && addrs.every((x) => !isPrivateAddress(x.address));
  } catch {
    return false;
  }
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    let current = new URL(url);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await assertPublicUrl(current))) return null;
      const res = await fetch(current.toString(), {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { "User-Agent": "CloserClinic-Importer/1.0 (+services & pricing only)" },
        redirect: "manual",
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc || hop === MAX_REDIRECTS) return null;
        current = new URL(loc, current);
        continue;
      }
      if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return null;
      const len = Number(res.headers.get("content-length") ?? "0");
      if (len > MAX_BODY_BYTES) return null;
      const text = await res.text();
      return text.length > MAX_BODY_BYTES ? null : text;
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
