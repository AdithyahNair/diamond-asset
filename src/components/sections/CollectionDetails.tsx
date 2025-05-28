import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  ArrowLeft,
  Heart,
  Share2,
  RefreshCw,
  AlertCircle,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../auth/AuthModal";
import {
  getNftContract,
  getAvailableNFTs,
  purchaseNft,
  markTokenAsPrePurchased,
} from "../../lib/nftContract";
import {
  supabase,
  hasUserPurchasedNFT,
  updateNFTPurchaseStatus,
  recordMintedNFT,
} from "../../lib/supabase";
import { createCheckoutSession } from "../../lib/stripe";

// ETH price values
const ETH_PRICE_USD = 0.001; // Price in ETH (0.001 ETH ≈ $2 at ~$2000/ETH)
const USD_PRICE = 2; // USD equivalent (approximate)

// NFT item ID
const NFT_ITEM_ID = "turtle-timepiece-genesis";

const CollectionDetails: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [available, setAvailable] = useState<number>(0);
  const [availableTokens, setAvailableTokens] = useState<number[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [isAccountSelectionOpen, setIsAccountSelectionOpen] = useState(false);
  const [networkName, setNetworkName] = useState<string>("Unknown");
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "card">(
    "crypto"
  );
  const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);

  const {
    isFullyAuthenticated,
    user,
    isWalletConnected,
    walletAddress,
    connectWallet,
  } = useAuth();

  const fetchAvailable = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const availableTokens = await getAvailableNFTs(provider);
      setAvailableTokens(availableTokens);
      setAvailable(availableTokens.length);

      // Select the first available token by default
      if (availableTokens.length > 0 && !selectedTokenId) {
        setSelectedTokenId(availableTokens[0]);
      }
    } catch (error) {
      console.error("Error fetching available NFTs:", error);
      setError("Failed to fetch available NFTs");
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const loadAccounts = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      setAvailableAccounts(accounts);

      if (accounts.length > 0 && !selectedAccount) {
        setSelectedAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  };

  useEffect(() => {
    if (isWalletConnected) {
      loadAccounts();

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", (accounts: string[]) => {
          setAvailableAccounts(accounts);
          setSelectedAccount(accounts.length > 0 ? accounts[0] : null);
        });
      }
    }
  }, [isWalletConnected]);

  const checkCurrentNetwork = async () => {
    try {
      if (!window.ethereum) return;

      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      const networks: Record<string, string> = {
        "0x1": "Ethereum Mainnet",
        "0xaa36a7": "Sepolia Testnet",
        "0x13881": "Polygon Mumbai",
        "0xa86a": "Avalanche C-Chain",
      };

      setNetworkName(networks[chainId] || `Unknown Network (${chainId})`);
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  useEffect(() => {
    if (isWalletConnected) {
      checkCurrentNetwork();

      if (window.ethereum) {
        window.ethereum.on("chainChanged", () => {
          checkCurrentNetwork();
        });
      }
    }
  }, [isWalletConnected]);

  const canMint = async (email: string | undefined | null) => {
    if (!email) return false;

    const { data, error } = await supabase
      .from("minted_emails")
      .select("email")
      .eq("email", email);

    if (error) {
      console.error("Error checking mint status:", error);
      return false;
    }

    return data && data.length === 0;
  };

  const handleCryptoPayment = async () => {
    if (!user?.email) {
      setError("Please log in to purchase NFTs");
      setIsAuthModalOpen(true);
      return;
    }

    if (!isWalletConnected || !walletAddress) {
      connectWallet();
      return;
    }

    if (!selectedTokenId) {
      setError("Please select an NFT to purchase");
      return;
    }

    setError(null);
    setIsPurchasing(true);
    setTxHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Purchase the selected NFT
      const result = await purchaseNft(signer, selectedTokenId);

      if (!result.success) {
        setError(result.error || "Purchase failed");
        setIsPurchasing(false);
        return;
      }

      // Set transaction hash
      setTxHash(result.transaction?.hash || null);

      // Record the purchase in Supabase
      await recordMintedNFT(user.email, walletAddress, selectedTokenId);

      setSuccessMessage(
        "Successfully purchased NFT! You can purchase another one if you'd like."
      );
      await fetchAvailable(); // Refresh available tokens

      // Reset selected token after successful purchase
      setSelectedTokenId(null);
    } catch (error) {
      console.error("Purchase error:", error);
      setError("Failed to complete the purchase. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCardPayment = async () => {
    if (!user?.email) {
      setError("Please log in to purchase NFTs");
      return;
    }

    if (!selectedTokenId) {
      setError("Please select an NFT to purchase");
      return;
    }

    if (!user.id) {
      setError("User ID not found. Please try logging in again.");
      return;
    }

    setError(null);
    setIsProcessingCardPayment(true);

    try {
      const checkoutUrl = await createCheckoutSession(
        user.email,
        user.id,
        selectedTokenId
      );
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setError("Failed to initiate card payment. Please try again.");
      setIsProcessingCardPayment(false);
    }
  };

  const handleMakeOffer = () => {
    if (!isFullyAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    alert("Making an offer for Turtle Timepiece Genesis");
  };

  const renderAccountSelection = () => {
    if (!isAccountSelectionOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#13111C] rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">Select Account</h3>
          <p className="text-gray-300 mb-4">
            Choose which account to use for this purchase:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {availableAccounts.map((account) => (
              <button
                key={account}
                onClick={() => {
                  setSelectedAccount(account);
                  setIsAccountSelectionOpen(false);
                  setTimeout(() => handleCryptoPayment(), 100);
                }}
                className={`w-full text-left p-3 rounded-lg flex items-center ${
                  selectedAccount === account
                    ? "bg-[#1E9AD3]/20 border border-[#1E9AD3]"
                    : "bg-[#1A191F] hover:bg-[#1A191F]/80"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mr-3 flex-shrink-0" />
                <div className="overflow-hidden">
                  <span className="block truncate">{account}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAccountSelectionOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#1A191F] hover:bg-[#1A191F]/80"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleRefreshCount = () => {
    fetchAvailable();
  };

  return (
    <>
      <div className="min-h-screen bg-black pt-32 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/collections"
              className="inline-flex items-center text-white/60 hover:text-cyan-400 mb-8 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to collections
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-black/60 border border-cyan-400/20">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/videos/nft-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
                    liked
                      ? "bg-red-500/20 text-red-500"
                      : "bg-black/20 text-cyan-400 hover:bg-black/40"
                  }`}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart size={20} fill={liked ? "currentColor" : "none"} />
                </motion.button>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-full bg-black/20 backdrop-blur-md text-cyan-400 hover:bg-black/40 transition-all duration-300"
                  >
                    <Share2 size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-full bg-black/20 backdrop-blur-md text-cyan-400 hover:bg-black/40 transition-all duration-300"
                  >
                    <RefreshCw size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-8">
                <div className="text-cyan-400 text-sm mb-2">
                  Turtle Timepiece
                </div>
                <h1 className="text-4xl font-serif text-white mb-4">
                  Turtle Timepiece Genesis
                </h1>
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              </div>

              <div className="bg-black/50 p-8 rounded-2xl mb-8 border border-cyan-400/20 relative">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400/30" />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400/30" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400/30" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400/30" />

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-white/60 text-sm mb-1">
                      Current Price
                    </div>
                    <div className="text-2xl font-serif text-white">
                      {ETH_PRICE_USD} ETH{" "}
                      <span className="text-white/60 text-lg">
                        (${USD_PRICE})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-sm mb-1">Available</div>
                    <div className="text-xl font-serif text-white flex items-center justify-end">
                      {available} NFTs
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRefreshCount}
                        className="ml-2 p-1 rounded-full hover:bg-cyan-400/10 text-cyan-400"
                        title="Refresh NFT count"
                      >
                        <RefreshCw size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-white/80">
                    <p>
                      You can purchase multiple NFTs, one at a time. Each NFT
                      costs {ETH_PRICE_USD} ETH (${USD_PRICE})
                    </p>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center"
                  >
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-cyan-400 text-sm flex items-center"
                  >
                    <Check size={16} className="mr-2 flex-shrink-0" />
                    {successMessage}
                    {txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline hover:text-cyan-300"
                      >
                        View transaction
                      </a>
                    )}
                  </motion.div>
                )}

                {!user && (
                  <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                    Please login to purchase this item
                  </div>
                )}

                {paymentMethod === "crypto" && user && !isWalletConnected && (
                  <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                    Please connect your wallet to purchase with crypto
                  </div>
                )}

                {available <= 0 && (
                  <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm">
                    All NFTs have been sold
                  </div>
                )}

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <div className="flex gap-4 mb-4">
                    <motion.button
                      whileHover={{ y: -2 }}
                      onClick={() => setPaymentMethod("crypto")}
                      className={`flex-1 py-3 px-6 rounded-xl transition-colors ${
                        paymentMethod === "crypto"
                          ? "bg-cyan-400 text-black"
                          : "bg-black/60 text-white/60 border border-cyan-400/20"
                      }`}
                    >
                      Pay with Crypto
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2 }}
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 py-3 px-6 rounded-xl transition-colors ${
                        paymentMethod === "card"
                          ? "bg-cyan-400 text-black"
                          : "bg-black/60 text-white/60 border border-cyan-400/20"
                      }`}
                    >
                      Pay with Card
                    </motion.button>
                  </div>

                  <div className="text-sm text-white/60">
                    {paymentMethod === "crypto"
                      ? !isWalletConnected
                        ? "You'll need to connect your wallet to pay with ETH."
                        : "Pay with ETH. NFT will be transferred immediately."
                      : "Pay with credit/debit card. Connect wallet later to claim your NFT."}
                  </div>
                </div>

                {/* NFT Selection */}
                {available > 0 && (
                  <div className="mb-6">
                    <label className="block text-white mb-2">Select NFT:</label>
                    <select
                      className="w-full p-3 rounded-xl bg-black/60 text-white border border-cyan-400/20 focus:border-cyan-400 focus:outline-none transition-colors"
                      value={selectedTokenId || ""}
                      onChange={(e) =>
                        setSelectedTokenId(Number(e.target.value))
                      }
                    >
                      <option value="">Select an NFT</option>
                      {availableTokens.map((tokenId) => (
                        <option key={tokenId} value={tokenId}>
                          Turtle Timepiece #{tokenId}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {paymentMethod === "crypto" ? (
                    <motion.button
                      whileHover={{ y: -2 }}
                      onClick={handleCryptoPayment}
                      disabled={
                        !isWalletConnected || isPurchasing || !selectedTokenId
                      }
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                        !isWalletConnected || isPurchasing || !selectedTokenId
                          ? "bg-cyan-400/20 text-cyan-400/60 cursor-not-allowed"
                          : "bg-cyan-400 hover:bg-cyan-300 text-black"
                      }`}
                    >
                      {isPurchasing ? "Processing..." : "Buy Now"}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ y: -2 }}
                      onClick={handleCardPayment}
                      disabled={isProcessingCardPayment || !selectedTokenId}
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                        isProcessingCardPayment || !selectedTokenId
                          ? "bg-cyan-400/20 text-cyan-400/60 cursor-not-allowed"
                          : "bg-cyan-400 hover:bg-cyan-300 text-black"
                      }`}
                    >
                      {isProcessingCardPayment
                        ? "Processing..."
                        : "Pay with Card"}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default CollectionDetails;
