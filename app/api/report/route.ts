import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { scanSite, type ScanResult, type ScanFinding } from "@/lib/scanner";

export const dynamic = "force-dynamic";

// ── colour palette ──────────────────────────────────────────────────────────
function hex(h: string): [number, number, number] {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
const INK    = hex("#10231B");
const SAND   = hex("#F6F1E7");
const LAGOON = hex("#0F766E");
const APRICOT= hex("#D97706");
const BERRY  = hex("#8F2D56");
const LGRAY  = hex("#E8EEE8");
const MGRAY  = hex("#8FA8A0");

async function buildPdf(result: ScanResult): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("AI Agent Exposure Report");
  doc.setAuthor("agentpolicy.vercel.app");

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontReg  = await doc.embedFont(StandardFonts.Helvetica);

  const W = 595.28, H = 841.89;
  const ML = 50, MR = 50, MT = 50, MB = 40;
  const CW = W - ML - MR;
  const LH = 15; // base line height

  // ── page / cursor state ──────────────────────────────────────────────────
  let page = doc.addPage([W, H]);
  let y = H - MT;

  function newPage() {
    page = doc.addPage([W, H]);
    y = H - MT;
  }

  function need(h: number) {
    if (y - h < MB + 20) newPage();
  }

  // ── primitives ─────────────────────────────────────────────────────────────
  function drawText(
    s: string, x: number, size: number,
    font = fontReg,
    color: [number,number,number] = INK
  ) {
    if (!s) return;
    page.drawText(s, { x, y, size, font, color: rgb(...color) });
  }

  // Draw text with word-wrap; advances y automatically; returns lines drawn
  function drawWrapped(
    s: string, x: number, maxW: number, size: number,
    font = fontReg, color: [number,number,number] = INK,
    lineH = LH
  ): number {
    if (!s) return 0;
    const words = s.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && cur) {
        lines.push(cur); cur = w;
      } else { cur = test; }
    }
    if (cur) lines.push(cur);
    for (const ln of lines) {
      need(lineH);
      page.drawText(ln, { x, y, size, font, color: rgb(...color) });
      y -= lineH;
    }
    return lines.length;
  }

  function hline(color: [number,number,number] = LGRAY, thickness = 0.75) {
    page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness, color: rgb(...color) });
  }

  function gap(h = LH) { y -= h; }

  // ── COVER BAND ─────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: H - 110, width: W, height: 110, color: rgb(...INK) });
  // decorative circles
  page.drawCircle({ x: W - 70, y: H - 55, size: 80, color: rgb(...LAGOON), opacity: 0.2 });
  page.drawCircle({ x: W - 70, y: H - 55, size: 48, color: rgb(...LAGOON), opacity: 0.25 });

  y = H - 38;
  drawText("AI Agent Exposure Report", ML, 20, fontBold, SAND);
  y = H - 60;
  drawText("agentpolicy.vercel.app", ML, 8.5, fontReg, MGRAY);
  y = H - 80;
  drawText("SITE", ML, 7.5, fontBold, MGRAY);
  drawText(result.targetUrl, ML + 46, 8.5, fontReg, SAND);
  y = H - 96;
  drawText("SCANNED", ML, 7.5, fontBold, MGRAY);
  drawText(new Date(result.scannedAt).toUTCString(), ML + 46, 8, fontReg, SAND);

  y = H - 130;

  // ── SCORE ROW ──────────────────────────────────────────────────────────────
  const sc = result.exposureScore;
  const scColor = sc > 60 ? BERRY : sc > 30 ? APRICOT : LAGOON;

  // Left score box
  page.drawRectangle({ x: ML, y: y - 88, width: 148, height: 96, color: rgb(...LGRAY) });
  const scoreY = y - 20;
  page.drawText("EXPOSURE SCORE", { x: ML + 8, y: scoreY, size: 7, font: fontBold, color: rgb(...MGRAY) });
  page.drawText(`${sc}`, { x: ML + 8, y: scoreY - 44, size: 42, font: fontBold, color: rgb(...scColor) });
  page.drawText("/ 100", { x: ML + 8 + fontBold.widthOfTextAtSize(`${sc}`, 42) + 4, y: scoreY - 33, size: 12, font: fontReg, color: rgb(...MGRAY) });
  page.drawText(result.grade.toUpperCase(), { x: ML + 8, y: scoreY - 78, size: 7.5, font: fontBold, color: rgb(...scColor) });

  // Right summary box
  const sumX = ML + 164;
  const sumW = CW - 164;
  page.drawText("SUMMARY", { x: sumX, y: scoreY, size: 7, font: fontBold, color: rgb(...MGRAY) });
  // manually wrap summary
  const sumWords = result.summary.split(" ");
  let sumLine = ""; let sumY = scoreY - 15;
  for (const w of sumWords) {
    const t = sumLine ? `${sumLine} ${w}` : w;
    if (fontReg.widthOfTextAtSize(t, 9.5) > sumW && sumLine) {
      page.drawText(sumLine, { x: sumX, y: sumY, size: 9.5, font: fontReg, color: rgb(...INK) });
      sumY -= 14; sumLine = w;
    } else sumLine = t;
  }
  if (sumLine) page.drawText(sumLine, { x: sumX, y: sumY, size: 9.5, font: fontReg, color: rgb(...INK) });

  y = y - 104;
  hline(); gap(16);

  // ── BENCHMARK ─────────────────────────────────────────────────────────────
  need(36);
  drawText("BENCHMARK", ML, 7, fontBold, MGRAY);
  drawText("Most sites score 78-95. Lower is better.", ML + 76, 8.5, fontReg, INK);
  gap(14);
  need(18);
  page.drawRectangle({ x: ML, y: y - 8, width: CW, height: 8, color: rgb(...LGRAY) });
  page.drawRectangle({ x: ML, y: y - 8, width: CW * Math.min(sc / 100, 1), height: 8, color: rgb(...scColor) });
  [78, 95].forEach((v) => {
    const bx = ML + CW * (v / 100);
    page.drawLine({ start: { x: bx, y: y - 8 }, end: { x: bx, y: y }, thickness: 1, color: rgb(...INK), opacity: 0.25 });
    page.drawText(`${v}`, { x: bx - 5, y: y - 20, size: 6.5, font: fontReg, color: rgb(...MGRAY) });
  });
  y -= 28;
  hline(); gap(18);

  // ── QUICK WINS ─────────────────────────────────────────────────────────────
  const issues = result.findings.filter((f) => f.status !== "present" && f.impact > 0);
  const top3   = [...issues].sort((a, b) => b.impact - a.impact).slice(0, 3);
  const saved  = top3.reduce((s, f) => s + f.impact, 0);

  if (top3.length > 0) {
    need(24);
    page.drawRectangle({ x: ML, y: y - (top3.length * 34 + 28), width: CW, height: top3.length * 34 + 38, color: rgb(...hex("#EDF7F5")) });
    drawText("QUICK WINS", ML + 10, 7.5, fontBold, LAGOON);
    gap(14);
    drawText(`Fix ${top3.length} items to reduce score by ${saved} points`, ML + 10, 8.5, fontReg, INK);
    gap(16);
    top3.forEach((f, i) => {
      need(34);
      drawText(`${i + 1}.  ${f.label}  —  saves ${f.impact} pts`, ML + 10, 9, fontBold, INK);
      gap(13);
      if (f.recommendation) {
        drawWrapped(`Fix: ${f.recommendation}`, ML + 22, CW - 32, 8, fontReg, MGRAY, 13);
      }
      gap(8);
    });
    gap(6);
    hline(); gap(18);
  }

  // ── FINDING BLOCK ──────────────────────────────────────────────────────────
  function findingRow(f: ScanFinding) {
    const fc  = f.status === "present" ? LAGOON : f.status === "warning" ? APRICOT : BERRY;
    const bg  = f.status === "present" ? hex("#EDF7F5") : f.status === "warning" ? hex("#FEF3C7") : hex("#FAF0F4");
    need(50);
    const startY = y;

    // draw label + status on same line
    page.drawText(`${f.label}`, { x: ML + 10, y: startY, size: 10, font: fontBold, color: rgb(...fc) });
    const statusStr = `[${f.status.toUpperCase()}]  +${f.impact} pts`;
    const statusW = fontBold.widthOfTextAtSize(statusStr, 8);
    page.drawText(statusStr, { x: W - MR - statusW, y: startY, size: 8, font: fontBold, color: rgb(...fc) });
    y -= 16;

    const textX = ML + 10, textW = CW - 20;
    drawWrapped(f.detail, textX, textW, 8.5, fontReg, INK, 13);
    if (f.recommendation) {
      gap(2);
      drawWrapped(`Fix: ${f.recommendation}`, textX, textW, 8, fontReg, MGRAY, 13);
    }

    const endY = y;
    const blockH = startY - endY + 12;
    // draw bg rect behind (drawn after, so won't cover text — use opacity trick)
    // Instead draw a left accent line
    page.drawLine({
      start: { x: ML + 3, y: startY + 2 },
      end: { x: ML + 3, y: endY + 2 },
      thickness: 3, color: rgb(...fc)
    });
    // light bg
    page.drawRectangle({ x: ML, y: endY - 4, width: CW, height: blockH, color: rgb(...bg), opacity: 0.35 });

    gap(14);
  }

  // ── NEEDS ATTENTION ────────────────────────────────────────────────────────
  const issueItems = result.findings.filter((f) => f.status !== "present");
  if (issueItems.length > 0) {
    need(24);
    drawText(`NEEDS ATTENTION  (${issueItems.length})`, ML, 8, fontBold, BERRY);
    gap(16);
    for (const f of issueItems) findingRow(f);
  }

  // ── ALREADY IN PLACE ───────────────────────────────────────────────────────
  const okItems = result.findings.filter((f) => f.status === "present");
  if (okItems.length > 0) {
    need(24);
    hline(); gap(16);
    drawText(`ALREADY IN PLACE  (${okItems.length})`, ML, 8, fontBold, LAGOON);
    gap(16);
    for (const f of okItems) findingRow(f);
  }

  // ── HTTP HEADERS ───────────────────────────────────────────────────────────
  need(40);
  hline(); gap(16);
  drawText("HTTP HEADER SCAN", ML, 9, fontBold, INK);
  gap(16);
  for (const [k, v] of Object.entries(result.headers)) {
    need(16);
    page.drawText(k, { x: ML, y, size: 8.5, font: fontBold, color: rgb(...INK) });
    page.drawText(v || "Not detected", { x: ML + 180, y, size: 8.5, font: fontReg, color: rgb(...(v ? INK : MGRAY)) });
    gap(LH);
  }

  // ── FOOTER on every page ───────────────────────────────────────────────────
  const allPages = doc.getPages();
  for (let i = 0; i < allPages.length; i++) {
    const pg = allPages[i];
    pg.drawLine({ start: { x: ML, y: MB + 18 }, end: { x: W - MR, y: MB + 18 }, thickness: 0.5, color: rgb(...LGRAY) });
    pg.drawText("agentpolicy.vercel.app", { x: ML, y: MB + 6, size: 7, font: fontReg, color: rgb(...MGRAY) });
    pg.drawText(`Page ${i + 1} of ${allPages.length}`, { x: W - MR - 50, y: MB + 6, size: 7, font: fontReg, color: rgb(...MGRAY) });
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
