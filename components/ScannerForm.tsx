"use client";
import { useState, useTransition } from "react";
import ReportCard from "@/components/ReportCard";
import type { ScanResult } from "@/lib/scanner";
export default function ScannerForm() {
  const [url, setUrl] = useState(""); const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null); const [isPending, startTransition] = useTransition();
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    try {
      const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const p = (await r.json()) as ScanResult | { error: string };
      if (!r.ok || "error" in p) throw new Error((p as { error: string }).error || "Scan failed.");
      startTransition(() => setResult(p as ScanResult));
    } catch (err) { setResult(null); setError(err instanceof Error ? err.message : "Unable to scan website."); }
  }
  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <article className="panel px-6 py-6 md:px-7">
        <div className="space-y-5">
          <div><p className="pill">Scan target</p><h2 className="mt-4 text-2xl font-bold tracking-tight">Inspect public crawler controls on any website</h2></div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div><label htmlFor="scan-url" className="label">Website URL</label><input id="scan-url" type="url" className="field" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} required /></div>
            <button type="submit" className="btn-primary w-full" disabled={isPending}>{isPending ? "Running scan..." : "Run exposure scan"}</button>
          </form>
          {error && <div className="rounded-2xl border border-berry/20 bg-berry/10 px-4 py-3 text-sm text-berry">{error}</div>}
          <div className="rounded-2xl bg-mist/80 p-4 text-sm text-ink/70">Checks root-level governance files and HTTP headers that shape crawler behavior.</div>
        </div>
      </article>
      <article className="panel px-6 py-6 md:px-7">
        {result ? <ReportCard result={result} /> : (
          <div className="flex h-full min-h-[420px] flex-col justify-center items-center rounded-[28px] border border-dashed border-ink/15 bg-white/50 p-6">
            <p className="pill">Scan report</p><h2 className="mt-4 text-2xl font-bold tracking-tight">Exposure score and findings will appear here</h2>
            <p className="mt-3 max-w-xl text-center text-ink/70">Checks robots.txt, ai.txt, agent-policy.json, and key HTTP headers. Produces a 0–100 exposure score.</p>
          </div>
        )}
      </article>
    </section>
  );
}
