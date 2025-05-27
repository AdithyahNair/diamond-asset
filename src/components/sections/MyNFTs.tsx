import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserPurchasedNFTs } from "../../lib/supabase";
import { getNftContract, claimToken } from "../../lib/nftContract";
import { ethers } from "ethers";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const MyNFTs = () => {
  const { user, isWalletConnected, connectWallet } = useAuth();
  const [purchasedNFTs, setPurchasedNFTs] = useState<number[]>([]);
  const [claimedNFTs, setClaimedNFTs] = useState<number[]>([]);
  const [isClaiming, setIsClaiming] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (user?.email) {
        const purchased = await getUserPurchasedNFTs(user.email);
        setPurchasedNFTs(purchased);
      }
    };
    checkPurchaseStatus();
  }, [user]);

  useEffect(() => {
    const checkClaimedStatus = async () => {
      if (!isWalletConnected || !purchasedNFTs.length) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = await getNftContract(provider);
        const claimed: number[] = [];

        for (const tokenId of purchasedNFTs) {
          const prePurchaser = await contract.getPrePurchaser(tokenId);
          if (prePurchaser === ethers.ZeroAddress) {
            claimed.push(tokenId);
          }
        }

        setClaimedNFTs(claimed);
      } catch (err) {
        console.error("Error checking claimed status:", err);
      }
    };
    checkClaimedStatus();
  }, [isWalletConnected, purchasedNFTs]);

  const handleClaim = async (tokenId: number) => {
    if (!isWalletConnected) {
      connectWallet();
      return;
    }

    setIsClaiming((prev) => ({ ...prev, [tokenId]: true }));
    setError(null);
    setSuccess(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const result = await claimToken(signer, tokenId);

      if (result.success) {
        setSuccess(`Successfully claimed NFT #${tokenId}!`);
        setClaimedNFTs((prev) => [...prev, tokenId]);
      } else {
        setError(result.error || "Failed to claim NFT");
      }
    } catch (err) {
      console.error("Error claiming NFT:", err);
      setError("Failed to claim NFT. Please try again.");
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
            <h1 className="font-serif text-4xl text-white mb-4">My NFTs</h1>
            <p className="text-white/60">Please log in to view your NFTs</p>
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
          <h1 className="font-serif text-4xl text-white mb-4">My NFTs</h1>
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

        {purchasedNFTs.length === 0 ? (
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
              onClick={() => (window.location.href = "/collections")}
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
            {purchasedNFTs.map((tokenId, index) => (
              <motion.div
                key={tokenId}
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
                    <div className="w-full h-full flex items-center justify-center text-cyan-400 text-2xl font-serif">
                      #{tokenId}
                    </div>
                  </div>

                  <h3 className="text-2xl font-serif text-white mb-4">
                    Turtle Timepiece #{tokenId}
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
