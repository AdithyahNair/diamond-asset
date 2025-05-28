import { createClient } from "@supabase/supabase-js";

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

// Update user's NFT purchase status
export const updateNFTPurchaseStatus = async (
  email: string,
  tokenId: number
) => {
  try {
    // First get the current purchases array
    const { data: profile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("nft_purchases")
      .eq("email", email)
      .single();

    if (fetchError) throw fetchError;

    // Add the new token ID to the purchases array
    const currentPurchases = profile?.nft_purchases || [];
    if (!currentPurchases.includes(tokenId)) {
      const { error } = await supabase
        .from("user_profiles")
        .update({ nft_purchases: [...currentPurchases, tokenId] })
        .eq("email", email);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating NFT purchase status:", error);
    return { success: false, error };
  }
};

// Get all NFTs purchased by a user
export const getUserPurchasedNFTs = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("nft_purchases")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data?.nft_purchases || [];
  } catch (error) {
    console.error("Error getting user's purchased NFTs:", error);
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

// Get available NFTs from Supabase - Using user_profiles table (RLS disabled)
interface AvailableNFTsResponse {
  availableCount: number;
  availableTokens: number[];
}

export const getAvailableNFTsFromSupabase =
  async (): Promise<AvailableNFTsResponse> => {
    try {
      // Get ALL profiles and their nft_purchases arrays
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select("nft_purchases, email");

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      console.log("All profiles data:", JSON.stringify(profiles, null, 2));
      console.log("Number of profiles found:", profiles?.length || 0);

      if (!profiles || profiles.length === 0) {
        console.log("No profiles found");
        return { availableCount: 8, availableTokens: [1, 2, 3, 4, 5, 6, 7, 8] }; // If no profiles, all NFTs are available
      }

      // Get all purchased token IDs across all users
      const purchasedTokens = new Set<number>();
      profiles.forEach((profile) => {
        const purchases = profile.nft_purchases || [];
        purchases.forEach((tokenId: number) => purchasedTokens.add(tokenId));
      });

      // Calculate available tokens (tokens 1-8 that are not in purchasedTokens)
      const availableTokens: number[] = [];
      for (let i = 1; i <= 8; i++) {
        if (!purchasedTokens.has(i)) {
          availableTokens.push(i);
        }
      }

      console.log("Available tokens:", availableTokens);
      return {
        availableCount: availableTokens.length,
        availableTokens,
      };
    } catch (error) {
      console.error("Error getting available NFTs from Supabase:", error);
      return { availableCount: 0, availableTokens: [] };
    }
  };

export default supabase;
