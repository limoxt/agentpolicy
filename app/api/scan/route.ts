import { NextRequest, NextResponse } from "next/server";
import { scanSite } from "@/lib/scanner";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string };
    if (!body.url || typeof body.url !== "string") return NextResponse.json({ error: "Website URL is required." }, { status: 400 });
    return NextResponse.json(await scanSite(body.url));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unable to scan website.";
    return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("valid website url") ? 400 : 500 });
  }
}
