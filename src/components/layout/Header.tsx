import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, LogOut, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import AuthModal from "../auth/AuthModal";
import CartSidebar from "../cart/CartSidebar";

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isFullyAuthenticated, logout } = useAuth();
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-7xl">
        <nav className="bg-[#0B1F3A]/95 backdrop-blur-sm rounded-full border border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="h-[36px] transition-transform hover:scale-105"
              >
                <img
                  src="/images/aquaduct.png"
                  alt="Aquaduct"
                  className="h-full w-auto brightness-0 invert"
                />
              </Link>
              <Link
                to="/browse-collections"
                className="px-4 py-2 rounded-full text-gray-200 hover:text-white hover:bg-white/5 font-medium transition-all duration-300 relative group"
              >
                Collections
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#1E9AD3] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center space-x-4">
              {isFullyAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-200 px-4 py-2 rounded-full bg-white/5">
                    <User size={16} />
                    <span className="text-sm">
                      {user?.email?.split("@")[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full text-gray-200 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="px-6 py-2 rounded-full text-gray-200 hover:text-white border border-[#1E3A5F] hover:border-[#1E9AD3] hover:bg-[#1E9AD3]/10 font-medium transition-all duration-300"
                >
                  {user ? "Connect Wallet" : "Login"}
                </button>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full text-gray-200 hover:text-[#1E9AD3] hover:bg-[#1E9AD3]/10 transition-all duration-300"
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1E9AD3] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        openAuthModal={() => {
          setIsCartOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
    </>
  );
};

export default Header;
