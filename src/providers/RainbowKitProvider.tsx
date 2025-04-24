import React from "react";
import {
  RainbowKitProvider as RKProvider,
  getDefaultWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

// Import RainbowKit styles
import "@rainbow-me/rainbowkit/styles.css";

// Configure chains & providers
const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

// Set up wallets
const { connectors } = getDefaultWallets({
  appName: "Timeless Turtle",
  projectId: "your-project-id", // Get one from https://cloud.walletconnect.com
  chains,
});

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

interface RainbowKitProviderProps {
  children: React.ReactNode;
}

const RainbowKitProvider: React.FC<RainbowKitProviderProps> = ({
  children,
}) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RKProvider chains={chains} theme={darkTheme()}>
        {children}
      </RKProvider>
    </WagmiConfig>
  );
};

export default RainbowKitProvider;
