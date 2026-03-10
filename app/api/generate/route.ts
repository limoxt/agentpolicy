import { NextRequest, NextResponse } from "next/server";
import { generatePolicyBundle, isIndustryType } from "@/lib/generatePolicy";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string; industry?: string };
    if (!body.url || typeof body.url !== "string") return NextResponse.json({ error: "Website URL is required." }, { status: 400 });
    if (!body.industry || !isIndustryType(body.industry)) return NextResponse.json({ error: "A supported industry selection is required." }, { status: 400 });
    return NextResponse.json(generatePolicyBundle(body.url, body.industry));
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to generate files." }, { status: 500 }); }
}
