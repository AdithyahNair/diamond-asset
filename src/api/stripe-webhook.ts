import { ethers } from "ethers";
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from "../lib/nftContract";
import { supabase } from "../lib/supabase";
import { addSubscriberToMailerLite } from "../lib/mailerlite";
import type Stripe from "stripe";

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(import.meta.env.VITE_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
  wallet
);

export async function handleStripeWebhook(event: Stripe.Event) {
  // Only handle successful payments
  if (event.type !== "checkout.session.completed") {
    return { success: true };
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const tokenId = session.metadata?.tokenId;
    const userEmail = session.customer_details?.email;
    const userName = session.customer_details?.name || "";

    // Split the name into first and last name
    const [firstName = "", lastName = ""] = userName.split(" ");

    if (!tokenId || !userEmail) {
      throw new Error("Missing token ID or user email");
    }

    // First record the purchase in Supabase
    const { error: purchaseError } = await supabase
      .from("nft_purchases")
      .upsert({
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

    // Add subscriber to MailerLite
    await addSubscriberToMailerLite({
      email: userEmail,
      fields: {
        name: firstName,
        last_name: lastName,
      },
    });

    // Get the user's wallet address from Supabase
    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("wallet_address")
      .eq("email", userEmail)
      .single();

    // If user has a wallet connected, mark the token as pre-purchased
    if (!userError && userData?.wallet_address) {
      try {
        const tx = await contract.markTokenAsPrePurchased(
          tokenId,
          userData.wallet_address
        );
        await tx.wait();
        console.log(
          `Token ${tokenId} marked as pre-purchased for ${userData.wallet_address}`
        );
      } catch (error) {
        // Log the error but don't throw - the user can still claim later
        console.error("Error marking token as pre-purchased:", error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in Stripe webhook:", error);
    // Don't throw, just log the error and return success to prevent Stripe retries
    return { success: true };
  }
}
