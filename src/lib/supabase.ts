import { createClient } from "@supabase/supabase-js";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

// Create Supabase client with session handling options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
        purchasedNFT: false,
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
export const recordMintedNFT = async (email: string, walletAddress: string) => {
  try {
    console.log("Attempting to record mint with:", { email, walletAddress });

    const { data, error } = await supabase
      .from("minted_emails")
      .insert([
        {
          email,
          wallet_address: walletAddress,
          minted_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error recording mint:", {
        error,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });
      throw error;
    }

    console.log("Successfully recorded mint:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Error in recordMintedNFT:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return { data: null, error };
  }
};

// Check if an email has already minted
export const hasEmailMinted = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from("minted_emails")
      .select("email")
      .eq("email", email)
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
export const updateNFTPurchaseStatus = async (email: string) => {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ purchasedNFT: true })
      .eq("email", email);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating NFT purchase status:", error);
    return { success: false, error };
  }
};

// Check if user has already purchased NFT
export const hasUserPurchasedNFT = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("purchasedNFT")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data?.purchasedNFT || false;
  } catch (error) {
    console.error("Error checking NFT purchase status:", error);
    return false;
  }
};
