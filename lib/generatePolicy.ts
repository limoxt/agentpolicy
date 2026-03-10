export const INDUSTRIES = ["e-commerce", "finance", "healthcare", "media", "saas", "developer-tools", "other"] as const;
export type IndustryType = (typeof INDUSTRIES)[number];

export interface PolicyBundle {
  targetUrl: string;
  llmsTxt: string;
  llmsFullTxt: string;
}

type Profile = {
  purpose: string;
  contentTypes: string[];
  capabilities: string[];
  restrictions: string[];
  keyPaths: string[];
  crawlNote: string;
};

const profiles: Record<IndustryType, Profile> = {
  "e-commerce": {
    purpose: "Online retail — product catalog, purchasing, and customer support",
    contentTypes: ["Product listings", "Category pages", "Help center and FAQs", "Order and returns policy"],
    capabilities: ["Search the product catalog", "Read pricing and availability", "Browse help documentation"],
    restrictions: ["Do not add to cart or checkout without explicit human approval", "Do not create accounts or submit forms automatically", "Respect rate limits on catalog endpoints"],
    keyPaths: ["/products", "/categories", "/help", "/faq", "/sitemap.xml"],
    crawlNote: "Public catalog pages are open. Authenticated cart and account areas are restricted.",
  },
  finance: {
    purpose: "Financial services — rates, tools, and public product information",
    contentTypes: ["Rate tables", "Product descriptions", "Calculators and tools", "Public disclosures and terms"],
    capabilities: ["Read public rates and product information", "Access educational content", "Reference published disclosures"],
    restrictions: ["Do not access authenticated dashboards or account data", "Do not submit applications, transfers, or sensitive forms without explicit human approval", "Do not scrape regulated disclosures at high frequency"],
    keyPaths: ["/rates", "/products", "/tools", "/disclosures", "/sitemap.xml"],
    crawlNote: "Public marketing and informational pages are open. Authenticated areas are strictly restricted.",
  },
  healthcare: {
    purpose: "Healthcare provider — facility information, services, and patient resources",
    contentTypes: ["Provider and location pages", "Service descriptions", "Patient education content", "Contact and scheduling information"],
    capabilities: ["Read public provider and location information", "Access service descriptions", "Browse patient education resources"],
    restrictions: ["Do not access patient portals or medical records systems", "Do not submit intake, scheduling, or insurance forms automatically", "Do not collect or retain any personal health information"],
    keyPaths: ["/providers", "/locations", "/services", "/patient-resources", "/sitemap.xml"],
    crawlNote: "Public informational content is accessible. Patient-facing portals require authentication.",
  },
  media: {
    purpose: "Media and publishing — articles, video, and editorial content",
    contentTypes: ["News articles and features", "Video and podcast content", "Author profiles", "Topic and tag archives"],
    capabilities: ["Read public articles and metadata", "Browse topic archives", "Access public author information"],
    restrictions: ["Honor paywalls and subscriber-only content boundaries", "Do not reproduce full article text for redistribution", "Do not archive bulk content beyond what is needed for the current task"],
    keyPaths: ["/articles", "/topics", "/authors", "/videos", "/sitemap.xml", "/feed.xml"],
    crawlNote: "Free articles are open. Subscriber content requires authentication.",
  },
  saas: {
    purpose: "Software as a Service — product, documentation, and support resources",
    contentTypes: ["Product marketing pages", "Technical documentation", "Pricing information", "Changelog and release notes", "Support knowledge base"],
    capabilities: ["Read product and feature documentation", "Browse pricing and plan information", "Access public changelog and status pages", "Search the knowledge base"],
    restrictions: ["Do not access authenticated workspaces or tenant data", "Do not probe undocumented API endpoints", "Do not create trial accounts or submit demo requests automatically"],
    keyPaths: ["/docs", "/pricing", "/changelog", "/api", "/support", "/sitemap.xml", "/llms.txt"],
    crawlNote: "Public docs and marketing pages are open. Authenticated workspace data is restricted.",
  },
  "developer-tools": {
    purpose: "Developer tools and infrastructure — documentation, API reference, and SDKs",
    contentTypes: ["API reference documentation", "SDK guides and tutorials", "Code examples and quickstarts", "Changelog and migration guides"],
    capabilities: ["Read all public documentation and API references", "Access code examples", "Browse changelog and version history", "Use the /api/search endpoint to discover content"],
    restrictions: ["Do not access authenticated dashboards or billing information", "Do not create accounts or generate API keys automatically"],
    keyPaths: ["/docs", "/api", "/sdk", "/examples", "/changelog", "/llms.txt", "/llms-full.txt", "/api/search"],
    crawlNote: "All public documentation is open and intended for LLM consumption. llms.txt and llms-full.txt are available.",
  },
  other: {
    purpose: "General-purpose website — public informational content",
    contentTypes: ["Main pages", "About and contact information", "Blog or news content", "Public documentation"],
    capabilities: ["Read public pages intended for general viewing", "Access blog and informational content"],
    restrictions: ["Do not access authenticated or gated content without authorization", "Do not submit forms or write data without explicit human instruction"],
    keyPaths: ["/", "/about", "/blog", "/contact", "/sitemap.xml"],
    crawlNote: "Public pages are open. Gated or authenticated content requires prior authorization.",
  },
};

