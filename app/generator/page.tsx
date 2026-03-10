import PolicyForm from "@/components/PolicyForm";

export default function GeneratorPage() {
  return (
    <main className="page-shell space-y-8">
      <section className="panel px-6 py-8 md:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="pill">Free — no account needed</span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Generate llms.txt and llms-full.txt for your website</h1>
          <p className="text-lg text-ink/70">
            The <strong>llms.txt</strong> standard (proposed by Jeremy Howard) gives AI agents and LLMs a structured summary of your site. Publish two files at your domain root and immediately improve how AI systems discover and use your content.
          </p>
        </div>
      </section>
      <PolicyForm />
    </main>
  );
}
