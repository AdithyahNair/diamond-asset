import Stripe from "stripe";
import { supabase } from "./supabase";

// We don't need to redeclare Window interface as it's already defined in lib.dom.d.ts
// Instead, we'll use the existing window.location.origin directly

// Initialize Stripe with secret key
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

// Price in cents (USD)
const PRICE = 28800; // $2.00

// Allowed webhook events
const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
] as const;

// Type for our NFT purchase cache
interface NFT_PURCHASE_CACHE {
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
}

// Type for expanded PaymentIntent with charges
interface PaymentIntentWithCharges extends Stripe.PaymentIntent {
  charges: {
    data: Array<
      Stripe.Charge & {
        payment_method_details: Stripe.Charge.PaymentMethodDetails;
      }
    >;
  };
}

export async function getOrCreateStripeCustomer(
  email: string,
  userId: string
): Promise<string> {
  try {
    // Check if we already have a Stripe customer ID for this user
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (profile?.stripe_customer_id) {
      // Verify the customer still exists in Stripe
      try {
        const customer = await stripe.customers.retrieve(
          profile.stripe_customer_id
        );
        if (!customer.deleted) {
          return profile.stripe_customer_id;
        }
        // If customer was deleted, continue to create new customer
      } catch (error) {
        console.log("Customer not found in Stripe, creating new one: ", error);
        // Continue to create new customer
      }
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
  } catch (error: unknown) {
    console.error("Error in getOrCreateStripeCustomer:", error);
    throw error instanceof Error ? error : new Error(String(error));
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
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Timeless Experience #${tokenId}`,
              description: "Limited Edition Membership",
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
      success_url: `${origin}/my-collection?session_id={CHECKOUT_SESSION_ID}&token_id=${tokenId}`,
      cancel_url: `${origin}/collection/turtle-timepiece`,
    });

    return session.url ?? "";
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function syncPurchaseDataToKV(
  customerId: string
): Promise<boolean> {
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
      if (payment.status === "succeeded" && payment.metadata?.tokenId) {
        // Retrieve the payment intent with expanded charge data
        const paymentIntentResponse = await stripe.paymentIntents.retrieve(
          payment.id,
          {
            expand: ["charges.data.payment_method_details"],
          }
        );

        // Type assertion after verifying the response has the required properties
        const paymentWithCharges =
          paymentIntentResponse as unknown as PaymentIntentWithCharges;
        if (!paymentWithCharges.charges?.data?.[0]) {
          continue;
        }

        const charge = paymentWithCharges.charges.data[0];
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
  } catch (error: unknown) {
    console.error("Error syncing purchase data:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

async function getCurrentPurchases(userId: string): Promise<number[]> {
  const { data } = await supabase
    .from("user_profiles")
    .select("nft_purchases")
    .eq("user_id", userId)
    .single();

  return data?.nft_purchases ?? [];
}

// Verify a Stripe payment and update the database
export const verifyPayment = async (sessionId: string) => {
  try {
    console.log("Verifying payment for session:", sessionId);

    // Get the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer"],
    });

    console.log("Session status:", session.status);
    console.log("Payment status:", session.payment_status);

    if (session.status !== "complete" || session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Get the token ID from the session metadata
    const tokenId = session.metadata?.tokenId;
    const userEmail = session.customer_details?.email;
    const userId = session.metadata?.userId;

    if (!tokenId || !userEmail) {
      throw new Error("Missing token ID or user email in session");
    }

    console.log("Recording purchase:", { tokenId, userEmail, userId });

    // First, check if this purchase already exists
    const { data: existingPurchase } = await supabase
      .from("nft_purchases")
      .select("*")
      .eq("user_email", userEmail)
      .eq("token_id", Number(tokenId))
      .eq("status", "completed");

    if (existingPurchase && existingPurchase.length > 0) {
      console.log("Purchase already recorded");
      return { success: true };
    }

    // Record the purchase in nft_purchases table
    const { error: purchaseError } = await supabase
      .from("nft_purchases")
      .insert({
        user_email: userEmail,
        token_id: Number(tokenId),
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (purchaseError) {
      console.error("Error recording purchase:", purchaseError);
      throw purchaseError;
    }

    // Update user_profiles if userId exists
    if (userId) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("nft_purchases")
        .eq("user_id", userId)
        .single();

      const currentPurchases = profile?.nft_purchases || [];
      const newPurchases = Array.isArray(currentPurchases)
        ? [...new Set([...currentPurchases, Number(tokenId)])]
        : [Number(tokenId)];

      await supabase
        .from("user_profiles")
        .update({
          nft_purchases: newPurchases,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, error };
  }
};

export { stripe, allowedEvents };
