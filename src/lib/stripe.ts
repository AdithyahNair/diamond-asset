import Stripe from "stripe";

// Initialize Stripe with publishable key from environment variable
const stripe = new Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

// Price in cents (USD)
const PRICE = 200; // $2.00

export const createCheckoutSession = async (
  email: string,
  tokenId: number
): Promise<string> => {
  try {
    const session = await stripe.checkout.sessions.create({
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
            unit_amount: PRICE, // $2.00 in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        tokenId: tokenId.toString(),
        email: email,
      },
      success_url: `${window.location.origin}/my-nfts?session_id={CHECKOUT_SESSION_ID}&token_id=${tokenId}`,
      cancel_url: `${window.location.origin}/collections`,
    });

    return session.url || "";
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

export const verifyPayment = async (
  sessionId: string
): Promise<{
  success: boolean;
  tokenId?: number;
  email?: string;
}> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return {
        success: true,
        tokenId: parseInt(session.metadata?.tokenId || "0"),
        email: session.metadata?.email,
      };
    }

    return { success: false };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false };
  }
};
