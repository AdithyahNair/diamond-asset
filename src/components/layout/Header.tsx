import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { effects } from "../../styles/designSystem";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../auth/AuthModal";
import WalletStatus from "../wallet/WalletStatus";
import MobileMenu from "./MobileMenu";

const Logo = () => (
  <Link to="/" className="flex items-center">
    <div className="flex items-center">
      <img
        src="/images/aquaduct.png"
        alt="Aquaduct"
        className="h-8 brightness-0 invert"
      />
    </div>
  </Link>
);

interface NavItem {
  label: string;
  path: string;
}

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const {
    user,
    isFullyAuthenticated,
    logout,
    walletAddress,
    isWalletConnected,
  } = useAuth();
  const [networkName, setNetworkName] = useState<string>("Unknown");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [];

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum && isWalletConnected) {
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          const sepoliaChainId = "0xaa36a7"; // Sepolia testnet

          if (chainId !== sepoliaChainId) {
            try {
              // Try to switch to Sepolia
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: sepoliaChainId }],
              });
            } catch (error: any) {
              if (error.code === 4902) {
                // Network needs to be added
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: sepoliaChainId,
                      chainName: "Sepolia Testnet",
                      nativeCurrency: {
                        name: "ETH",
                        symbol: "ETH",
                        decimals: 18,
                      },
                      rpcUrls: ["https://sepolia.infura.io/v3/"],
                      blockExplorerUrls: ["https://sepolia.etherscan.io"],
                    },
                  ],
                });
              }
            }
          }

          setNetworkName("Sepolia Testnet");
          setIsCorrectNetwork(chainId === sepoliaChainId);
        } catch (error) {
          console.error("Error checking network:", error);
          setNetworkName("Wrong Network");
          setIsCorrectNetwork(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? `${effects.glassmorphism} shadow-lg border-b border-cyan-400/5 bg-black/80`
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Logo />

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    location.pathname === item.path
                      ? "text-cyan-400"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-white/80 px-4 py-2 rounded-full bg-white/5">
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
                  <Link
                    to="/my-collection"
                    className="px-4 py-2 text-sm font-medium text-navy-900 bg-cyan-400 rounded-full hover:bg-cyan-500 transition-colors duration-300"
                  >
                    My Collection
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full text-white/80 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-300"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </nav>
        </div>
      </motion.header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        user={user}
        onLogout={logout}
        walletAddress={walletAddress}
        networkName={networkName}
        isCorrectNetwork={isCorrectNetwork}
        onAuthModalOpen={() => setIsAuthModalOpen(true)}
      />
    </>
  );
};

export default Header;
