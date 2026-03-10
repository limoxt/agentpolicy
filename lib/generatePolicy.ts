export const INDUSTRIES = ["e-commerce", "finance", "healthcare", "media", "saas", "other"] as const;
export type IndustryType = (typeof INDUSTRIES)[number];

export interface AccessRule { allowed: boolean; scope: string; conditions: string[]; }
export interface DataCollectionRule extends AccessRule { maxRecordsPerSession: number; retention: string; }
export interface RateLimitRule { requestsPerMinute: number; burst: number; crawlDelaySeconds: number; respectRetryAfter: true; }

export interface AgentPolicy {
  version: "1.0"; site: string; industry: IndustryType; generatedAt: string;
  contact: { channel: "email"; value: string; };
  rules: { readAccess: AccessRule; formSubmission: AccessRule; purchaseActions: AccessRule; dataCollection: DataCollectionRule; rateLimits: RateLimitRule; };
}

export interface PolicyBundle { targetUrl: string; agentPolicy: AgentPolicy; agentPolicyText: string; aiText: string; }

type IndustryProfile = { readScope: string; readConditions: string[]; formConditions: string[]; dataConditions: string[]; dataRetention: string; dataMaxRecords: number; requestsPerMinute: number; burst: number; crawlDelaySeconds: number; };

const industryProfiles: Record<IndustryType, IndustryProfile> = {
  "e-commerce": { readScope: "Public catalog, marketing, and help center pages only", readConditions: ["Do not access authenticated customer areas", "Do not bypass anti-bot or inventory protections"], formConditions: ["Only submit forms after explicit human instruction", "Do not create accounts or enroll in offers automatically"], dataConditions: ["Collect only public product data needed for the active task", "Do not retain price or user-level behavioral data longer than necessary"], dataRetention: "24 hours maximum unless explicitly authorized", dataMaxRecords: 250, requestsPerMinute: 30, burst: 10, crawlDelaySeconds: 2 },
  finance: { readScope: "Public education, rates, and marketing content only", readConditions: ["Do not access authenticated dashboards or documents", "Do not scrape regulated disclosures at high frequency"], formConditions: ["Never submit applications, transfers, or identity forms automatically", "Require explicit human approval before posting any data"], dataConditions: ["Do not collect personal financial data", "Limit collection to public informational pages only"], dataRetention: "No retention of personal or transactional data", dataMaxRecords: 50, requestsPerMinute: 10, burst: 4, crawlDelaySeconds: 6 },
  healthcare: { readScope: "Public informational, provider, and location pages only", readConditions: ["Do not access patient portals or intake systems", "Do not interact with scheduling or refill endpoints"], formConditions: ["Never submit patient, provider, or insurance forms automatically", "Require direct human confirmation before any write action"], dataConditions: ["Do not collect or retain health-related personal information", "Collect only public service information needed for the task"], dataRetention: "No retention of health-related or personal data", dataMaxRecords: 40, requestsPerMinute: 8, burst: 3, crawlDelaySeconds: 8 },
  media: { readScope: "Public articles, category pages, and newsroom assets", readConditions: ["Honor paywalls and subscriber-only boundaries", "Do not mirror full-text content for redistribution"], formConditions: ["Do not submit newsletters, comments, or contact forms automatically", "Require a human operator before posting any content"], dataConditions: ["Collect only public metadata or excerpts needed for the task", "Do not archive full feeds or media libraries"], dataRetention: "72 hours maximum for public metadata", dataMaxRecords: 500, requestsPerMinute: 45, burst: 15, crawlDelaySeconds: 1 },
  saas: { readScope: "Public marketing, docs, pricing, and status pages only", readConditions: ["Do not access authenticated workspaces or tenant data", "Do not probe APIs beyond public documentation"], formConditions: ["Only submit demo, contact, or support forms with human approval", "Do not create trial accounts or invitations automatically"], dataConditions: ["Collect only public feature and documentation content", "Do not copy customer examples containing real data"], dataRetention: "24 hours maximum unless under contract", dataMaxRecords: 200, requestsPerMinute: 20, burst: 8, crawlDelaySeconds: 3 },
  other: { readScope: "Public, unauthenticated pages intended for general viewing", readConditions: ["Do not access gated, paid, or authenticated surfaces", "Honor anti-automation controls and legal notices"], formConditions: ["Do not submit forms without a direct human request", "Avoid any write action that changes site state"], dataConditions: ["Collect only the minimum public data required for the task", "Do not retain data beyond the active session"], dataRetention: "Session-only by default", dataMaxRecords: 100, requestsPerMinute: 15, burst: 5, crawlDelaySeconds: 4 }
};

