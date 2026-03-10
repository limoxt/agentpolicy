import Link from "next/link";

const checks = [
  { label: "robots.txt", desc: "Tells crawlers and agents what they can and cannot access.", tag: "Standard" },
  { label: "llms.txt", desc: "Concise LLM guidance file — what your site is and how AI can use it.", tag: "Emerging" },
  { label: "llms-full.txt", desc: "Extended reference with all pages, APIs, and usage patterns.", tag: "Emerging" },
  { label: "/api/search endpoint", desc: "Lets agents search your content programmatically.", tag: "Best practice" },
  { label: "HTTP headers", desc: "X-Robots-Tag, CSP, Permissions-Policy, and rate-limit signals.", tag: "Standard" },
];

const features = [
  {
    title: "llms.txt Generator",
    description: "Create a llms.txt and llms-full.txt that tell AI agents and LLMs exactly what your site is and how they should interact with it.",
    bullets: ["Industry-specific defaults for SaaS, docs, e-commerce, media, and more", "Generates both the concise and full variants in one click", "Ready to publish — drop the files at your domain root"],
    href: "/generator",
    cta: "Generate for free",
  },
  {
    title: "AI Readiness Scanner",
    description: "Scan any public site to see which AI readiness signals are in place and which are missing.",
    bullets: ["Checks robots.txt, llms.txt, llms-full.txt, and search API", "Scores 0-100 with a plain-English grade", "Quick Wins list shows exactly what to fix first"],
    href: "/scanner",
    cta: "Scan a website",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell space-y-10">
      {/* Hero */}
      <section className="panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="pill">Free tools — no account needed</span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                Is your site ready for the AI agent era?
              </h1>
              <p className="max-w-2xl text-lg text-ink/70 md:text-xl">
                Generate <strong>llms.txt</strong> and <strong>llms-full.txt</strong> for free. Then scan any site to see which AI readiness signals it publishes — and which it&apos;s missing.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/generator" className="btn-primary">Generate llms.txt — Free</Link>
              <Link href="/scanner" className="btn-secondary">Scan a website</Link>
            </div>
          </div>

          {/* Score card */}
          <div className="subtle-panel relative overflow-hidden p-6 md:p-8">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-apricot/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-lagoon/20 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">AI Readiness Score</p>
                  <p className="mt-2 font-heading text-5xl font-bold tracking-tight">34<span className="text-2xl text-ink/45">/100</span></p>
                </div>
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-berry">Needs Work</span>
              </div>
              <div className="space-y-2 text-sm text-ink/70">
                {[
                  { label: "robots.txt", ok: true },
                  { label: "llms.txt", ok: false },
                  { label: "llms-full.txt", ok: false },
                  { label: "/api/search endpoint", ok: false },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${item.ok ? "bg-lagoon/10 text-lagoon" : "bg-white/80"}`}>
                    <span className="shrink-0 text-base">{item.ok ? "✓" : "○"}</span>
                    <span className={item.ok ? "font-semibold" : ""}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="panel px-6 py-8 md:px-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="pill">What we check</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Five signals that make a site AI-ready</h2>
            </div>
            <p className="max-w-sm text-sm text-ink/60">Based on emerging standards by Jeremy Howard, W3C guidance, and developer community best practices.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((c) => (
              <div key={c.label} className="subtle-panel p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{c.label}</p>
                  <span className="pill text-[10px]">{c.tag}</span>
                </div>
                <p className="text-sm text-ink/65">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-6 md:grid-cols-2">
        {features.map((f) => (
          <article key={f.title} className="panel px-6 py-6 md:px-7 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">{f.title}</h2>
              <p className="text-ink/70">{f.description}</p>
              <ul className="space-y-2">
                {f.bullets.map((b) => (
                  <li key={b} className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink/75">{b}</li>
                ))}
              </ul>
            </div>
            <Link href={f.href} className="btn-primary self-start">{f.cta} →</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
