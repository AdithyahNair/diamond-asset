import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUserPurchasedNFTs,
  updateNFTPurchaseStatus,
} from "../../lib/supabase";
import {
  getNftContract,
  claimToken,
  claimStripePurchasedNFT,
} from "../../lib/nftContract";
import { verifyPayment } from "../../lib/stripe";
import { ethers } from "ethers";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { recordMintedNFT } from "../../lib/supabase";
import { markTokenAsPrePurchased } from "../../api/mark-token-prepurchased";

const MyNFTs = () => {
  const { user, isWalletConnected, connectWallet, walletAddress } = useAuth();
  const [purchasedNFTs, setPurchasedNFTs] = useState<number[]>([]);
  const [claimedNFTs, setClaimedNFTs] = useState<number[]>([]);
  const [isClaiming, setIsClaiming] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check NFT status from database
  const checkNFTStatus = async () => {
    if (!user?.email) return;

    console.log("Checking NFT status for:", user.email);
    try {
      // 1. Get all NFTs from nft_purchases table (Stripe purchases)
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("nft_purchases")
        .select("token_id")
        .eq("user_email", user.email)
        .eq("status", "completed");

      if (purchaseError) {
        throw purchaseError;
      }

      // Get unique token IDs from Stripe purchases
      const stripePurchasedNFTs = [
        ...new Set(purchaseData?.map((p) => p.token_id) || []),
      ];
      console.log("Stripe purchased NFTs:", stripePurchasedNFTs);

      // 2. Get all minted NFTs (both claimed Stripe purchases and direct crypto purchases)
      const { data: mintedData, error: mintedError } = await supabase
        .from("minted_nfts")
        .select("token_id")
        .eq("email", user.email);

      if (mintedError) {
        throw mintedError;
      }

      const mintedNFTs = [
        ...new Set(mintedData?.map((item) => item.token_id) || []),
      ];
      console.log("All minted NFTs:", mintedNFTs);

      // 3. Separate into claimed and unclaimed
      // - Claimed NFTs are all NFTs in minted_nfts
      // - Unclaimed NFTs are Stripe purchases that haven't been minted yet
      const claimed = mintedNFTs;
      const unclaimed = stripePurchasedNFTs.filter(
        (id) => !mintedNFTs.includes(id)
      );

      console.log("Final status:", { claimed, unclaimed });
      setClaimedNFTs(claimed);
      setPurchasedNFTs(unclaimed);
    } catch (err) {
      console.error("Error checking NFT status:", err);
      setError("Failed to load your NFTs. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    checkNFTStatus();

    // Refresh every 30 seconds
    const interval = setInterval(checkNFTStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Stripe redirect
  useEffect(() => {
    const handleStripeRedirect = async () => {
      const sessionId = searchParams.get("session_id");
      const tokenId = searchParams.get("token_id");

      if (sessionId && tokenId && user?.email && !isProcessingPayment) {
        setIsProcessingPayment(true);
        setError(null);
        try {
          console.log("Processing Stripe payment:", { sessionId, tokenId });

          // 1. Verify the payment in Stripe
          const verificationResult = await verifyPayment(sessionId);
          if (!verificationResult.success) {
            throw new Error("Payment verification failed");
          }

          // 2. Wait for webhook to process (max 5 seconds)
          let attempts = 0;
          while (attempts < 5) {
            const { data: purchase } = await supabase
              .from("nft_purchases")
              .select("*")
              .eq("user_email", user.email)
              .eq("token_id", Number(tokenId))
              .eq("status", "completed")
              .single();

            if (purchase) {
              setSuccess(
                `Successfully purchased NFT #${tokenId}! Connect your wallet to claim it.`
              );
              await checkNFTStatus();
              return;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
            attempts++;
          }

          // If we get here, webhook hasn't processed yet
          setSuccess(
            `Payment received! Please wait a moment for your NFT to appear.`
          );
        } catch (err) {
          console.error("Error processing Stripe payment:", err);
          setError(
            "There was an error processing your payment. Please contact support if you were charged."
          );
        } finally {
          setIsProcessingPayment(false);
        }
      }
    };

    handleStripeRedirect();
  }, [searchParams, user]);

  const handleClaim = async (tokenId: number) => {
    if (!isWalletConnected) {
      connectWallet();
      return;
    }

    if (!user?.email || !walletAddress) {
      setError("Please connect your wallet to claim NFTs");
      return;
    }

    setIsClaiming((prev) => ({ ...prev, [tokenId]: true }));
    setError(null);
    setSuccess(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // First check if the token is already marked as pre-purchased for this wallet
      const contract = await getNftContract(provider);
      const prePurchaser = await contract.getPrePurchaser(tokenId);

      if (prePurchaser === ethers.ZeroAddress) {
        // Token not marked as pre-purchased yet, let's mark it
        // Update the user's wallet address in Supabase
        const { data: userData, error: userError } = await supabase
          .from("user_profiles")
          .select("wallet_address")
          .eq("email", user.email)
          .single();

        if (userError) {
          throw new Error("Failed to fetch user profile");
        }

        // Only update if the wallet address has changed or is not set
        if (
          !userData?.wallet_address ||
          userData.wallet_address.toLowerCase() !== walletAddress.toLowerCase()
        ) {
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({ wallet_address: walletAddress })
            .eq("email", user.email);

          if (updateError) {
            throw new Error("Failed to update wallet address");
          }
        }

        try {
          await markTokenAsPrePurchased(tokenId, user.email, walletAddress);
          // Show a message that we're waiting for the token to be marked
          setSuccess(
            "Your wallet has been registered. Please wait a few minutes for the token to be marked as pre-purchased, then try claiming again."
          );
          return;
        } catch (error) {
          throw new Error("Failed to mark token as pre-purchased");
        }
      }

      // Now try to claim the token
      const result = await claimStripePurchasedNFT(signer, tokenId, user.email);

      if (result.success) {
        // Record the mint in database
        await recordMintedNFT(user.email, walletAddress, tokenId);

        setSuccess(`Successfully claimed NFT #${tokenId}!`);
        // Update the lists immediately
        setClaimedNFTs((prev) => [...prev, tokenId]);
        setPurchasedNFTs((prev) => prev.filter((id) => id !== tokenId));
      } else {
        setError(result.error || "Failed to claim NFT");
      }
    } catch (err) {
      console.error("Error claiming NFT:", err);
      setError(
        (err as Error).message === "Failed to fetch user profile"
          ? "Failed to fetch your profile. Please try again."
          : (err as Error).message === "Failed to update wallet address"
          ? "Failed to update your wallet address. Please try again."
          : (err as Error).message === "Failed to mark token as pre-purchased"
          ? "Failed to register your wallet. Please try again in a few minutes."
          : "Failed to claim NFT. Please try again."
      );
    } finally {
      setIsClaiming((prev) => ({ ...prev, [tokenId]: false }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-serif text-4xl text-white mb-4">
              My Collection
            </h1>
            <p className="text-white/60">
              Please log in to view your collection
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl text-white mb-4">My Collection</h1>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-cyan-400 text-sm"
          >
            {success}
          </motion.div>
        )}

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-white/60 mt-4">Loading your NFTs...</p>
          </motion.div>
        ) : purchasedNFTs.length === 0 && claimedNFTs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16"
          >
            <p className="text-white/60 text-lg">
              You haven't purchased any NFTs yet
            </p>
            <motion.button
              whileHover={{ y: -2 }}
              className="mt-6 px-8 py-3 bg-cyan-400 text-black rounded-xl font-medium hover:bg-cyan-300 transition-colors"
              onClick={() =>
                (window.location.href = "/collection/timeless-experience")
              }
            >
              Browse Collections
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[...claimedNFTs, ...purchasedNFTs].map((tokenId, index) => (
              <motion.div
                key={`${tokenId}-${
                  claimedNFTs.includes(tokenId) ? "claimed" : "unclaimed"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black/50 rounded-2xl p-6 border border-cyan-400/20 hover:border-cyan-400/30 transition-all duration-300 relative group"
              >
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400/30" />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400/30" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400/30" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400/30" />

                <div className="relative">
                  <div className="aspect-square bg-black/60 rounded-xl mb-6 overflow-hidden border border-cyan-400/20">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source
                        src="/videos/nft-video-5sec.mp4"
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-cyan-400 text-sm font-medium">
                      #{tokenId}
                    </div>
                  </div>

                  <h3 className="text-2xl font-serif text-white mb-4">
                    Timeless Experience #{tokenId}
                  </h3>

                  {claimedNFTs.includes(tokenId) ? (
                    <div className="flex items-center space-x-2 text-cyan-400">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Claimed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(tokenId)}
                      disabled={isClaiming[tokenId]}
                      className={`w-full py-3 px-4 rounded-xl transition-all duration-300 ${
                        isClaiming[tokenId]
                          ? "bg-cyan-400/20 text-cyan-400/60 cursor-not-allowed"
                          : "bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/30"
                      }`}
                    >
                      {isClaiming[tokenId] ? "Claiming..." : "Claim NFT"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyNFTs;
