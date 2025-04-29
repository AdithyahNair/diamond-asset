import React, { useState, useEffect } from "react";
import {
  X,
  ShoppingCart,
  Check,
  CreditCard,
  Bitcoin,
  Loader2,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  sendTransaction,
  batchPurchaseNFT,
  checkBalance,
} from "../../lib/ethereum";
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
  const { items, removeFromCart, totalItems, totalPrice, clearCart } =
    useCart();
  const { isFullyAuthenticated, user, isWalletConnected, walletAddress } =
    useAuth();
  const [paymentMethod, setPaymentMethod] = React.useState<"crypto" | "card">(
    "crypto"
  );
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Reset transaction states when cart is opened/closed
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
      // Check balance first
      const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
      const hasBalance = await checkBalance(totalQuantity);

      if (!hasBalance) {
        setTransactionError("Insufficient funds to complete the purchase");
        setIsTransactionPending(false);
        return;
      }

      // Process each item in the cart
      const result = await batchPurchaseNFT(totalQuantity);

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
      // Attempt to send the transaction
      const result = await sendTransaction(finalTotal);

      if (result.status === "error") {
        setTransactionError(result.errorMessage || "Transaction failed");
        setIsTransactionPending(false);
        return;
      }

      if (result.transactionHash) {
        setTransactionHash(result.transactionHash);
        setTransactionSuccess(true);

        // Clear cart on successful payment after a short delay
        setTimeout(() => {
          clearCart();
        }, 3000);
      }
    } catch (error: unknown) {
      console.error("Payment processing error:", error);
      setTransactionError(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setIsTransactionPending(false);
    }
  };

  // Handle the card payment (not implemented in this example)
  const handleCardPayment = () => {
    setTransactionError(
      "Card payment is currently not available. Please use crypto payment."
    );
  };

  // Handle the purchase button click
  const handlePurchase = () => {
    // Reset any existing errors
    setTransactionError(null);

    if (items.length === 0) {
      setTransactionError("Your cart is empty");
      return;
    }

    if (paymentMethod === "crypto") {
      handleCryptoPayment();
    } else {
      handleCardPayment();
    }
  };

  // Handle removing an item from cart
  const handleRemoveItem = (itemId: string) => {
    // Reset transaction states when modifying cart
    setTransactionError(null);
    setTransactionHash(null);
    setTransactionSuccess(false);

    removeFromCart(itemId);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0B1120] shadow-xl z-50 flex flex-col">
        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center text-white">
            <ShoppingCart className="mr-3" size={22} />
            Your Cart{" "}
            {totalItems > 0 && (
              <span className="ml-2 bg-white text-[#1E9AD3] text-sm px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {!isFullyAuthenticated ? (
            <div className="text-center py-6">
              <div className="bg-[#1A2435] p-6 rounded-xl shadow-sm border border-gray-700">
                <h3 className="text-lg font-semibold mb-5 text-white">
                  Complete these steps to shop
                </h3>
                <div className="flex flex-col gap-4">
                  <div
                    className={`p-4 rounded-xl flex items-center gap-4 transition-all ${
                      !user
                        ? "bg-amber-900/40 border border-amber-700"
                        : "bg-emerald-900/40 border border-emerald-700"
                    }`}
                  >
                    {!user ? (
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-amber-800 border-2 border-amber-600 text-amber-200 font-semibold">
                        1
                      </div>
                    ) : (
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-emerald-800 text-emerald-200">
                        <Check size={16} />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p
                        className={
                          !user
                            ? "font-medium text-amber-200"
                            : "font-medium text-emerald-200"
                        }
                      >
                        {!user ? "Login with Email" : "Logged in"}
                      </p>
                      <p
                        className={
                          !user
                            ? "text-sm text-amber-300/80"
                            : "text-sm text-emerald-300/80"
                        }
                      >
                        {!user
                          ? "Required for checkout"
                          : `Logged in as ${user.email?.split("@")[0]}`}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl flex items-center gap-4 transition-all ${
                      !isWalletConnected
                        ? "bg-amber-900/40 border border-amber-700"
                        : "bg-emerald-900/40 border border-emerald-700"
                    }`}
                  >
                    {!isWalletConnected ? (
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-amber-800 border-2 border-amber-600 text-amber-200 font-semibold">
                        2
                      </div>
                    ) : (
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-emerald-800 text-emerald-200">
                        <Check size={16} />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p
                        className={
                          !isWalletConnected
                            ? "font-medium text-amber-200"
                            : "font-medium text-emerald-200"
                        }
                      >
                        {!isWalletConnected
                          ? "Connect Your Wallet"
                          : "Wallet Connected"}
                      </p>
                      <p
                        className={
                          !isWalletConnected
                            ? "text-sm text-amber-300/80"
                            : "text-sm text-emerald-300/80"
                        }
                      >
                        {!isWalletConnected
                          ? "Required for payments"
                          : "Ready to make purchases"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={openAuthModal}
                  className="mt-8 w-full bg-gradient-to-r from-[#1E9AD3] to-[#0056a8] text-white py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-[#1789bd] hover:to-[#004e99] transition-all"
                >
                  {!user ? "Login Now" : "Connect Wallet"}
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-800">
                <ShoppingCart size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-200 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-400 max-w-xs mx-auto">
                Explore our collection and add items to your cart
              </p>
            </div>
          ) : (
            <div className="space-y-5 mt-2">
              {/* Transaction Status Messages */}
              {transactionError && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline"> {transactionError}</span>
                </div>
              )}

              {transactionSuccess && (
                <div className="mb-5 p-4 bg-green-900/20 border border-green-800/30 rounded-xl text-green-300 text-sm flex items-start">
                  <Check size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Transaction successful!</p>
                    <p>Your NFT will be transferred shortly.</p>
                    {transactionHash && (
                      <p className="mt-2 break-all">
                        <span className="text-xs text-green-400 opacity-80">
                          TX Hash: {transactionHash}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 mb-4 bg-white/5 rounded-xl"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/40">
                      <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      >
                        <source src={item.image} type="video/mp4" />
                      </video>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{item.name}</h4>
                      <div className="text-sm text-gray-400 mt-1">
                        Quantity: {item.quantity}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-[#1E9AD3]">
                          {item.price} ETH
                          <span className="text-gray-500 text-sm ml-1">
                            × {item.quantity}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-[#1A2435] rounded-xl p-4 border border-gray-700">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>{totalPrice.toFixed(5)} ETH</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Service Fee (2.5%)</span>
                    <span>{serviceFee.toFixed(5)} ETH</span>
                  </div>
                  <div className="h-px bg-gray-700 my-2"></div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Total</span>
                    <span>{finalTotal.toFixed(5)} ETH</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 space-y-3">
                <div className="flex w-full">
                  <button
                    onClick={() => setPaymentMethod("crypto")}
                    className={`w-1/2 p-3 flex items-center justify-center gap-2 transition-colors ${
                      paymentMethod === "crypto"
                        ? "bg-[#1E9AD3] text-white"
                        : "bg-[#1A2435] text-gray-300 hover:bg-[#243049]"
                    } rounded-l-lg border ${
                      paymentMethod === "crypto"
                        ? "border-[#1E9AD3]"
                        : "border-gray-700"
                    }`}
                  >
                    <Bitcoin size={18} />
                    <span>Crypto</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`w-1/2 p-3 flex items-center justify-center gap-2 transition-colors ${
                      paymentMethod === "card"
                        ? "bg-[#1E9AD3] text-white"
                        : "bg-[#1A2435] text-gray-300 hover:bg-[#243049]"
                    } rounded-r-lg border ${
                      paymentMethod === "card"
                        ? "border-[#1E9AD3]"
                        : "border-gray-700"
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>Card</span>
                  </button>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isTransactionPending}
                  className={`w-full p-4 rounded-xl font-medium transition-all 
                    ${
                      isTransactionPending
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#1E9AD3] to-[#0056a8] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-[#1789bd] hover:to-[#004e99]"
                    }`}
                >
                  {isTransactionPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    `Checkout (${finalTotal.toFixed(5)} ETH)`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
