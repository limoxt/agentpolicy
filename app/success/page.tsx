"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <main className="page-shell flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="panel px-8 py-10 max-w-xl w-full text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-lagoon/10 text-3xl mx-auto">✓</div>
        <div className="space-y-3">
          <p className="pill mx-auto">Payment successful</p>
          <h1 className="text-3xl font-bold tracking-tight">Your report is ready</h1>
          <p className="text-ink/70">Click below to download your AI Agent Exposure Report PDF.</p>
        </div>
        {sessionId ? (
          <a
            href={`/api/report?session_id=${sessionId}`}
            className="btn-primary inline-block"
            download
          >
            Download PDF Report
          </a>
        ) : (
          <p className="text-berry text-sm">Missing session ID — please contact support.</p>
        )}
        <p className="text-xs text-ink/40">The report reflects a live scan at time of download.</p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="page-shell text-center py-20 text-ink/60">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
