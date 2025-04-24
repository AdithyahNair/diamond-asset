import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const WalletConnect = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                  >
                    {chain.hasIcon && (
                      <div className="flex items-center">
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-4 h-4 mr-1"
                          />
                        )}
                        {chain.name}
                      </div>
                    )}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnect;
