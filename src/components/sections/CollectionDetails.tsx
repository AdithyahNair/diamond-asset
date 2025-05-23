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

    setError(null);
    setIsProcessingCardPayment(true);

    try {
      // Use the pre-built Stripe checkout link with success redirect to /my-nfts
      const successUrl = `${window.location.origin}/my-nfts?token_id=${selectedTokenId}`;
      window.location.href =
        "https://buy.stripe.com/test_cNi5kDdoA04lcHoehT1gs00";
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
      <div className="min-h-screen bg-[#0B1120] pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 xl:px-24">
          <Link
            to="/collections"
            className="inline-flex items-center text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to collections
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-black/40">
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
                <button
                  className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
                    liked
                      ? "bg-red-500/20 text-red-500"
                      : "bg-black/20 text-gray-300 hover:bg-black/40"
                  }`}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart size={20} fill={liked ? "currentColor" : "none"} />
                </button>

                <div className="flex gap-2">
                  <button className="p-3 rounded-full bg-black/20 backdrop-blur-md text-gray-300 hover:bg-black/40 transition-all duration-300">
                    <Share2 size={20} />
                  </button>
                  <button className="p-3 rounded-full bg-black/20 backdrop-blur-md text-gray-300 hover:bg-black/40 transition-all duration-300">
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-8">
                <div className="text-[#3BA7DB] text-sm mb-2">
                  Turtle Timepiece
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Turtle Timepiece Genesis
                </h1>
              </div>

              <div className="bg-[#13111C]/60 p-6 rounded-xl mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">
                      Current Price
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {ETH_PRICE_USD} ETH{" "}
                      <span className="text-gray-400 text-lg">
                        (${USD_PRICE})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm mb-1">Available</div>
                    <div className="text-xl font-bold text-white flex items-center justify-end">
                      {available} NFTs
                      <button
                        onClick={handleRefreshCount}
                        className="ml-2 p-1 rounded-full hover:bg-[#1A191F]/50"
                        title="Refresh NFT count"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-2 text-sm text-gray-400">
                  <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg text-blue-300">
                    <p>
                      You can purchase multiple NFTs, one at a time. Each NFT
                      costs {ETH_PRICE_USD} ETH (${USD_PRICE})
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 bg-green-900/20 border border-green-800/30 rounded-lg text-green-300 text-sm flex items-center">
                    <Check size={16} className="mr-2 flex-shrink-0" />
                    {successMessage}
                    {txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline hover:text-green-200"
                      >
                        View transaction
                      </a>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg text-yellow-300 text-sm">
                    Please login to purchase this item
                  </div>
                )}

                {paymentMethod === "crypto" && user && !isWalletConnected && (
                  <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg text-yellow-300 text-sm">
                    Please connect your wallet to purchase with crypto
                  </div>
                )}

                {available <= 0 && (
                  <div className="mb-4 p-3 bg-gray-900/20 border border-gray-800/30 rounded-lg text-gray-300 text-sm">
                    All NFTs have been sold
                  </div>
                )}

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setPaymentMethod("crypto")}
                      className={`flex-1 py-3 px-6 rounded-lg transition-colors ${
                        paymentMethod === "crypto"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      Pay with Crypto
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 py-3 px-6 rounded-lg transition-colors ${
                        paymentMethod === "card"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      Pay with Card
                    </button>
                  </div>

                  {paymentMethod === "crypto" ? (
                    <div className="text-sm text-gray-400">
                      {!isWalletConnected
                        ? "You'll need to connect your wallet to pay with ETH."
                        : "Pay with ETH. NFT will be transferred immediately."}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Pay with credit/debit card. Connect wallet later to claim
                      your NFT.
                    </div>
                  )}
                </div>

                {/* NFT Selection */}
                {available > 0 && (
                  <div className="mb-4">
                    <label className="block text-white mb-2">Select NFT:</label>
                    <select
                      className="w-full p-2 rounded bg-gray-800 text-white"
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

                <div className="flex gap-4">
                  {paymentMethod === "crypto" ? (
                    <button
                      onClick={handleCryptoPayment}
                      disabled={
                        isPurchasing || !selectedTokenId || available <= 0
                      }
                      className={`flex-1 py-3 px-6 rounded-lg transition-colors ${
                        isPurchasing || !selectedTokenId || available <= 0
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      {isPurchasing ? "Processing..." : "Buy with Crypto"}
                    </button>
                  ) : (
                    <button
                      onClick={handleCardPayment}
                      disabled={
                        isProcessingCardPayment ||
                        !selectedTokenId ||
                        available <= 0 ||
                        !user
                      }
                      className={`flex-1 py-3 px-6 rounded-lg transition-colors ${
                        isProcessingCardPayment ||
                        !selectedTokenId ||
                        available <= 0 ||
                        !user
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      {isProcessingCardPayment
                        ? "Processing..."
                        : "Buy with Card"}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-[#13111C]/60 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-300 mb-6">
                  Be part of history with this exclusive NFT that grants you
                  unprecedented access and privileges:
                </p>

                <div className="space-y-6">
                  <div className="flex gap-3">
                    <span className="text-[#FFD700]">✨</span>
                    <p className="text-gray-300">
                      One-of-a-Kind Collectible – A limited edition physical
                      piece designed by JPX, for you to carry with you as a
                      token of our appreciation.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-red-500">📹</span>
                    <p className="text-gray-300">
                      Exclusive Inauguration Event – Witness the unveiling of
                      the Turtle Timepiece, for the first time in history there
                      will be a public offering of a tokenized diamond and you
                      (and an additional guest) can be there to witness it.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-blue-500">💎</span>
                    <p className="text-gray-300">
                      Silent Auction Access – Only members will have the ability
                      to bid on the 7 Argyle stones housed by the turtle.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-purple-500">🖌️</span>
                    <p className="text-gray-300">
                      Co-Creation Influence – Participate in the artistic
                      development of the timeless turtle by influencing its
                      design details.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-green-500">🌐</span>
                    <p className="text-gray-300">
                      Exclusive Community – Connect with fellow collectors and
                      visionaries in this groundbreaking project.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isWalletConnected && (
            <div className="bg-[#13111C]/60 p-4 rounded-xl mb-6">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                {availableAccounts.length > 0 && (
                  <div className="flex items-center">
                    <div>
                      <span className="text-sm text-gray-400">Account:</span>
                      <div className="flex items-center mt-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mr-2" />
                        <span className="font-medium truncate max-w-[200px]">
                          {selectedAccount || "None selected"}
                        </span>
                      </div>
                    </div>
                    {availableAccounts.length > 1 && (
                      <button
                        onClick={() => setIsAccountSelectionOpen(true)}
                        className="text-sm bg-[#1A191F] hover:bg-[#1A191F]/80 px-3 py-1.5 rounded-lg ml-4"
                      >
                        Change
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center">
                  <div>
                    <span className="text-sm text-gray-400">Network:</span>
                    <div className="flex items-center mt-1">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          networkName === "Sepolia Testnet"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span className="font-medium">
                        {networkName}
                        {networkName !== "Sepolia Testnet" && (
                          <span className="text-yellow-400 ml-2 text-xs">
                            (Please switch to Sepolia)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {renderAccountSelection()}
    </>
  );
};

export default CollectionDetails;
