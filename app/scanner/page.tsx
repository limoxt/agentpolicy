import ScannerForm from "@/components/ScannerForm";

export default function ScannerPage() {
  return (
    <main className="page-shell space-y-8">
      <section className="panel px-6 py-8 md:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="pill">AI Readiness Scanner</span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">How AI-ready is your site?</h1>
          <p className="text-lg text-ink/70">
            We check five public signals: <strong>robots.txt</strong>, <strong>llms.txt</strong>, <strong>llms-full.txt</strong>, a <strong>/api/search</strong> endpoint, and key HTTP headers. You get a 0-100 readiness score and a Quick Wins list. The full PDF report is <strong>$29</strong>.
          </p>
        </div>
      </section>
      <ScannerForm />
    </main>
  );
}
