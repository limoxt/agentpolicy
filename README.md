# agentpolicy — Is your site AI-ready?

Free tools to generate and audit the AI readiness signals your website publishes.

**Live:** https://agentpolicy.vercel.app

---

## What this is

AI agents and LLMs are increasingly crawling, summarising, and interacting with websites. Without clear signals, they have no structured guidance on what your site is, what they can access, or how to use your content correctly.

This project checks five public signals:

| Signal | What it does |
|--------|-------------|
| `robots.txt` | Tells crawlers which pages they can access |
| `llms.txt` | Concise LLM guidance — what your site is and how AI can use it |
| `llms-full.txt` | Extended site reference with pages, APIs, and usage patterns |
| `/api/search?q=` | Lets agents search your content programmatically |
| HTTP headers | X-Robots-Tag, CSP, Permissions-Policy, rate-limit signals |

`llms.txt` and `llms-full.txt` were proposed by Jeremy Howard (fast.ai) as an emerging standard for LLM-readable site summaries, similar to how `robots.txt` and `sitemap.xml` serve crawlers.

---

## Features

### llms.txt Generator (free)
- Input a URL and industry type
- Generates `llms.txt` (concise) and `llms-full.txt` (extended) files
- Industry presets: e-commerce, finance, healthcare, media, SaaS, developer tools, other
- Download and publish at your domain root

### AI Readiness Scanner
- Scans any public website for all five signals
- Returns a 0-100 readiness score with plain-English grade
- Quick Wins list: top 3 fixes ranked by score impact
- Splits findings into "Needs attention" and "Already in place"
- Full PDF report available for $29 (Stripe)

---

## Local development

```bash
git clone https://github.com/limoxt/agentpolicy
cd agentpolicy
npm install
```

Create a `.env.local` file:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment

This project is designed for Vercel.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel deploy --prod
```

Set environment variables in the Vercel dashboard:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Payments:** Stripe Checkout
- **PDF generation:** pdf-lib
- **Deployment:** Vercel

---

## Roadmap

- [ ] Monthly monitoring subscription
- [ ] Email PDF delivery
- [ ] Markdown page export (`/page.md` endpoints)
- [ ] `Cmd+K` search integration check
- [ ] Bulk scan for multiple domains
- [ ] API access for developers

---

## References

- [llms.txt standard](https://llmstxt.org) — Jeremy Howard / fast.ai
- [robots.txt specification](https://www.robotstxt.org)
- [AI readiness discussion](https://x.com/search?q=llms.txt)
