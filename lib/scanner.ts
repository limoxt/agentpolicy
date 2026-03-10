type FindingStatus = "present" | "missing" | "warning" | "error";
export interface ScanFinding { id: string; label: string; status: FindingStatus; detail: string; recommendation?: string; impact: number; }
export interface ScanResult { targetUrl: string; scannedAt: string; exposureScore: number; grade: string; summary: string; findings: ScanFinding[]; headers: Record<string, string | null>; }

const REQ_HEADERS = { "user-agent": "agentpolicy-scanner/0.2 (+https://agentpolicy.vercel.app)" };

const HEADER_SPECS = [
  { key: "x-robots-tag",         label: "X-Robots-Tag header",         impact: 8,  recommendation: "Mirror crawl and indexing rules at the HTTP layer for non-HTML responses." },
  { key: "content-security-policy", label: "Content-Security-Policy",   impact: 5,  recommendation: "Publish a CSP to reduce abuse risk when agents or automation load pages." },
  { key: "permissions-policy",   label: "Permissions-Policy header",    impact: 5,  recommendation: "Restrict default browser capabilities for automated clients." },
  { key: "x-ratelimit-limit",    label: "Rate limit header",            impact: 8,  recommendation: "Expose request ceilings via standard rate-limit headers so agents self-throttle." },
] as const;

function normalizeUrl(input: string): string {
  const v = input.trim();
  if (!v) throw new Error("Please provide a valid website URL.");
  const n = /^[a-z]+:\/\//i.test(v) ? v : `https://${v}`;
  const u = new URL(n);
  if (!u.hostname.includes(".")) throw new Error("Please provide a valid website URL.");
  return u.origin;
}

async function probeFile(url: string) {
  try {
    const r = await fetch(url, { cache: "no-store", headers: REQ_HEADERS, redirect: "follow" });
    return { url, ok: r.ok, statusCode: r.status, body: r.ok ? await r.text() : null, error: r.ok ? undefined : `HTTP ${r.status}` };
  } catch (e) { return { url, ok: false, statusCode: null, body: null, error: e instanceof Error ? e.message : "Request failed" }; }
}

async function probeHeaders(url: string) {
  try {
    let r = await fetch(url, { method: "HEAD", cache: "no-store", headers: REQ_HEADERS, redirect: "follow" });
    if (r.status === 405 || r.status === 501) r = await fetch(url, { cache: "no-store", headers: REQ_HEADERS, redirect: "follow" });
    const headers = HEADER_SPECS.reduce<Record<string, string | null>>((acc, s) => { acc[s.key] = r.headers.get(s.key); return acc; }, {});
    return { targetUrl: r.url || url, headers, statusCode: r.status };
  } catch (e) {
    const headers = HEADER_SPECS.reduce<Record<string, string | null>>((acc, s) => { acc[s.key] = null; return acc; }, {});
    return { targetUrl: url, headers, statusCode: null, error: e instanceof Error ? e.message : "Header probe failed" };
  }
}

async function probeSearchApi(origin: string): Promise<{ ok: boolean; url: string; detail: string }> {
  const url = `${origin}/api/search?q=test`;
  try {
    const r = await fetch(url, { cache: "no-store", headers: REQ_HEADERS, signal: AbortSignal.timeout(6000) });
    if (r.ok || r.status === 400) {
      return { ok: true, url, detail: `Search API responded at ${url} (HTTP ${r.status}).` };
    }
    return { ok: false, url, detail: `Search endpoint returned HTTP ${r.status}.` };
  } catch {
    return { ok: false, url, detail: `No response from ${url}.` };
  }
}

function hasLlmsContent(body: string | null): boolean {
  if (!body || body.length < 20) return false;
  return body.includes("#") || body.includes("http") || body.length > 80;
}

function grade(s: number) {
  // s is the readiness score 0-100 (higher = better)
  return s >= 85 ? "AI-Ready" : s >= 65 ? "Mostly Ready" : s >= 45 ? "Partially Ready" : s >= 25 ? "Needs Work" : "Not AI-Ready";
}

function summary(s: number) {
  // s is the readiness score 0-100 (higher = better)
  return s >= 85
    ? "This site publishes strong AI readiness signals and is well-positioned for agent and LLM discovery."
    : s >= 65
    ? "This site has some AI readiness signals in place but a few important items are missing."
    : s >= 45
    ? "This site has partial AI readiness. Adding the missing signals would meaningfully improve LLM discoverability."
    : s >= 25
    ? "This site is missing most AI readiness signals. Agents and LLMs have limited structured guidance to work with."
    : "This site currently provides very little AI readiness infrastructure. Most signals are absent.";
}

