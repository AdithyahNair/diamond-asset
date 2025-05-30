import { ethers } from "ethers";
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from "../lib/nftContract";
import { supabase } from "../lib/supabase";

export async function markTokenAsPrePurchased(
  tokenId: number,
  email: string,
  walletAddress: string
) {
  try {
    // Initialize provider and wallet
    const RPC_URL = import.meta.env.VITE_RPC_URL;
    const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;

    if (!RPC_URL || !PRIVATE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      wallet
    );

    // Verify the user owns this purchase in Supabase
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("nft_purchases")
      .select("*")
      .eq("user_email", email)
      .eq("token_id", tokenId)
      .eq("status", "completed")
      .single();

    if (purchaseError || !purchaseData) {
      throw new Error("No valid purchase found");
    }

    // Mark the token as pre-purchased in the smart contract
    const tx = await contract.markTokenAsPrePurchased(tokenId, walletAddress);
    await tx.wait();

    return { success: true };
  } catch (error) {
    console.error("Error marking token as pre-purchased:", error);
    throw error;
  }
}