function normalizeUrl(input: string): string {
  const v = input.trim();
  if (!v) throw new Error("Please provide a valid website URL.");
  const n = /^[a-z]+:\/\//i.test(v) ? v : `https://${v}`;
  const u = new URL(n);
  if (!u.hostname.includes(".")) throw new Error("Please provide a valid website URL.");
  return u.origin;
}

export function isIndustryType(value: string): value is IndustryType {
  return INDUSTRIES.includes(value as IndustryType);
}

export function generatePolicyBundle(inputUrl: string, industry: IndustryType): PolicyBundle {
  const site = normalizeUrl(inputUrl);
  const hostname = new URL(site).hostname.replace(/^www\./, "");
  const p = profiles[industry];
  const date = new Date().toISOString().split("T")[0];

  const llmsTxt = [
    `# ${hostname}`,
    ``,
    `> ${p.purpose}`,
    ``,
    `## About`,
    `Site: ${site}`,
    `Industry: ${industry}`,
    `Generated: ${date}`,
    ``,
    `## Content`,
    ...p.contentTypes.map((c) => `- ${c}`),
    ``,
    `## What you can do`,
    ...p.capabilities.map((c) => `- ${c}`),
    ``,
    `## Restrictions`,
    ...p.restrictions.map((r) => `- ${r}`),
    ``,
    `## Crawling`,
    p.crawlNote,
    ``,
    `## Contact`,
    `For questions about AI/LLM access: ai@${hostname}`,
  ].join("\n");

  const llmsFullTxt = [
    `# ${hostname} — Full LLM Reference`,
    ``,
    `> ${p.purpose}`,
    ``,
    `Generated: ${date}`,
    `Source: ${site}`,
    ``,
    `---`,
    ``,
    `## Site Overview`,
    ``,
    `This file provides a comprehensive reference for AI agents and LLMs interacting with ${hostname}.`,
    `It extends the concise summary in /llms.txt with additional detail on site structure,`,
    `available APIs, and recommended usage patterns.`,
    ``,
    `## Content Types`,
    ``,
    ...p.contentTypes.map((c) => `### ${c}\n- Available at this site\n- Intended for public access\n`),
    ``,
    `## Capabilities`,
    ``,
    ...p.capabilities.map((c) => `- ${c}`),
    ``,
    `## Restrictions`,
    ``,
    ...p.restrictions.map((r) => `- ${r}`),
    ``,
    `## Key Paths`,
    ``,
    ...p.keyPaths.map((path) => `- ${site}${path}`),
    ``,
    `## Recommended Agent Behaviour`,
    ``,
    `1. Read /llms.txt first for a concise summary`,
    `2. Check /sitemap.xml for a full page inventory`,
    `3. Use /api/search?q= for programmatic content discovery if available`,
    `4. Respect robots.txt for crawl rules`,
    `5. Do not cache content for longer than 24 hours without explicit authorization`,
    `6. Identify yourself with a descriptive User-Agent`,
    ``,
    `## Crawling Notes`,
    ``,
    p.crawlNote,
    ``,
    `---`,
    ``,
    `## Contact`,
    ``,
    `For AI/LLM access enquiries: ai@${hostname}`,
    `For general contact: ${site}/contact`,
  ].join("\n");

  return { targetUrl: site, llmsTxt, llmsFullTxt };
}
