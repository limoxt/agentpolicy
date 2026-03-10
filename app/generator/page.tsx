import PolicyForm from "@/components/PolicyForm";

export default function GeneratorPage() {
  return (
    <main className="page-shell space-y-8">
      <section className="panel px-6 py-8 md:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="pill">Free policy generator</span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Generate machine-readable AI access rules for your website</h1>
          <p className="text-lg text-ink/70">Enter a site URL, choose the closest industry profile, and download both the `agent-policy.json` and `ai.txt` outputs.</p>
        </div>
      </section>
      <PolicyForm />
    </main>
  );
}
