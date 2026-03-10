"use client";
import { useState, useTransition } from "react";
import { INDUSTRIES, type AgentPolicy, type IndustryType } from "@/lib/generatePolicy";
type GenerateResponse = { targetUrl: string; agentPolicy: AgentPolicy; agentPolicyText: string; aiText: string; };
function dl(filename: string, content: string, mime: string) {
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([content], { type: mime })), download: filename });
  document.body.appendChild(a); a.click(); a.remove();
}
export default function PolicyForm() {
  const [url, setUrl] = useState(""); const [industry, setIndustry] = useState<IndustryType>("e-commerce");
  const [result, setResult] = useState<GenerateResponse | null>(null); const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, industry }) });
      const p = (await r.json()) as GenerateResponse | { error: string };
      if (!r.ok || "error" in p) throw new Error((p as { error: string }).error || "Generation failed.");
      startTransition(() => setResult(p as GenerateResponse));
    } catch (err) { setResult(null); setError(err instanceof Error ? err.message : "Unable to generate policy files."); }
  }
  return (
    <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <article className="panel px-6 py-6 md:px-7">
        <div className="space-y-5">
          <div><p className="pill">Input</p><h2 className="mt-4 text-2xl font-bold tracking-tight">Publish default AI rules in under a minute</h2></div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div><label htmlFor="site-url" className="label">Website URL</label><input id="site-url" type="url" className="field" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} required /></div>
            <div><label htmlFor="industry" className="label">Industry type</label>
              <select id="industry" className="field" value={industry} onChange={(e) => setIndustry(e.target.value as IndustryType)}>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select></div>
            <button type="submit" className="btn-primary w-full" disabled={isPending}>{isPending ? "Generating..." : "Generate policy bundle"}</button>
          </form>
          {error && <div className="rounded-2xl border border-berry/20 bg-berry/10 px-4 py-3 text-sm text-berry">{error}</div>}
          <div className="rounded-2xl bg-mist/80 p-4 text-sm text-ink/70">Defaults are intentionally conservative. Review before publishing to production.</div>
        </div>
      </article>
      <article className="panel px-6 py-6 md:px-7">
        {result ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div><p className="pill">Generated bundle</p><h2 className="mt-4 text-2xl font-bold tracking-tight">Ready to download for {result.targetUrl}</h2></div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn-primary" onClick={() => dl("agent-policy.json", result.agentPolicyText, "application/json")}>Download agent-policy.json</button>
                <button type="button" className="btn-secondary" onClick={() => dl("ai.txt", result.aiText, "text/plain")}>Download ai.txt</button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-mist p-5"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">ai.txt preview</p><pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-ink/80">{result.aiText}</pre></div>
              <div className="rounded-3xl bg-ink p-5 text-sand"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-sand/70">JSON structure</p><pre className="mt-3 max-h-[26rem] overflow-auto whitespace-pre-wrap text-xs text-sand/85">{JSON.stringify(result.agentPolicy, null, 2)}</pre></div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[420px] flex-col justify-center items-center rounded-[28px] border border-dashed border-ink/15 bg-white/50 p-6">
            <p className="pill">Output</p><h2 className="mt-4 text-2xl font-bold tracking-tight">Generated files appear here</h2>
            <p className="mt-3 max-w-xl text-center text-ink/70">You will get agent-policy.json and ai.txt with the same operating rules.</p>
          </div>
        )}
      </article>
    </section>
  );
}
