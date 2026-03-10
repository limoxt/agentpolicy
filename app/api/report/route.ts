import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { scanSite, type ScanResult, type ScanFinding } from "@/lib/scanner";

export const dynamic = "force-dynamic";

function c(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

const INK    = c("#10231B");
const SAND   = c("#F6F1E7");
const LAGOON = c("#0F766E");
const APRICOT= c("#E08A3A");
const BERRY  = c("#8F2D56");
const LIGHT  = c("#F0F4F2");
const MID    = c("#9BB0A8");

async function buildPdf(result: ScanResult): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("AI Agent Exposure Report");
  doc.setAuthor("agentpolicy.vercel.app");
  doc.setSubject(`Scan report for ${result.targetUrl}`);

  const bold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const oblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const W = 595.28, H = 841.89, M = 48;
  const CW = W - 2 * M;

  // ── helpers ───────────────────────────────────────────────────────────────
  let page = doc.addPage([W, H]);
  let y = H - M;

  function newPage() { page = doc.addPage([W, H]); y = H - M; }
  function checkY(need: number) { if (y < M + need) newPage(); }

  function txt(s: string, x: number, yy: number, size: number, font = regular, color: [number,number,number] = INK, maxWidth?: number) {
    if (!s) return;
    if (maxWidth) {
      // naive word-wrap
      const words = s.split(" ");
      let line = "";
      let ly = yy;
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
          page.drawText(line, { x, y: ly, size, font, color: rgb(...color) });
          ly -= size * 1.45;
          line = w;
        } else { line = test; }
      }
      if (line) page.drawText(line, { x, y: ly, size, font, color: rgb(...color) });
      return;
    }
    page.drawText(s, { x, y: yy, size, font, color: rgb(...color) });
  }

  function wrappedHeight(s: string, size: number, font = regular, maxWidth = CW): number {
    const words = s.split(" ");
    let line = ""; let lines = 1;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) { lines++; line = w; }
      else line = test;
    }
    return lines * size * 1.45;
  }

  function hline(yy: number, color: [number,number,number] = LIGHT, thickness = 0.75) {
    page.drawLine({ start: { x: M, y: yy }, end: { x: W - M, y: yy }, thickness, color: rgb(...color) });
  }

  function rect(x: number, yy: number, w: number, h: number, color: [number,number,number]) {
    page.drawRectangle({ x, y: yy, width: w, height: h, color: rgb(...color) });
  }

  function scoreColor(): [number,number,number] {
    return result.exposureScore > 60 ? BERRY : result.exposureScore > 30 ? APRICOT : LAGOON;
  }

  // ── COVER PAGE ─────────────────────────────────────────────────────────────
  // Dark header band
  rect(0, H - 130, W, 130, INK);
  // Decorative circle
  page.drawCircle({ x: W - 60, y: H - 65, size: 90, color: rgb(...LAGOON), opacity: 0.18 });
  page.drawCircle({ x: W - 60, y: H - 65, size: 55, color: rgb(...LAGOON), opacity: 0.22 });

  txt("AI Agent Exposure Report", M, H - 52, 22, bold, SAND);
  txt("agentpolicy.vercel.app", M, H - 74, 9, oblique, MID);

  // Scan meta
  txt("SITE", M, H - 100, 7.5, bold, MID);
  txt(result.targetUrl, M + 52, H - 100, 8.5, regular, SAND);
  txt("SCANNED", M, H - 116, 7.5, bold, MID);
  txt(new Date(result.scannedAt).toUTCString(), M + 52, H - 116, 8.5, regular, SAND);

  y = H - 160;

  // Score hero
  const sc = result.exposureScore;
  const sc_col = scoreColor();
  rect(M, y - 90, 150, 100, LIGHT);
  txt("EXPOSURE SCORE", M + 10, y - 16, 7, bold, MID);
  txt(`${sc}`, M + 10, y - 62, 44, bold, sc_col);
  txt("/ 100", M + 10 + bold.widthOfTextAtSize(`${sc}`, 44) + 6, y - 48, 14, regular, MID);
  txt(result.grade.toUpperCase(), M + 10, y - 82, 8, bold, sc_col);

  // Summary box
  const sumX = M + 168, sumW = CW - 168;
  txt("SUMMARY", sumX, y - 16, 7, bold, MID);
  txt(result.summary, sumX, y - 32, 9.5, regular, INK, sumW);

  y -= 112; hline(y); y -= 16;

  // Benchmark bar
  txt("BENCHMARK", M, y, 7, bold, MID);
  txt("Most sites score 78–95. Lower is better.", M + 72, y, 8.5, regular, INK);
  y -= 14;
  // bar track
  rect(M, y - 8, CW, 7, LIGHT);
  const pct = Math.min(sc / 100, 1);
  rect(M, y - 8, CW * pct, 7, sc_col);
  // marker at 78 and 95
  [78, 95].forEach((v) => {
    const bx = M + CW * (v / 100);
    page.drawLine({ start: { x: bx, y: y - 8 }, end: { x: bx, y: y - 1 }, thickness: 0.75, color: rgb(...INK), opacity: 0.3 });
    txt(`${v}`, bx - 5, y - 18, 6.5, regular, MID);
  });
  y -= 28; hline(y); y -= 20;

  // ── QUICK WINS ─────────────────────────────────────────────────────────────
  const issues = result.findings.filter((f) => f.status !== "present" && f.impact > 0);
  const top3 = [...issues].sort((a, b) => b.impact - a.impact).slice(0, 3);
  const saved = top3.reduce((s, f) => s + f.impact, 0);

  if (top3.length > 0) {
    rect(M, y - (top3.length * 38 + 42), CW, top3.length * 38 + 52, LIGHT);
    txt("QUICK WINS", M + 10, y - 12, 7.5, bold, LAGOON);
    txt(`Fix ${top3.length} items to reduce score by ${saved} points`, M + 10, y - 26, 9, regular, INK);
    y -= 42;
    top3.forEach((f, i) => {
      const bullet = `${i + 1}. ${f.label}  —  saves ${f.impact} pts`;
      txt(bullet, M + 10, y, 9, bold, INK);
      y -= 14;
      if (f.recommendation) {
        const rec = `   Fix: ${f.recommendation}`;
        txt(rec, M + 10, y, 8, regular, MID, CW - 20);
      }
      y -= 24;
    });
    y -= 8; hline(y); y -= 20;
  }

  // ── FINDINGS ───────────────────────────────────────────────────────────────
  function findingBlock(f: ScanFinding) {
    const fc = f.status === "present" ? LAGOON : f.status === "warning" ? APRICOT : BERRY;
    const bg = f.status === "present" ? c("#EDF7F5") : f.status === "warning" ? c("#FEF4E4") : c("#FAF0F4");
    const detH = wrappedHeight(f.detail, 8.5, regular, CW - 100);
    const recH = f.recommendation ? wrappedHeight(`Fix: ${f.recommendation}`, 8, regular, CW - 100) + 4 : 0;
    const bh = detH + recH + 40;
    checkY(bh + 10);
    rect(M, y - bh + 8, CW, bh, bg);
    // status pill
    const pillW = bold.widthOfTextAtSize(f.status.toUpperCase(), 7) + 12;
    rect(W - M - pillW - 50, y - 4, pillW, 14, fc);
    txt(f.status.toUpperCase(), W - M - pillW - 44, y + 1, 7, bold, SAND);
    txt(`+${f.impact}`, W - M - 40, y + 1, 7, bold, fc);
    txt(f.label, M + 10, y, 10, bold, fc);
    y -= 18;
    txt(f.detail, M + 10, y, 8.5, regular, INK, CW - 100);
    y -= detH + 2;
    if (f.recommendation) {
      txt(`Fix: ${f.recommendation}`, M + 10, y, 8, oblique, MID, CW - 100);
      y -= recH;
    }
    y -= 14;
  }

  // Issues section
  const issueFindings = result.findings.filter((f) => f.status !== "present");
  if (issueFindings.length > 0) {
    checkY(30);
    txt("NEEDS ATTENTION", M, y, 8, bold, BERRY);
    txt(`${issueFindings.length} item${issueFindings.length > 1 ? "s" : ""}`, M + CW - 30, y, 8, regular, MID);
    y -= 16;
    for (const f of issueFindings) findingBlock(f);
  }

  // Present section
  const presentFindings = result.findings.filter((f) => f.status === "present");
  if (presentFindings.length > 0) {
    checkY(30);
    hline(y); y -= 16;
    txt("ALREADY IN PLACE", M, y, 8, bold, LAGOON);
    txt(`${presentFindings.length} item${presentFindings.length > 1 ? "s" : ""}`, M + CW - 30, y, 8, regular, MID);
    y -= 16;
    for (const f of presentFindings) findingBlock(f);
  }

  // ── HTTP HEADERS ───────────────────────────────────────────────────────────
  checkY(60);
  hline(y); y -= 16;
  txt("HTTP HEADER SCAN", M, y, 8, bold, INK);
  y -= 18;

  for (const [k, v] of Object.entries(result.headers)) {
    checkY(18);
    txt(k, M, y, 8.5, bold, INK);
    txt(v || "Not detected", M + 180, y, 8.5, v ? regular : oblique, v ? INK : MID);
    y -= 16;
  }

  // ── FOOTER on every page ───────────────────────────────────────────────────
  const pages = doc.getPages();
  for (const pg of pages) {
    pg.drawLine({ start: { x: M, y: M + 18 }, end: { x: W - M, y: M + 18 }, thickness: 0.5, color: rgb(...LIGHT) });
    pg.drawText("agentpolicy.vercel.app", { x: M, y: M + 6, size: 7, font: regular, color: rgb(...MID) });
    pg.drawText(`Page ${pages.indexOf(pg) + 1} of ${pages.length}`, { x: W - M - 40, y: M + 6, size: 7, font: regular, color: rgb(...MID) });
  }

  return doc.save();
}

export async function GET(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "session_id required." }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return NextResponse.json({ error: "Payment not completed." }, { status: 402 });

    const targetUrl = session.metadata?.targetUrl;
    if (!targetUrl) return NextResponse.json({ error: "No target URL in session." }, { status: 400 });

    const result = await scanSite(targetUrl);
    const pdf = await buildPdf(result);

    return new NextResponse(pdf.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="agentpolicy-report-${Date.now()}.pdf"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (e) {
    console.error("report error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Report generation failed." }, { status: 500 });
  }
}
