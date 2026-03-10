"use client";
import type { ScanResult } from "@/lib/scanner";
function statusClass(s: string) { return s === "present" ? "finding-present" : s === "warning" ? "finding-warning" : "finding-missing"; }
export default function ReportCard({ result }: { result: ScanResult }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-[28px] bg-ink p-6 text-sand">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sand/65">Exposure score</p>
          <div className="mt-5 flex items-end gap-3"><p className="font-heading text-6xl font-bold">{result.exposureScore}</p><p className="pb-2 text-sand/65">/100</p></div>
          <p className="mt-4 text-sm text-sand/75">{result.summary}</p>
        </div>
        <div className="rounded-[28px] bg-white/75 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div><p className="pill">Scan outcome</p><h2 className="mt-4 text-2xl font-bold tracking-tight">{result.grade} — {result.targetUrl}</h2></div>
            <button type="button" className="btn-primary" onClick={() => window.alert("PDF reports not live yet.")}>Download PDF Report — $29</button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(result.headers).map(([h, v]) => (
              <div key={h} className="subtle-panel p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">{h}</p><p className="mt-2 break-all text-sm text-ink/75">{v || "Not detected"}</p></div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {result.findings.map((f) => (
          <div key={f.id} className={`rounded-3xl border px-5 py-4 ${statusClass(f.status)}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3"><p className="text-sm font-semibold uppercase tracking-[0.18em]">{f.label}</p><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase text-current">{f.status}</span></div>
                <p className="mt-2 text-sm leading-6 text-current/90">{f.detail}</p>
                {f.recommendation && <p className="mt-2 text-sm text-current/75">Recommendation: {f.recommendation}</p>}
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase text-current">+{f.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
