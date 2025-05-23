import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserPurchasedNFTs } from "../../lib/supabase";
import { getNftContract, claimToken } from "../../lib/nftContract";
import { ethers } from "ethers";
import { useSearchParams } from "react-router-dom";

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
      <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="text-center text-gray-300">
          Please log in to view your NFTs
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-8">
      <h1 className="text-3xl font-bold mb-8 text-white">My NFTs</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-800/30 rounded-lg text-green-300 text-sm">
          {success}
        </div>
      )}

      {purchasedNFTs.length === 0 ? (
        <div className="text-center text-gray-300">
          You haven't purchased any NFTs yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedNFTs.map((tokenId) => (
            <div
              key={tokenId}
              className="bg-[#13111C]/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm"
            >
              <div className="aspect-square bg-[#1A191F] rounded-lg mb-4 overflow-hidden">
                {/* NFT Image placeholder */}
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-medium">
                  NFT #{tokenId}
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2 text-white">
                Turtle Timepiece #{tokenId}
              </h3>

              {claimedNFTs.includes(tokenId) ? (
                <div className="text-green-400 text-sm mb-4 flex items-center">
                  <span className="mr-1">Claimed</span>
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : (
                <button
                  onClick={() => handleClaim(tokenId)}
                  disabled={isClaiming[tokenId]}
                  className={`w-full py-3 px-4 rounded-lg transition-all duration-200 ${
                    isClaiming[tokenId]
                      ? "bg-purple-900/50 text-purple-300 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/20"
                  }`}
                >
                  {isClaiming[tokenId] ? "Claiming..." : "Claim NFT"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNFTs;
