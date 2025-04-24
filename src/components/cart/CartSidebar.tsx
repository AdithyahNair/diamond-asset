import React from "react";
import { X, ShoppingCart, Trash2 } from "lucide-react";
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
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } =
    useCart();
  const { isFullyAuthenticated, user, isWalletConnected } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            Your Cart {totalItems > 0 && `(${totalItems})`}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {!isFullyAuthenticated ? (
            <div className="text-center py-10">
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  Complete these steps to shop
                </h3>
                <div className="flex flex-col gap-4 mt-6">
                  <div
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      !user
                        ? "bg-yellow-100 border border-yellow-300"
                        : "bg-green-100 border border-green-300"
                    }`}
                  >
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-white">
                      1
                    </div>
                    <span className="flex-1 text-left">
                      {!user ? "Login with Email" : "✓ Logged in"}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      !isWalletConnected
                        ? "bg-yellow-100 border border-yellow-300"
                        : "bg-green-100 border border-green-300"
                    }`}
                  >
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-white">
                      2
                    </div>
                    <span className="flex-1 text-left">
                      {!isWalletConnected
                        ? "Connect Your Wallet"
                        : "✓ Wallet Connected"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={openAuthModal}
                  className="mt-6 w-full bg-[#1E9AD3] text-white py-2 rounded-lg hover:bg-[#1789bd] transition-colors"
                >
                  {!user ? "Login" : "Connect Wallet"}
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                <ShoppingCart size={32} />
              </div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  {item.image && (
                    <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-[#1E9AD3] font-semibold">
                      {item.price} ETH
                    </p>

                    <div className="flex items-center mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="h-7 w-7 border rounded-l flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <div className="h-7 px-3 border-t border-b flex items-center justify-center">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="h-7 w-7 border rounded-r flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isFullyAuthenticated && items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total</span>
              <span className="font-semibold">{totalPrice.toFixed(2)} ETH</span>
            </div>

            <button className="w-full bg-[#1E9AD3] text-white py-3 rounded-lg hover:bg-[#1789bd] transition-colors">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
