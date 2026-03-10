import ScannerForm from "@/components/ScannerForm";

export default function ScannerPage() {
  return (
    <main className="page-shell space-y-8">
      <section className="panel px-6 py-8 md:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="pill">Paid scanner UI</span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Score how exposed your site is to AI agents and automated crawling</h1>
          <p className="text-lg text-ink/70">The scan runs server-side so it can inspect public files and HTTP headers without browser CORS limits. The PDF report CTA is a monetization placeholder only.</p>
        </div>
      </section>
      <ScannerForm />
    </main>
  );
}
