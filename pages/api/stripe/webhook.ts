import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { stripe, allowedEvents } from "../../../src/lib/stripe";
import { handleStripeWebhook } from "../../../src/api/stripe-webhook";

// Disable body parsing, need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const body = await buffer(req);
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(400).json({ error: "No signature found" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body.toString(),
      signature,
      process.env.VITE_STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: err.message });
  }

  // Skip processing if the event isn't one we're tracking
  if (!allowedEvents.includes(event.type)) {
    return res.json({ received: true });
  }

  try {
    // Handle the webhook event
    await handleStripeWebhook(event);
    return res.json({ received: true });
  } catch (error: any) {
    console.error("[STRIPE HOOK] Error processing event:", error);
    // Still return 200 to Stripe to prevent retries
    return res.json({ received: true });
  }
}
