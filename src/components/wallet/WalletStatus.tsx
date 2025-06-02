import React from "react";
import { Wallet, ChevronDown, ExternalLink } from "lucide-react";
import { useDisconnect } from "wagmi";

interface WalletStatusProps {
  address: string;
  networkName: string;
  isCorrectNetwork: boolean;
}

const WalletStatus: React.FC<WalletStatusProps> = ({
  address,
  networkName,
  isCorrectNetwork,
}) => {
  const { disconnect } = useDisconnect();

  const handleViewOnExplorer = () => {
    const baseUrl = isCorrectNetwork
      ? "https://sepolia.etherscan.io/address/"
      : "https://etherscan.io/address/";
    window.open(`${baseUrl}${address}`, "_blank");
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      // You could add a toast notification here
      console.log("Address copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="relative group">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1A2435] to-[#0D1829] border border-[#1E3A5F] hover:border-[#1E9AD3] transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#1E9AD3]/10 flex items-center justify-center">
              <Wallet size={16} className="text-[#1E9AD3]" />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0D1829] ${
                networkName === "Sepolia Testnet"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            >
              <span className="relative flex h-full">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    networkName === "Sepolia Testnet"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                ></span>
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <ExternalLink
                size={12}
                className="text-gray-400 hover:text-[#1E9AD3] cursor-pointer"
                onClick={handleViewOnExplorer}
              />
            </div>
            <span
              className={`text-xs ${
                networkName === "Sepolia Testnet"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {networkName}
            </span>
          </div>
        </div>

        <ChevronDown
          size={16}
          className="text-gray-400 group-hover:text-[#1E9AD3] transition-colors ml-1"
        />
      </div>

      {/* Hover dropdown */}
      <div className="absolute top-full left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
        <div className="p-3 rounded-xl bg-[#1A2435] border border-[#1E3A5F] shadow-xl">
          <div className="space-y-2">
            <button
              onClick={handleViewOnExplorer}
              className="w-full px-3 py-2 rounded-lg hover:bg-[#1E9AD3]/10 text-left text-sm text-gray-300 hover:text-[#1E9AD3] transition-colors flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-[#1E9AD3]/10 flex items-center justify-center">
                <ExternalLink size={12} className="text-[#1E9AD3]" />
              </span>
              View on Explorer
            </button>
            <button
              onClick={handleCopyAddress}
              className="w-full px-3 py-2 rounded-lg hover:bg-[#1E9AD3]/10 text-left text-sm text-gray-300 hover:text-[#1E9AD3] transition-colors flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-[#1E9AD3]/10 flex items-center justify-center">
                <svg
                  className="w-2.5 h-2.5 text-[#1E9AD3]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                  <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                </svg>
              </span>
              Copy Address
            </button>
            <div className="h-px bg-gray-700/50 my-2" />
            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2 rounded-lg hover:bg-red-500/10 text-left text-sm text-gray-300 hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg
                  className="w-2.5 h-2.5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </span>
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletStatus;
