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
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 py-5">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 xl:px-24 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="h-[36px]">
              <img
                src="/images/aquaduct.png"
                alt="Aquaduct"
                className="h-full w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/collections"
              className="px-5 text-gray-700 hover:text-[#004B71] font-medium transition-colors"
            >
              Collections
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-4">
            {isFullyAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-700">
                  <User size={16} />
                  <span className="text-sm">{user?.email?.split("@")[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-500 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthClick}
                className="text-gray-700 hover:text-[#004B71] px-6 py-2 border border-gray-300 rounded-full hover:border-gray-400 font-medium transition-colors"
              >
                {user ? "Connect Wallet" : "Login"}
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-[#004B71] transition-colors"
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
