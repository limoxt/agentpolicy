import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "agentpolicy | Is your site AI-ready?",
  description: "Generate llms.txt and llms-full.txt for free. Scan any website to check AI readiness — robots.txt, llms.txt, search API, and HTTP headers."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <div className="page-shell pb-0">
          <header className="panel relative overflow-hidden px-6 py-5 md:px-8">
            <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-hero-grid bg-[size:18px_18px] opacity-40 md:block" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Link href="/" className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-lg font-bold text-sand">ap</span>
                <div>
                  <p className="font-heading text-xl font-bold tracking-tight">agentpolicy</p>
                  <p className="text-sm text-ink/60">Is your site AI-ready?</p>
                </div>
              </Link>
              <nav className="flex flex-wrap gap-3 text-sm font-semibold text-ink/65">
                <Link href="/generator" className="btn-secondary">llms.txt Generator</Link>
                <Link href="/scanner" className="btn-secondary">AI Readiness Scanner</Link>
              </nav>
            </div>
          </header>
        </div>
        {children}
        <div className="page-shell pt-6">
          <footer className="flex flex-col gap-2 border-t border-ink/10 py-8 text-sm text-ink/60 md:flex-row md:items-center md:justify-between">
            <p>Give AI agents the context they need to work with your site correctly.</p>
            <p>Built with Next.js 14, TypeScript, and Tailwind CSS.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
