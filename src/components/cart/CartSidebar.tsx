import React from "react";
import { X, ShoppingCart, Check, CreditCard, Bitcoin } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

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
  const { isFullyAuthenticated, user, isWalletConnected } = useAuth();
  const [paymentMethod, setPaymentMethod] = React.useState<"crypto" | "card">(
    "crypto"
  );

  // Calculate service fee (2.5% of subtotal)
  const serviceFee = totalPrice * 0.025;
  const finalTotal = totalPrice + serviceFee;

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
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-[#1A2435] border border-gray-700 hover:border-gray-600 transition-all"
                >
                  {item.image ? (
                    item.image.endsWith(".mp4") ? (
                      <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700 shadow-sm relative group">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="bg-white/80 rounded-full p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-[#1E9AD3]"
                            >
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                        </div>
                        <video
                          className="h-full w-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open a modal or expand the video
                            const video = e.currentTarget as HTMLVideoElement;
                            if (video.paused) {
                              video.play();
                            } else {
                              video.pause();
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <source src={item.image} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700 shadow-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )
                  ) : (
                    <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700 shadow-sm bg-gray-800 flex items-center justify-center">
                      <span className="text-xs text-gray-400 text-center p-2">
                        THIS CONTENT IS NOT AVAILABLE
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-[#1E9AD3] text-sm">
                          Turtle Timepiece
                        </div>
                        <h3 className="font-semibold text-white">
                          {item.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-red-900/20 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <p className="text-white font-semibold mt-1">
                      {item.price} ETH
                    </p>

                    {item.image?.endsWith(".mp4") && (
                      <button
                        className="mt-2 px-3 py-1 text-xs rounded-md bg-[#1E9AD3]/10 text-[#1E9AD3] hover:bg-[#1E9AD3]/20 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open a larger view of the video or item
                          window.open(item.image, "_blank");
                        }}
                      >
                        View NFT
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isFullyAuthenticated && items.length > 0 && (
          <>
            <div className="border-t border-gray-700 p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-semibold text-white">
                  {totalPrice.toFixed(2)} ETH
                </span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Service Fee (2.5%)</span>
                <span className="font-semibold text-white">
                  {serviceFee.toFixed(2)} ETH
                </span>
              </div>

              <div className="border-t border-gray-700 pt-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg text-gray-300">
                    Total
                  </span>
                  <span className="font-bold text-xl text-white">
                    {finalTotal.toFixed(2)} ETH
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-white mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("crypto")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all border ${
                      paymentMethod === "crypto"
                        ? "bg-[#1A2435] border-[#1E9AD3] text-white"
                        : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <Bitcoin size={18} />
                    Crypto
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all border ${
                      paymentMethod === "card"
                        ? "bg-[#1A2435] border-[#1E9AD3] text-white"
                        : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <CreditCard size={18} />
                    Card
                  </button>
                </div>
              </div>

              <button className="w-full bg-[#1E9AD3] text-white py-3.5 rounded-xl font-medium hover:bg-[#1789bd] transition-all">
                Complete Purchase
              </button>

              <button
                onClick={() => clearCart()}
                className="w-full text-center py-4 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
