import React from "react";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

const CartSidebar = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, clearCart } =
    useCart();
  const { user, isWalletConnected } = useAuth();

  if (!isCartOpen) return null;

  const calculateTotal = () => {
    return cartItems.reduce(
      (total: number, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-[#13111C] shadow-xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 rounded-lg p-4 flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/40 flex-shrink-0">
                      {item.image.endsWith(".mp4") ? (
                        <video
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          <source src={item.image} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.name}</h3>
                      <div className="text-sm text-gray-400 mb-2">
                        {item.price} ETH × {item.quantity}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">
                        {(item.price * item.quantity).toFixed(3)} ETH
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-white/10 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Total</span>
                <span className="text-xl font-bold">
                  {calculateTotal().toFixed(3)} ETH
                </span>
              </div>

              <div className="space-y-3">
                {!user && (
                  <div className="text-sm text-yellow-400 bg-yellow-400/10 p-3 rounded-lg">
                    Please login to complete your purchase
                  </div>
                )}

                {user && !isWalletConnected && (
                  <div className="text-sm text-yellow-400 bg-yellow-400/10 p-3 rounded-lg">
                    Connect your wallet to complete the purchase
                  </div>
                )}

                <button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!user || !isWalletConnected}
                >
                  Checkout
                </button>

                <button
                  onClick={clearCart}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-lg font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
