type FindingStatus = "present" | "missing" | "warning" | "error";
export interface ScanFinding { id: string; label: string; status: FindingStatus; detail: string; recommendation?: string; impact: number; }
export interface ScanResult { targetUrl: string; scannedAt: string; exposureScore: number; grade: string; summary: string; findings: ScanFinding[]; headers: Record<string, string | null>; }

const REQ_HEADERS = { "user-agent": "agentpolicy-scanner/0.1 (+https://agentpolicy.local)" };
const HEADER_SPECS = [
  { key: "x-robots-tag", label: "X-Robots-Tag header", impact: 8, recommendation: "Mirror crawl and indexing rules at the HTTP layer for assets and non-HTML responses." },
  { key: "content-security-policy", label: "Content-Security-Policy header", impact: 5, recommendation: "Ship a CSP to reduce browser-based abuse on pages agents may open or summarize." },
  { key: "permissions-policy", label: "Permissions-Policy header", impact: 5, recommendation: "Reduce default browser capabilities when agents or automation load pages." },
  { key: "x-ratelimit-limit", label: "Rate limit header", impact: 10, recommendation: "Expose request ceilings with standard rate limit headers or publish them in agent policy files." }
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

function hasPolicy(body: string | null): boolean {
  if (!body) return false;
  try { const p = JSON.parse(body) as { rules?: Record<string, unknown> }; return !!p.rules && ["readAccess","formSubmission","purchaseActions","dataCollection","rateLimits"].every(k => k in p.rules!); }
  catch { return false; }
}

function grade(s: number) { return s <= 20 ? "Low exposure" : s <= 40 ? "Guarded" : s <= 60 ? "Moderate exposure" : s <= 80 ? "Exposed" : "High exposure"; }
function summary(s: number) { return s <= 20 ? "The site publishes most of the expected agent governance signals." : s <= 40 ? "The site has some public controls in place, but coverage is incomplete." : s <= 60 ? "The site exposes meaningful ambiguity to crawlers and AI agents." : s <= 80 ? "The site is missing major public controls and would benefit from explicit agent rules." : "The site currently offers very little published guidance or rate governance for agents."; }

export async function scanSite(inputUrl: string): Promise<ScanResult> {
  const targetUrl = normalizeUrl(inputUrl);
  const origin = new URL(targetUrl).origin;
  const [robots, aiTxt, agentPolicy, hp] = await Promise.all([
    probeFile(new URL("/robots.txt", origin).toString()),
    probeFile(new URL("/ai.txt", origin).toString()),
    probeFile(new URL("/agent-policy.json", origin).toString()),
    probeHeaders(origin)
  ]);
  const findings: ScanFinding[] = [];
  let score = 0;

  if (robots.ok) { findings.push({ id: "robots-present", label: "robots.txt", status: "present", detail: `Found at ${robots.url} (HTTP ${robots.statusCode}).`, impact: 0 }); }
  else { score += 18; findings.push({ id: "robots-missing", label: "robots.txt", status: "missing", detail: `No robots.txt at ${robots.url}.`, recommendation: "Publish at least a minimal robots.txt.", impact: 18 }); }

  if (aiTxt.ok) { findings.push({ id: "ai-present", label: "ai.txt", status: "present", detail: `Found at ${aiTxt.url} (HTTP ${aiTxt.statusCode}).`, impact: 0 }); }
  else { score += 18; findings.push({ id: "ai-missing", label: "ai.txt", status: "missing", detail: `No ai.txt at ${aiTxt.url}.`, recommendation: "Publish human-readable AI agent guidance.", impact: 18 }); }

  if (!agentPolicy.ok) { score += 24; findings.push({ id: "policy-missing", label: "agent-policy.json", status: "missing", detail: `No policy file at ${agentPolicy.url}.`, recommendation: "Publish agent-policy.json for machine-readable rules.", impact: 24 }); }
  else if (!hasPolicy(agentPolicy.body)) { score += 12; findings.push({ id: "policy-warning", label: "agent-policy.json", status: "warning", detail: "Policy file found but missing required rule sections.", recommendation: "Include readAccess, formSubmission, purchaseActions, dataCollection, rateLimits.", impact: 12 }); }
  else { findings.push({ id: "policy-present", label: "agent-policy.json", status: "present", detail: `Structured policy found at ${agentPolicy.url}.`, impact: 0 }); }

  if ("error" in hp && hp.error) { score += 8; findings.push({ id: "header-error", label: "HTTP headers", status: "error", detail: `Header probe failed: ${hp.error}.`, recommendation: "Confirm root URL responds to HEAD/GET.", impact: 8 }); }

  for (const spec of HEADER_SPECS) {
    const val = hp.headers[spec.key];
    if (val) { findings.push({ id: `${spec.key}-present`, label: spec.label, status: "present", detail: `${spec.label} present: "${val}".`, impact: 0 }); }
    else { score += spec.impact; findings.push({ id: `${spec.key}-missing`, label: spec.label, status: "missing", detail: `${spec.label} not detected.`, recommendation: spec.recommendation, impact: spec.impact }); }
  }

  return { targetUrl: hp.targetUrl, scannedAt: new Date().toISOString(), exposureScore: Math.min(score, 100), grade: grade(score), summary: summary(score), findings, headers: hp.headers };
}