function normalizeWebsiteUrl(input: string): string {
  const value = input.trim();
  if (!value) throw new Error("Please provide a valid website URL.");
  const normalized = /^[a-z]+:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(normalized);
  if (!url.hostname.includes(".")) throw new Error("Please provide a valid website URL.");
  return url.origin;
}

function defaultContact(siteUrl: string): string {
  const hostname = new URL(siteUrl).hostname.replace(/^www\./, "");
  return `policy@${hostname}`;
}

export function isIndustryType(value: string): value is IndustryType {
  return INDUSTRIES.includes(value as IndustryType);
}

export function generatePolicyBundle(inputUrl: string, industry: IndustryType): PolicyBundle {
  const site = normalizeWebsiteUrl(inputUrl);
  const profile = industryProfiles[industry];
  const generatedAt = new Date().toISOString();
  const agentPolicy: AgentPolicy = {
    version: "1.0", site, industry, generatedAt,
    contact: { channel: "email", value: defaultContact(site) },
    rules: {
      readAccess: { allowed: true, scope: profile.readScope, conditions: profile.readConditions },
      formSubmission: { allowed: false, scope: "Interactive forms, signups, and submissions are restricted", conditions: profile.formConditions },
      purchaseActions: { allowed: false, scope: "Checkout, payment, reservations, and purchases are not permitted", conditions: ["Never place orders, reservations, or payments automatically", "Require an authenticated human in the loop for any transaction"] },
      dataCollection: { allowed: true, scope: "Minimal collection of public content related to the active task", conditions: profile.dataConditions, maxRecordsPerSession: profile.dataMaxRecords, retention: profile.dataRetention },
      rateLimits: { requestsPerMinute: profile.requestsPerMinute, burst: profile.burst, crawlDelaySeconds: profile.crawlDelaySeconds, respectRetryAfter: true }
    }
  };
  const agentPolicyText = JSON.stringify(agentPolicy, null, 2);
  const aiText = buildAiTxt(agentPolicy);
  return { targetUrl: site, agentPolicy, agentPolicyText, aiText };
}

function buildAiTxt(policy: AgentPolicy): string {
  const policyUrl = new URL("/agent-policy.json", policy.site).toString();
  return [
    "# agentpolicy generated guidance", `Site: ${policy.site}`, `Industry: ${policy.industry}`,
    `Generated: ${policy.generatedAt}`, `Policy-URL: ${policyUrl}`, `Contact: ${policy.contact.value}`, "",
    "[Read Access]", `Allow: ${policy.rules.readAccess.scope}`,
    ...policy.rules.readAccess.conditions.map((c) => `Condition: ${c}`), "",
    "[Form Submission]", `Allow: ${policy.rules.formSubmission.allowed ? "yes" : "no"}`,
    ...policy.rules.formSubmission.conditions.map((c) => `Condition: ${c}`), "",
    "[Purchase Actions]", `Allow: ${policy.rules.purchaseActions.allowed ? "yes" : "no"}`,
    ...policy.rules.purchaseActions.conditions.map((c) => `Condition: ${c}`), "",
    "[Data Collection]", `Allow: ${policy.rules.dataCollection.allowed ? "yes" : "no"}`,
    `Scope: ${policy.rules.dataCollection.scope}`, `Retention: ${policy.rules.dataCollection.retention}`,
    `Max-Records-Per-Session: ${policy.rules.dataCollection.maxRecordsPerSession}`,
    ...policy.rules.dataCollection.conditions.map((c) => `Condition: ${c}`), "",
    "[Rate Limits]", `Requests-Per-Minute: ${policy.rules.rateLimits.requestsPerMinute}`,
    `Burst: ${policy.rules.rateLimits.burst}`, `Crawl-Delay-Seconds: ${policy.rules.rateLimits.crawlDelaySeconds}`,
    "Respect-Retry-After: yes"
  ].join("\n");
}
