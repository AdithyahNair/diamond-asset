import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { effects } from "../../styles/designSystem";
import { LogOut, User } from "lucide-react";
import WalletStatus from "../wallet/WalletStatus";
import { User as UserType } from "../../types/auth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{ label: string; path: string }>;
  user: UserType | null;
  onLogout: () => void;
  walletAddress?: string;
  networkName: string;
  isCorrectNetwork: boolean;
  onAuthModalOpen: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  user,
  onLogout,
  walletAddress,
  networkName,
  isCorrectNetwork,
  onAuthModalOpen,
}) => {
  const defaultNavItems = [{ label: "Collections", path: "/collections" }];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className={`${effects.glassmorphism} fixed top-0 right-0 w-64 h-full z-50 bg-black/95`}
          >
            <div className="flex flex-col h-full">
              {/* Close Button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* User Info (if logged in) */}
              {user && (
                <div className="px-4 py-2 border-b border-white/10">
                  <div className="flex items-center space-x-2 text-white/80 p-2 rounded-lg bg-white/5">
                    <User size={16} />
                    <span className="text-sm">{user.email?.split("@")[0]}</span>
                  </div>
                  {walletAddress && (
                    <div className="mt-2">
                      <WalletStatus
                        address={walletAddress}
                        networkName={networkName}
                        isCorrectNetwork={isCorrectNetwork}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className="block py-2 text-white/80 hover:text-cyan-400 transition-colors duration-300"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Auth Actions */}
              <div className="p-4 border-t border-white/10 space-y-4">
                {user ? (
                  <>
                    <Link
                      to="/my-nfts"
                      onClick={onClose}
                      className="block w-full py-2 text-center text-navy-900 bg-cyan-400 rounded-full hover:bg-cyan-500 transition-colors duration-300"
                    >
                      My Collection
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="flex items-center justify-center w-full space-x-2 py-2 text-white/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onAuthModalOpen();
                      onClose();
                    }}
                    className="block w-full py-2 text-center text-white/80 hover:text-white transition-colors duration-300"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
