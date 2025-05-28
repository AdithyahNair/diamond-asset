import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";
import { getNftContract } from "./nftContract";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase URL or Anon Key missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

// Create Supabase client with session handling options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: window.localStorage,
  },
});

// Initialize user profile after signup
const initializeUserProfile = async (userId: string, email: string) => {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select()
      .eq("user_id", userId)
      .single();

    if (existingProfile) {
      return;
    }

    const { error } = await supabase.from("user_profiles").insert([
      {
        user_id: userId,
        email: email,
        nft_purchases: [], // Array to store multiple NFT purchases
      },
    ]);

    if (error) throw error;
  } catch (error) {
    console.error("Error initializing user profile:", error);
    throw error;
  }
};

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (!error && data.user) {
    // Initialize user profile after successful signup
    await initializeUserProfile(data.user.id, email);
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Record a minted NFT
export const recordMintedNFT = async (
  email: string,
  walletAddress: string,
  tokenId: number
) => {
  try {
    console.log("Attempting to record mint with:", {
      email,
      walletAddress,
      tokenId,
    });

    const { data, error } = await supabase
      .from("minted_nfts")
      .insert([
        {
          email,
          wallet_address: walletAddress,
          token_id: tokenId,
          minted_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error recording mint:", error);
      throw error;
    }

    // Also update the user's profile with the new NFT purchase
    await updateNFTPurchaseStatus(email, tokenId);

    console.log("Successfully recorded mint:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Error in recordMintedNFT:", error);
    return { data: null, error };
  }
};

// Check if an email has already minted a specific token
export const hasEmailMintedToken = async (email: string, tokenId: number) => {
  try {
    const { data, error } = await supabase
      .from("minted_nfts")
      .select("token_id")
      .eq("email", email)
      .eq("token_id", tokenId)
      .single();

    if (error) {
      console.error("Error checking mint status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking mint status:", error);
    return false;
  }
};

// Get NFTs purchased by a user
export const getUserPurchasedNFTs = async (userEmail: string) => {
  try {
    console.log("Fetching NFTs for:", userEmail);

    // 1. Get NFTs from user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("nft_purchases")
      .eq("email", userEmail)
      .single();

    if (profileError) {
      console.error("Error fetching from user_profiles:", profileError);
    }

    // 2. Get NFTs from minted_nfts
    const { data: mintedData, error: mintedError } = await supabase
      .from("minted_nfts")
      .select("token_id")
      .eq("email", userEmail);

    if (mintedError) {
      console.error("Error fetching from minted_nfts:", mintedError);
    }

    // 3. Get NFTs from nft_purchases
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("nft_purchases")
      .select("token_id")
      .eq("user_email", userEmail)
      .eq("status", "completed");

    if (purchaseError) {
      console.error("Error fetching from nft_purchases:", purchaseError);
    }

    // Combine all sources
    const profileNFTs = profileData?.nft_purchases || [];
    const mintedNFTs = mintedData?.map((item) => item.token_id) || [];
    const purchasedNFTs = purchaseData?.map((item) => item.token_id) || [];

    // Convert all to numbers and remove duplicates
    const allNFTs = [
      ...new Set([
        ...profileNFTs.map(Number),
        ...mintedNFTs.map(Number),
        ...purchasedNFTs.map(Number),
      ]),
    ];

    console.log("Combined NFTs from all sources:", {
      profileNFTs,
      mintedNFTs,
      purchasedNFTs,
      allNFTs,
    });

    return allNFTs;
  } catch (error) {
    console.error("Error getting user purchased NFTs:", error);
    return [];
  }
};

// Check if user has already purchased a specific NFT
export const hasUserPurchasedNFT = async (email: string, tokenId: number) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("nft_purchases")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data?.nft_purchases?.includes(tokenId) || false;
  } catch (error) {
    console.error("Error checking NFT purchase status:", error);
    return false;
  }
};

// Get available NFTs from Supabase - Using minted_nfts table to avoid RLS issues
export const getAvailableNFTsFromSupabase = async (): Promise<{
  availableCount: number;
  availableTokens: number[];
}> => {
  try {
    // Get all minted token IDs
    const { data: mintedNFTs, error } = await supabase
      .from("minted_nfts")
      .select("token_id");

    if (error) {
      console.error("Error fetching minted NFTs:", error);
      throw error;
    }

    // Extract the token IDs that are already minted
    const mintedTokenIds = mintedNFTs.map((nft) => nft.token_id);
    console.log("Minted token IDs:", mintedTokenIds);

    // Generate all possible token IDs (1-8)
    const allTokenIds = Array.from({ length: 8 }, (_, i) => i + 1);

    // Filter out the minted tokens to get available ones
    const availableTokens = allTokenIds.filter(
      (id) => !mintedTokenIds.includes(id)
    );
    console.log("Available token IDs:", availableTokens);

    return {
      availableCount: availableTokens.length,
      availableTokens,
    };
  } catch (error) {
    console.error("Error getting available NFTs:", error);
    return {
      availableCount: 0,
      availableTokens: [],
    };
  }
};

// Update NFT purchase status and mark as pre-purchased on the contract
export const updateNFTPurchaseStatus = async (
  userEmail: string,
  tokenId: number,
  walletAddress?: string
) => {
  try {
    console.log("Updating purchase status for:", {
      userEmail,
      tokenId,
      walletAddress,
    });

    // 1. Update purchase status in Supabase
    const { data, error } = await supabase.from("nft_purchases").upsert(
      {
        user_email: userEmail,
        token_id: tokenId,
        status: "completed",
        wallet_address: walletAddress || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_email,token_id" }
    );

    if (error) {
      console.error("Database error updating purchase:", error);
      throw error;
    }

    console.log("Purchase status updated in database:", data);

    // 2. Mark token as pre-purchased on the contract using contract owner's wallet
    if (walletAddress) {
      console.log("Marking token as pre-purchased on contract");

      // Create a wallet using the contract owner's private key
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
      const ownerWallet = new ethers.Wallet(
        import.meta.env.VITE_CONTRACT_OWNER_KEY || "",
        provider
      );

      // Get contract with owner's signer
      const contract = await getNftContract(ownerWallet);

      // Mark token as pre-purchased
      const tx = await contract.markTokenAsPrePurchased(tokenId, walletAddress);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating NFT purchase status:", error);
    throw error;
  }
};

export default supabase;
