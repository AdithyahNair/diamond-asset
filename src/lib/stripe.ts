import Stripe from "stripe";
import { supabase } from "./supabase";

// Initialize Stripe with secret key
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

// Price in cents (USD)
const PRICE = 200; // $2.00

// Allowed webhook events
const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
];

// Type for our NFT purchase cache
type NFT_PURCHASE_CACHE = {
  tokenId: number;
  status: "completed" | "pending" | "failed";
  paymentMethod: {
    type: "card" | "crypto";
    details?: {
      brand?: string | null;
      last4?: string | null;
    };
  };
  purchaseDate: number;
};

// Type for expanded PaymentIntent with charges
type PaymentIntentWithCharges = Stripe.PaymentIntent & {
  charges: {
    data: Array<
      Stripe.Charge & {
        payment_method_details: Stripe.Charge.PaymentMethodDetails;
      }
    >;
  };
};

export async function getOrCreateStripeCustomer(email: string, userId: string) {
  try {
    // Check if we already have a Stripe customer ID for this user
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (profile?.stripe_customer_id) {
      return profile.stripe_customer_id;
    }

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    // Store the customer ID in Supabase
    await supabase
      .from("user_profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("user_id", userId);

    return customer.id;
  } catch (error) {
    console.error("Error in getOrCreateStripeCustomer:", error);
    throw error;
  }
}

export async function createCheckoutSession(
  email: string,
  userId: string,
  tokenId: number
): Promise<string> {
  try {
    // Always ensure we have a customer first
    const customerId = await getOrCreateStripeCustomer(email, userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Turtle Timepiece #${tokenId}`,
              description: "Limited Edition NFT",
            },
            unit_amount: PRICE,
          },
          quantity: 1,
        },
      ],
      metadata: {
        tokenId: tokenId.toString(),
        userId,
      },
      success_url: `${window.location.origin}/my-nfts?session_id={CHECKOUT_SESSION_ID}&token_id=${tokenId}`,
      cancel_url: `${window.location.origin}/collections`,
    });

    return session.url || "";
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function syncPurchaseDataToKV(customerId: string) {
  try {
    // Get all successful payments for this customer
    const payments = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100, // Adjust as needed
    });

    // Get customer for metadata
    const customer = await stripe.customers.retrieve(customerId);

    // Type guard for deleted customers
    if (customer.deleted) {
      throw new Error("Customer has been deleted");
    }

    const userId = customer.metadata.userId;
    if (!userId) throw new Error("No userId in customer metadata");

    // Process each payment and update KV store
    for (const payment of payments.data) {
      if (payment.status === "succeeded" && payment.metadata.tokenId) {
        // Retrieve the payment intent with expanded charge data
        const paymentWithCharges = (await stripe.paymentIntents.retrieve(
          payment.id,
          {
            expand: ["charges.data.payment_method_details"],
          }
        )) as PaymentIntentWithCharges;

        const charge = paymentWithCharges.charges?.data[0];
        const cardDetails = charge?.payment_method_details?.card;

        const purchaseData: NFT_PURCHASE_CACHE = {
          tokenId: parseInt(payment.metadata.tokenId),
          status: "completed",
          paymentMethod: {
            type: "card",
            details: cardDetails
              ? {
                  brand: cardDetails.brand,
                  last4: cardDetails.last4,
                }
              : undefined,
          },
          purchaseDate: payment.created,
        };

        // Update Supabase with purchase data
        await supabase
          .from("user_profiles")
          .update({
            nft_purchases: [
              ...(await getCurrentPurchases(userId)),
              purchaseData.tokenId,
            ],
          })
          .eq("user_id", userId);
      }
    }

    return true;
  } catch (error) {
    console.error("Error syncing purchase data:", error);
    throw error;
  }
}

async function getCurrentPurchases(userId: string): Promise<number[]> {
  const { data } = await supabase
    .from("user_profiles")
    .select("nft_purchases")
    .eq("user_id", userId)
    .single();

  return data?.nft_purchases || [];
}

export async function verifyPayment(sessionId: string): Promise<{
  success: boolean;
  tokenId?: number;
  userId?: string;
}> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return {
        success: true,
        tokenId: parseInt(session.metadata?.tokenId || "0"),
        userId: session.metadata?.userId,
      };
    }

    return { success: false };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false };
  }
}

export { stripe, allowedEvents };
