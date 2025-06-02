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
  getAvailableNFTsFromSupabase,
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
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "card">("card");
  const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isFullyAuthenticated,
    user,
    isWalletConnected,
    walletAddress,
    connectWallet,
  } = useAuth();

  const fetchAvailableFromContract = async () => {
    try {
      if (!window.ethereum) return { availableCount: 0, availableTokens: [] };
      const provider = new ethers.BrowserProvider(window.ethereum);
      const availableTokens = await getAvailableNFTs(provider);
      return {
        availableCount: availableTokens.length,
        availableTokens,
      };
    } catch (error) {
      console.error("Error fetching available NFTs from contract:", error);
      return { availableCount: 0, availableTokens: [] };
    }
  };

  const fetchAvailableFromSupabase = async () => {
    try {
      const availableTokens = await getAvailableNFTsFromSupabase();
      return availableTokens;
    } catch (error) {
      console.error("Error fetching available NFTs from Supabase:", error);
      return [];
    }
  };

  const fetchAvailable = async () => {
    try {
      setIsLoading(true);
      let availableCount = 0;
      let tokens: number[] = [];

      console.log("Auth State:", {
        isFullyAuthenticated,
        hasUser: !!user,
        userEmail: user?.email,
        isWalletConnected,
      });

      // If we have a user (either email or wallet), try to get data
      if (user?.email || isWalletConnected) {
        // Try Supabase first if we have a user email
        if (user?.email) {
          console.log("Fetching from Supabase for user:", user.email);
          const result = await getAvailableNFTsFromSupabase();
          availableCount = result.availableCount;
          tokens = result.availableTokens;
          console.log("Available from Supabase:", { availableCount, tokens });
        }

        // If no count from Supabase and wallet is connected, try contract
        if (availableCount === 0 && window.ethereum && isWalletConnected) {
          console.log("Falling back to contract data");
          const result = await fetchAvailableFromContract();
          availableCount = result.availableCount;
          tokens = result.availableTokens;
          console.log("Available from contract:", { availableCount, tokens });
        }

        // Set the available count and tokens
        setAvailable(availableCount);
        setAvailableTokens(tokens);

        if (!selectedTokenId && tokens.length > 0) {
          setSelectedTokenId(tokens[0]);
        }
        setError(null);
      } else {
        console.log("No auth - prompting user to connect");
        setAvailable(0);
        setAvailableTokens([]);
        setSelectedTokenId(null);
        setError("Please login to view available NFTs");
      }
    } catch (error) {
      console.error("Error fetching available NFTs:", error);
      setError("Failed to fetch available NFTs");
      setAvailable(0);
      setAvailableTokens([]);
      setSelectedTokenId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when user signs out
  useEffect(() => {
    if (!user?.email && !isWalletConnected) {
      setAvailable(0);
      setAvailableTokens([]);
      setSelectedTokenId(null);
      setError("Please login or connect wallet to view available NFTs");
      setIsLoading(false);
    }
  }, [user?.email, isWalletConnected]);

  // Fetch available NFTs when component mounts or auth state changes
  useEffect(() => {
    if (user?.email || isWalletConnected) {
      fetchAvailable();
    }
  }, [user?.email, isWalletConnected]);

  const loadAccounts = async () => {
    try {
      if (!window.ethereum) return;

      // First request account access
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      setAvailableAccounts(accounts);

      if (accounts.length > 0 && !selectedAccount) {
        setSelectedAccount(accounts[0]);
      }
    } catch (error: any) {
      console.error("Error loading accounts:", error);
      if (error.code === 4100) {
        setError("Please unlock your MetaMask and try again");
      }
    }
  };

  const checkCurrentNetwork = async () => {
    try {
      if (!window.ethereum) return;

      // First ensure we have account access
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const sepoliaChainId = "0xaa36a7"; // Sepolia testnet

      // Check if we're on Sepolia
      if (chainId !== sepoliaChainId) {
        try {
          // Try to switch to Sepolia
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: sepoliaChainId }],
          });

          // After successful switch, update network name
          setNetworkName("Sepolia Testnet");
          setError(null);
        } catch (error: any) {
          if (error.code === 4902) {
            // Network needs to be added
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: sepoliaChainId,
                    chainName: "Sepolia Testnet",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://sepolia.infura.io/v3/"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
              // After adding network, update network name
              setNetworkName("Sepolia Testnet");
              setError(null);
            } catch (addError: any) {
              console.error("Error adding Sepolia network:", addError);
              setError(
                "Failed to add Sepolia network. Please add it manually in MetaMask."
              );
            }
          } else if (error.code === 4001) {
            setError("Please switch to Sepolia network to continue");
          } else if (error.code === 4100) {
            setError("Please unlock your MetaMask and try again");
          } else {
            console.error("Error switching to Sepolia:", error);
            setError(
              "Failed to switch network. Please switch to Sepolia manually."
            );
          }
        }
      } else {
        // Already on Sepolia
        setNetworkName("Sepolia Testnet");
        setError(null);
      }
    } catch (error: any) {
      console.error("Error checking network:", error);
      if (error.code === 4100) {
        setError("Please unlock your MetaMask and try again");
      } else {
        setError(
          "Failed to check network. Please make sure you're on Sepolia Testnet"
        );
      }
    }
  };

  useEffect(() => {
    if (isWalletConnected) {
      // When wallet is connected, first load accounts then check network
      loadAccounts().then(() => {
        checkCurrentNetwork();
      });

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", async (accounts: string[]) => {
          setAvailableAccounts(accounts);
          setSelectedAccount(accounts.length > 0 ? accounts[0] : null);
          // Recheck network when accounts change
          await checkCurrentNetwork();
        });

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
      try {
        await connectWallet();
        // After connecting, we need to wait a bit for MetaMask to be ready
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Check if connection was successful
        if (!window.ethereum?.selectedAddress) {
          setError("Please connect your wallet to continue");
          return;
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
        setError("Failed to connect wallet. Please try again.");
        return;
      }
    }

    if (!selectedTokenId) {
      setError("Please select an NFT to purchase");
      return;
    }

    // Ensure we're on Sepolia network
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const sepoliaChainId = "0xaa36a7";
      if (chainId !== sepoliaChainId) {
        setError("Please switch to Sepolia network to continue");
        return;
      }
    } catch (error) {
      console.error("Network check error:", error);
      setError(
        "Failed to check network. Please ensure you're on Sepolia network"
      );
      return;
    }

    setError(null);
    setIsPurchasing(true);
    setTxHash(null);

    try {
      // Request account access first
      await window.ethereum.request({ method: "eth_requestAccounts" });

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
      if (walletAddress) {
        await recordMintedNFT(user.email, walletAddress, selectedTokenId);
      } else {
        console.error("Wallet address is undefined");
        setError("Failed to record purchase. Please try again.");
        return;
      }

      setSuccessMessage(
        "Successfully purchased NFT! You can purchase another one if you'd like."
      );
      await fetchAvailable(); // Refresh available tokens

      // Reset selected token after successful purchase
      setSelectedTokenId(null);
    } catch (error: any) {
      console.error("Purchase error:", error);
      // More specific error messages
      if (error.code === 4001) {
        setError("Transaction was rejected. Please try again.");
      } else if (error.code === 4100) {
        setError("Please unlock your wallet and try again.");
      } else {
        setError("Failed to complete the purchase. Please try again.");
      }
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
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/"
              className="inline-flex items-center text-white/60 hover:text-cyan-400 mb-8 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Home
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
                  <source src="/videos/nft-video-5sec.mp4" type="video/mp4" />
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
                <h1 className="text-4xl font-serif text-white mb-4">
                  The Timeless Experience: Early Bird
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
                      ${USD_PRICE}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-sm mb-1">Available</div>
                    <div className="text-xl font-serif text-white flex items-center justify-end">
                      {isLoading && (user?.email || isWalletConnected) ? (
                        <span>Loading...</span>
                      ) : user?.email || isWalletConnected ? (
                        <div className="flex items-center">
                          {available} remaining
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleRefreshCount}
                            className="ml-2 p-1 rounded-full hover:bg-cyan-400/10 text-cyan-400"
                            title="Refresh count"
                          >
                            <RefreshCw size={16} />
                          </motion.button>
                        </div>
                      ) : (
                        <span className="text-white/60">Login to view</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-white/80">
                    <p>
                      An exclusive membership that offers curated access to rare
                      diamond investment opportunities, immersive luxury
                      experiences, and a backstage pass to the creation of a
                      couture jewelry piece
                    </p>
                  </div>
                </div>

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

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <div className="flex gap-4 mb-4">
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
                  </div>

                  <div className="text-sm text-white/60">
                    {paymentMethod === "crypto"
                      ? !isWalletConnected
                        ? "You'll need to connect your wallet to pay with ETH."
                        : "Pay with ETH. Your membership NFT will be transferred immediately."
                      : "Pay with credit/debit card. Connect wallet later to claim your membership NFT."}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {paymentMethod === "crypto" ? (
                    !isWalletConnected ? (
                      <motion.button
                        whileHover={{ y: -2 }}
                        onClick={connectWallet}
                        className="w-full py-3 px-6 rounded-xl font-medium bg-cyan-400 hover:bg-cyan-300 text-black"
                      >
                        Connect Wallet
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ y: -2 }}
                        onClick={() => {
                          if (available === 0) {
                            setError("All NFTs have been sold");
                            return;
                          }
                          // Automatically select the first available token
                          if (availableTokens.length > 0) {
                            setSelectedTokenId(availableTokens[0]);
                            handleCryptoPayment();
                          }
                        }}
                        disabled={isPurchasing || available <= 0}
                        className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                          isPurchasing || available <= 0
                            ? "bg-cyan-400/20 text-cyan-400/60 cursor-not-allowed"
                            : "bg-cyan-400 hover:bg-cyan-300 text-black"
                        }`}
                      >
                        {isPurchasing
                          ? "Processing..."
                          : available <= 0
                          ? "Sold Out"
                          : "Buy Now"}
                      </motion.button>
                    )
                  ) : (
                    <motion.button
                      whileHover={{ y: -2 }}
                      onClick={() => {
                        if (available === 0) {
                          setError("All NFTs have been sold");
                          return;
                        }
                        // Automatically select the first available token
                        if (availableTokens.length > 0) {
                          setSelectedTokenId(availableTokens[0]);
                          handleCardPayment();
                        }
                      }}
                      disabled={isProcessingCardPayment || available <= 0}
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                        isProcessingCardPayment || available <= 0
                          ? "bg-cyan-400/20 text-cyan-400/60 cursor-not-allowed"
                          : "bg-cyan-400 hover:bg-cyan-300 text-black"
                      }`}
                    >
                      {isProcessingCardPayment
                        ? "Processing..."
                        : available <= 0
                        ? "Sold Out"
                        : "Pay with Card"}
                    </motion.button>
                  )}
                </div>

                {available === 0 && (user?.email || isWalletConnected) && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                    All NFTs have been sold. Please check back later.
                  </div>
                )}
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
