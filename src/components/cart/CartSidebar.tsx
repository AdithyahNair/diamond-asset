import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { purchaseNFT, checkBalance } from "../../lib/ethereum";
import { recordMintedNFT } from "../../lib/supabase";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  openAuthModal: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  openAuthModal,
}) => {
  const { items, removeFromCart, totalPrice, clearCart } = useCart();
  const { isFullyAuthenticated, user, isWalletConnected, walletAddress } =
    useAuth();
  const [paymentMethod, setPaymentMethod] = React.useState<"crypto" | "card">(
    "crypto"
  );
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTransactionHash(null);
      setTransactionError(null);
      setTransactionSuccess(false);
    }
  }, [isOpen]);

  // Calculate service fee (2.5% of subtotal)
  const serviceFee = totalPrice * 0.025;
  const finalTotal = totalPrice + serviceFee;

  const handleCheckout = async () => {
    if (!isFullyAuthenticated || !walletAddress) {
      openAuthModal();
      return;
    }

    setTransactionError(null);
    setTransactionHash(null);
    setTransactionSuccess(false);
    setIsTransactionPending(true);

    try {
      // Only allow one NFT at a time
      if (items.length > 1) {
        setTransactionError(
          "Only one NFT can be purchased at a time. Please remove additional items."
        );
        setIsTransactionPending(false);
        return;
      }

      // Check balance for a single NFT
      const hasBalance = await checkBalance(1);
      if (!hasBalance) {
        setTransactionError("Insufficient funds to complete the purchase");
        setIsTransactionPending(false);
        return;
      }

      // Always use single NFT purchase
      const result = await purchaseNFT();

      if (result.status === "success") {
        setTransactionHash(result.transactionHash || null);
        setTransactionSuccess(true);

        // Record purchases in database
        if (user?.email) {
          try {
            await recordMintedNFT(user.email, walletAddress);
          } catch (error) {
            console.error("Error recording purchase:", error);
          }
        }

        // Clear the cart after successful purchase
        clearCart();
      } else {
        setTransactionError(result.errorMessage || "Purchase failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setTransactionError(
        error instanceof Error ? error.message : "Failed to process checkout"
      );
    } finally {
      setIsTransactionPending(false);
    }
  };

  // Handle the crypto payment
  const handleCryptoPayment = async () => {
    if (!isWalletConnected) {
      openAuthModal();
      return;
    }

    setIsTransactionPending(true);
    setTransactionError(null);
    setTransactionSuccess(false);
    setTransactionHash(null);

    try {
      await handleCheckout();
    } catch (error: unknown) {
      console.error("Payment processing error:", error);
      setTransactionError(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setIsTransactionPending(false);
    }
  };

  // Helper function to determine if the file is a video
  const isVideoFile = (path: string) => {
    if (!path) return false;
    return (
      path.endsWith(".mp4") || path.endsWith(".webm") || path.endsWith(".mov")
    );
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-80 md:w-96 bg-[#13111C] shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Your Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.length > 1 && (
                <div className="p-3 mb-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg text-yellow-300 text-sm">
                  Only one NFT can be purchased at a time. Please remove
                  additional items.
                </div>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 bg-[#1A191F] p-3 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden">
                    {item.image && isVideoFile(item.image) ? (
                      <video
                        src={item.image}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>1 × {item.price} ETH</span>
                      <span>{item.price.toFixed(3)} ETH</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {transactionSuccess && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded-lg">
              <p className="text-green-400 font-medium mb-1">
                Transaction successful!
              </p>
              {transactionHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm break-all"
                >
                  View on Etherscan: {transactionHash}
                </a>
              )}
            </div>
          )}

          {transactionError && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{transactionError}</p>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{totalPrice.toFixed(3)} ETH</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Service Fee (2.5%)</span>
                <span>{serviceFee.toFixed(3)} ETH</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-gray-800">
                <span>Total</span>
                <span>{finalTotal.toFixed(3)} ETH</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex rounded-lg overflow-hidden">
                <button
                  className={`flex-1 py-2 text-center ${
                    paymentMethod === "crypto"
                      ? "bg-purple-700 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                  onClick={() => setPaymentMethod("crypto")}
                >
                  Crypto
                </button>
                <button
                  className={`flex-1 py-2 text-center ${
                    paymentMethod === "card"
                      ? "bg-purple-700 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                  onClick={() => setPaymentMethod("card")}
                  disabled
                >
                  Credit/Debit Card
                </button>
              </div>
            </div>

            <button
              onClick={handleCryptoPayment}
              disabled={
                isTransactionPending || !items.length || items.length > 1
              }
              className="w-full py-3 bg-[#4A148C] hover:bg-[#6A1B9A] text-white font-medium rounded-lg transition-colors disabled:bg-gray-700 disabled:text-gray-500"
            >
              {isTransactionPending
                ? "Processing..."
                : `Checkout (${finalTotal.toFixed(3)} ETH)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
