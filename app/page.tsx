import Link from "next/link";

const featureCards = [
  {
    title: "Generator",
    description: "Create an `agent-policy.json` and `ai.txt` pair from a single URL and industry selection.",
    bullets: ["Covers read access, forms, purchases, data collection, and rate limits", "Generates downloadable files instantly", "Uses industry-aware defaults for regulated and transactional sites"]
  },
  {
    title: "Scanner",
    description: "Run a server-side scan of public signals that shape how AI agents interact with your site.",
    bullets: ["Checks `robots.txt`, `ai.txt`, `agent-policy.json`, and key headers", "Produces a 0-100 exposure score", "Includes a paid PDF report CTA placeholder for future monetization"]
  }
];

const industries = ["e-commerce", "finance", "healthcare", "media", "SaaS", "other"];

export default function HomePage() {
  return (
    <main className="page-shell space-y-10">
      <section className="panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="pill">MVP</span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                Publish the rules AI agents should follow before they crawl, collect, or convert.
              </h1>
              <p className="max-w-2xl text-lg text-ink/70 md:text-xl">
                agentpolicy gives operators a fast way to generate explicit AI access rules and inspect how exposed an existing site is today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/generator" className="btn-primary">Generate Free Policy</Link>
              <Link href="/scanner" className="btn-secondary">Scan a Website</Link>
            </div>
          </div>
          <div className="subtle-panel relative overflow-hidden p-6 md:p-8">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-apricot/35 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-lagoon/20 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">Example exposure score</p>
                  <p className="mt-2 font-heading text-5xl font-bold tracking-tight">68<span className="text-2xl text-ink/45">/100</span></p>
                </div>
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-berry">Moderate risk</span>
              </div>
              <div className="space-y-3 text-sm text-ink/70">
                <div className="rounded-2xl bg-white/80 p-4">Missing `agent-policy.json` means there is no machine-readable policy for agent behavior.</div>
                <div className="rounded-2xl bg-white/80 p-4">No published rate limit guidance increases collection risk and leaves enforcement ambiguous.</div>
                <div className="rounded-2xl bg-white/80 p-4">Adding `ai.txt` and crawler headers can materially reduce ambiguity for compliant agents.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {featureCards.map((card) => (
          <article key={card.title} className="panel px-6 py-6 md:px-7">
            <p className="pill">{card.title}</p>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">{card.description}</h2>
            <ul className="mt-5 space-y-3 text-sm text-ink/70">
              {card.bullets.map((bullet) => (
                <li key={bullet} className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3">{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="panel px-6 py-8 md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="pill">Industry presets</p>
            <h2 className="text-3xl font-bold tracking-tight">Sensible defaults for high-trust and high-volume websites</h2>
          </div>
          <div className="flex max-w-xl flex-wrap gap-3">
            {industries.map((industry) => (<span key={industry} className="pill bg-white/85">{industry}</span>))}
          </div>
        </div>
      </section>
    </main>
  );
}
