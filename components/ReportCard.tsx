"use client";
import { useState } from "react";
import Link from "next/link";
import type { ScanResult, ScanFinding } from "@/lib/scanner";

function statusClass(s: string) {
  return s === "present" ? "finding-present" : s === "warning" ? "finding-warning" : "finding-missing";
}

function QuickWins({ findings }: { findings: ScanFinding[] }) {
  const missing = findings.filter((f) => f.status !== "present" && f.impact > 0);
  if (missing.length === 0) return null;
  const sorted = [...missing].sort((a, b) => b.impact - a.impact).slice(0, 3);
  const saved = sorted.reduce((acc, f) => acc + f.impact, 0);
  return (
    <div className="rounded-3xl border border-lagoon/20 bg-lagoon/5 px-6 py-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Quick wins</p>
          <p className="mt-1 text-sm text-ink/70">Fix these {sorted.length} items to reduce your score by <span className="font-bold text-lagoon">{saved} points</span></p>
        </div>
      </div>
      <ol className="mt-4 space-y-2">
        {sorted.map((f, i) => (
          <li key={f.id} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lagoon/15 text-xs font-bold text-lagoon">{i + 1}</span>
            <span className="text-ink/80"><span className="font-semibold">{f.label}</span> — saves {f.impact} pts. {f.recommendation}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ReportCard({ result }: { result: ScanResult }) {
  const [loading, setLoading] = useState(false);

  const present = result.findings.filter((f) => f.status === "present");
  const issues = result.findings.filter((f) => f.status !== "present");

  async function handleBuyReport() {
    setLoading(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: result.targetUrl }),
      });
      const data = (await r.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Failed to start checkout.");
    } catch { alert("Failed to start checkout."); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      {/* Score + CTA */}
      <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-[28px] bg-ink p-6 text-sand">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sand/65">Exposure score</p>
          <div className="mt-5 flex items-end gap-3">
            <p className="font-heading text-6xl font-bold">{result.exposureScore}</p>
            <p className="pb-2 text-sand/65">/100</p>
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-sand/50">Benchmark</p>
          <p className="mt-1 text-sm text-sand/70">Most sites score 78–95. Lower is better.</p>
        </div>
        <div className="rounded-[28px] bg-white/75 p-6 flex flex-col justify-between gap-4">
          <div>
            <p className="pill">Scan outcome</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">{result.grade}</h2>
            <p className="mt-1 text-sm text-ink/60 break-all">{result.targetUrl}</p>
            <p className="mt-2 text-sm text-ink/70">{result.summary}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={handleBuyReport} disabled={loading}>
              {loading ? "Redirecting..." : "Download PDF Report — $29"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick wins */}
      <QuickWins findings={result.findings} />

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">Needs attention ({issues.length})</p>
          {issues.map((f) => (
            <div key={f.id} className={`rounded-3xl border px-5 py-4 ${statusClass(f.status)}`}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em]">{f.label}</p>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase text-current">{f.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-current/90">{f.detail}</p>
                  {f.recommendation && <p className="mt-1 text-sm text-current/70">Fix: {f.recommendation}</p>}
                </div>
                <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-current">+{f.impact} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Already good */}
      {present.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">Already in place ({present.length})</p>
          {present.map((f) => (
            <div key={f.id} className="finding-present rounded-3xl border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">✓</span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">{f.label}</p>
                  <p className="mt-1 text-sm text-current/80">{f.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generator CTA */}
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-7 py-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-lagoon/25 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-20 w-40 rounded-full bg-apricot/15 blur-2xl" />
        <div className="relative space-y-2">
          <span className="inline-flex items-center rounded-full bg-lagoon/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-lagoon">Fix it now — free</span>
          <p className="text-xl font-bold tracking-tight text-sand">Generate your llms.txt and llms-full.txt in 30 seconds</p>
          <p className="text-sm text-sand/60">Publish two files to your root domain and AI agents will immediately have structured guidance for your site.</p>
        </div>
        <Link href={`/generator?url=${encodeURIComponent(result.targetUrl)}`} className="relative shrink-0 inline-flex items-center justify-center rounded-full bg-lagoon px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-lagoon/80">
          Generate llms.txt — Free &rarr;
        </Link>
      </div>
    </div>
  );
}
