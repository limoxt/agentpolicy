import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
    const body = (await request.json()) as { targetUrl?: string };
    if (!body.targetUrl) return NextResponse.json({ error: "targetUrl is required." }, { status: 400 });

    const origin = request.headers.get("origin") || "https://agentpolicy.vercel.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "AI Agent Exposure Report",
            description: `Full PDF report for ${body.targetUrl}`,
          },
          unit_amount: 2900,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/scanner`,
      metadata: { targetUrl: body.targetUrl },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed." }, { status: 500 });
  }
}
