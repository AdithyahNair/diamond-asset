import React, { useState } from "react";
import LoginModal from "../auth/LoginModal";

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 py-5">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 xl:px-24 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="h-[36px]">
              <img
                src="/images/aquaduct.png"
                alt="Aquaduct"
                className="h-full w-auto"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <a
              href="#collections"
              className="px-5 text-gray-700 hover:text-[#004B71] font-medium transition-colors"
            >
              Collections
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-gray-700 hover:text-[#004B71] px-6 py-2 border border-gray-300 rounded-full hover:border-gray-400 font-medium transition-colors"
            >
              Login
            </button>
            <button className="bg-[#0B1120] text-white px-6 py-2 rounded-full hover:bg-[#162236] transition-colors">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Header;
