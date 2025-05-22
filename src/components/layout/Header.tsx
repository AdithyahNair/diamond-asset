import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, LogOut, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import AuthModal from "../auth/AuthModal";
import CartSidebar from "../cart/CartSidebar";
import WalletStatus from "../wallet/WalletStatus";

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const {
    user,
    isFullyAuthenticated,
    logout,
    walletAddress,
    isWalletConnected,
  } = useAuth();
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const [networkName, setNetworkName] = useState<string>("Unknown");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum && isWalletConnected) {
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          const networks: Record<string, string> = {
            "0x1": "Mainnet",
            "0xaa36a7": "Sepolia",
            "0x13881": "Mumbai",
            "0xa86a": "Avalanche",
          };
          const name = networks[chainId] || "Unknown";
          setNetworkName(name);
          setIsCorrectNetwork(chainId === "0xaa36a7"); // Sepolia testnet
        } catch (error) {
          console.error("Error checking network:", error);
        }
      }
    };

    checkNetwork();

    if (window.ethereum) {
      window.ethereum.on("chainChanged", checkNetwork);
      return () => {
        window.ethereum.removeListener("chainChanged", checkNetwork);
      };
    }
  }, [isWalletConnected]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center">
                <img
                  src="/images/aquaduct.png"
                  alt="Logo"
                  className="h-8 brightness-0 invert"
                />
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/collections"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Collections
                </Link>
                <Link
                  to="/my-nfts"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  My NFTs
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-200 px-4 py-2 rounded-full bg-white/5">
                    <User size={16} />
                    <span className="text-sm">
                      {user?.email?.split("@")[0]}
                    </span>
                  </div>
                  {isWalletConnected && walletAddress && (
                    <WalletStatus
                      address={walletAddress}
                      networkName={networkName}
                      isCorrectNetwork={isCorrectNetwork}
                    />
                  )}
                  <button
                    onClick={logout}
                    className="p-2 rounded-full text-gray-200 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-2 rounded-full text-gray-200 hover:text-white border border-[#1E3A5F] hover:border-[#1E9AD3] hover:bg-[#1E9AD3]/10 font-medium transition-all duration-300"
                >
                  Login
                </button>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1E9AD3] text-white text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Header;
