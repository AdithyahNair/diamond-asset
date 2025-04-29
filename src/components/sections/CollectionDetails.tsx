import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  ArrowLeft,
  Heart,
  Share2,
  RefreshCw,
  Minus,
  Plus,
  ShoppingCart,
  AlertCircle,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import AuthModal from "../auth/AuthModal";
import { purchaseNFT, batchPurchaseNFT } from "../../lib/ethereum";
import { getAvailableNfts, getNftContract } from "../../lib/nftContract";
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
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [available, setAvailable] = useState<number>(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [isAccountSelectionOpen, setIsAccountSelectionOpen] = useState(false);
  const [networkName, setNetworkName] = useState<string>("Unknown");

  const { isFullyAuthenticated, user, isWalletConnected, walletAddress } =
    useAuth();
  const { addToCart, setIsCartOpen, hasItemInCart } = useCart();

  const isInCart = hasItemInCart(NFT_ITEM_ID);

  const fetchAvailable = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const count = await getAvailableNfts(provider);
      setAvailable(count);
    } catch (error) {
      console.error("Error fetching available NFTs:", error);
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

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < available) setQuantity(quantity + 1);
  };

  const handlePurchase = () => {
    setError(null);
    setSuccessMessage(null);

    if (!isFullyAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isWalletConnected) {
      setError("Please connect your wallet to purchase NFTs");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isInCart) {
      setError("This item is already in your cart");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (quantity > available) {
      setError("Cannot add more NFTs than available");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      addToCart({
        id: NFT_ITEM_ID,
        name: "Turtle Timepiece Genesis",
        price: ETH_PRICE_USD,
        quantity,
        image: "/videos/nft-video.mp4",
      });

      setSuccessMessage("Added to cart successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
        setIsCartOpen(true);
      }, 1500);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add item to cart");
      setTimeout(() => setError(null), 3000);
    }
  };

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

  const handleDirectPurchase = async () => {
    if (!isFullyAuthenticated || !user?.email) {
      setError("Please log in to purchase NFTs");
      return;
    }

    if (!isWalletConnected || !walletAddress) {
      setError("Please connect your wallet to purchase NFTs");
      return;
    }

    setError(null);
    setIsPurchasing(true);
    setTxHash(null);

    try {
      // Check if user has already purchased
      const hasPurchased = await hasUserPurchasedNFT(user.email);
      if (hasPurchased) {
        setError("You have already purchased an NFT");
        setIsPurchasing(false);
        return;
      }

      let result;
      if (quantity === 1) {
        // Single NFT purchase
        result = await purchaseNFT();
      } else {
        // Batch purchase for multiple NFTs
        result = await batchPurchaseNFT(quantity);
      }

      if (result.status === "error") {
        setError(result.errorMessage || "Purchase failed");
        setIsPurchasing(false);
        return;
      }

      // Set transaction hash only if it exists
      if (result.transactionHash) {
        setTxHash(result.transactionHash);
      }

      // Record the purchase in Supabase
      await recordMintedNFT(user.email, walletAddress);
      await updateNFTPurchaseStatus(user.email);

      setSuccessMessage(
        `Successfully purchased ${quantity} NFT${quantity > 1 ? "s" : ""}!`
      );
      await fetchAvailable(); // Refresh available count
    } catch (error) {
      console.error("Purchase error:", error);
      setError("Failed to complete the purchase. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleMakeOffer = () => {
    if (!isFullyAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    alert("Making an offer for Turtle Timepiece Genesis");
  };

  const viewCart = () => {
    setIsCartOpen(true);
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
                  setTimeout(() => handleDirectPurchase(), 100);
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
            to="/browse-collections"
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

                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-2 block">
                    Quantity (Max: {available})
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decreaseQuantity}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-xl font-medium text-white min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                      disabled={quantity >= available}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    Total Price: {(ETH_PRICE_USD * quantity).toFixed(3)} ETH ($
                    {(USD_PRICE * quantity).toFixed(2)})
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

                {!isFullyAuthenticated && (
                  <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg text-yellow-300 text-sm">
                    {!user
                      ? "Please login to purchase this item"
                      : "Please connect your wallet to purchase this item"}
                  </div>
                )}

                {available <= 0 && (
                  <div className="mb-4 p-3 bg-gray-900/20 border border-gray-800/30 rounded-lg text-gray-300 text-sm">
                    All NFTs have been sold
                  </div>
                )}

                <div className="flex gap-4">
                  {isInCart ? (
                    <button
                      onClick={viewCart}
                      className="flex-1 bg-[#2E3A59] hover:bg-[#384670] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      View Cart
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handlePurchase}
                        className="flex-1 bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        disabled={available <= 0}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={handleDirectPurchase}
                        disabled={isPurchasing || available <= 0}
                        className="flex-1 bg-[#4A148C] hover:bg-[#6A1B9A] text-white font-medium py-3 px-6 rounded-lg transition-colors"
                      >
                        {isPurchasing ? "Processing..." : "Buy Now"}
                      </button>
                    </>
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