export async function scanSite(inputUrl: string): Promise<ScanResult> {
  const targetUrl = normalizeUrl(inputUrl);
  const origin = new URL(targetUrl).origin;

  const [robots, llms, llmsFull, hp, searchApi] = await Promise.all([
    probeFile(new URL("/robots.txt", origin).toString()),
    probeFile(new URL("/llms.txt", origin).toString()),
    probeFile(new URL("/llms-full.txt", origin).toString()),
    probeHeaders(origin),
    probeSearchApi(origin),
  ]);

  const findings: ScanFinding[] = [];
  let score = 0;

  // robots.txt
  if (robots.ok) {
    findings.push({ id: "robots-present", label: "robots.txt", status: "present", detail: `Found at ${robots.url} (HTTP ${robots.statusCode}).`, impact: 0 });
  } else {
    score += 15;
    findings.push({ id: "robots-missing", label: "robots.txt", status: "missing", detail: `No robots.txt at ${robots.url}.`, recommendation: "Publish a robots.txt to give crawlers and AI agents explicit access rules.", impact: 15 });
  }

  // llms.txt
  if (llms.ok && hasLlmsContent(llms.body)) {
    findings.push({ id: "llms-present", label: "llms.txt", status: "present", detail: `Found at ${llms.url} (HTTP ${llms.statusCode}).`, impact: 0 });
  } else if (llms.ok) {
    score += 10;
    findings.push({ id: "llms-warning", label: "llms.txt", status: "warning", detail: `llms.txt exists but appears to have very little content.`, recommendation: "Add structured sections describing your site, key URLs, and usage guidance for LLMs.", impact: 10 });
  } else {
    score += 24;
    findings.push({ id: "llms-missing", label: "llms.txt", status: "missing", detail: `No llms.txt at ${llms.url}.`, recommendation: "Publish llms.txt to give LLMs a structured summary of your site and how to use your content.", impact: 24 });
  }

  // llms-full.txt
  if (llmsFull.ok && hasLlmsContent(llmsFull.body)) {
    findings.push({ id: "llms-full-present", label: "llms-full.txt", status: "present", detail: `Found at ${llmsFull.url} (HTTP ${llmsFull.statusCode}).`, impact: 0 });
  } else {
    score += 14;
    findings.push({ id: "llms-full-missing", label: "llms-full.txt", status: "missing", detail: `No llms-full.txt at ${llmsFull.url}.`, recommendation: "Publish llms-full.txt with a comprehensive index of your site's pages, docs, and API endpoints.", impact: 14 });
  }

  // /api/search endpoint
  if (searchApi.ok) {
    findings.push({ id: "search-present", label: "/api/search endpoint", status: "present", detail: searchApi.detail, impact: 0 });
  } else {
    score += 12;
    findings.push({ id: "search-missing", label: "/api/search endpoint", status: "missing", detail: searchApi.detail, recommendation: "Expose a /api/search?q= endpoint so AI agents can search your content programmatically.", impact: 12 });
  }

  // HTTP headers
  if ("error" in hp && hp.error) {
    score += 6;
    findings.push({ id: "header-error", label: "HTTP headers", status: "error", detail: `Header probe failed: ${hp.error}.`, recommendation: "Confirm your root URL responds to HEAD or GET requests.", impact: 6 });
  }

  for (const spec of HEADER_SPECS) {
    const val = hp.headers[spec.key];
    if (val) {
      findings.push({ id: `${spec.key}-present`, label: spec.label, status: "present", detail: `${spec.label} present: "${val}".`, impact: 0 });
    } else {
      score += spec.impact;
      findings.push({ id: `${spec.key}-missing`, label: spec.label, status: "missing", detail: `${spec.label} not detected.`, recommendation: spec.recommendation, impact: spec.impact });
    }
  }

  const readinessScore = Math.max(0, 100 - score);
  return {
    targetUrl: hp.targetUrl,
    scannedAt: new Date().toISOString(),
    exposureScore: readinessScore,
    grade: grade(readinessScore),
    summary: summary(readinessScore),
    findings,
    headers: hp.headers,
  };
}
