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
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B1F3A] border-b border-[#1E3A5F] py-5">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 xl:px-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="h-[36px]">
                <img
                  src="/images/aquaduct.png"
                  alt="Aquaduct"
                  className="h-full w-auto brightness-0 invert"
                />
              </Link>
              <Link
                to="/browse-collections"
                className="text-gray-200 hover:text-[#1E9AD3] font-medium transition-colors relative group"
              >
                Collections
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1E9AD3] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center space-x-4">
              {isFullyAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-200">
                    <User size={16} />
                    <span className="text-sm">
                      {user?.email?.split("@")[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-200 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="text-gray-200 hover:text-white px-6 py-2 border border-[#1E3A5F] rounded-full hover:border-[#2E4A6F] hover:bg-[#1E3A5F]/50 font-medium transition-all duration-300"
                >
                  {user ? "Connect Wallet" : "Login"}
                </button>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-200 hover:text-[#1E9AD3] transition-colors"
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-[#1E9AD3] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

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
