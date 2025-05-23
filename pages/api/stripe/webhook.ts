import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

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

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tokenId = parseInt(session.metadata?.tokenId || "0");
    const email = session.metadata?.email;

    if (tokenId && email) {
      try {
        // Get user by email
        const { data: userData, error: userError } = await supabase
          .from("user_profiles")
          .select("user_id, nft_purchases")
          .eq("email", email)
          .single();

        if (userError) throw userError;

        // Update NFT purchases
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            nft_purchases: [...(userData.nft_purchases || []), tokenId],
          })
          .eq("user_id", userData.user_id);

        if (updateError) throw updateError;

        console.log(`Successfully updated purchase for token ${tokenId}`);
      } catch (error) {
        console.error("Error updating purchase in database:", error);
        // Still return 200 to Stripe
      }
    }
  }

  res.json({ received: true });
}
