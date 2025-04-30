// src/lib/ethereum.ts
import { parseEther } from "viem";
import { ethers } from "ethers";
import {
  NFT_CONTRACT_ADDRESS,
  NFT_PRICE,
  NFT_CONTRACT_ABI,
} from "./nftContract";

// The seller's wallet address (where payments will be sent)
export const SELLER_ADDRESS = "0xb2197e9066170Bbe67e877437FfCf5f7f3f092D3"; // The owner address of the NFT contract

interface TransactionResult {
  status: "success" | "error" | "pending";
  transactionHash?: string;
  errorMessage?: string;
}

// Define Ethereum provider error type
interface EthereumProviderError extends Error {
  code: number;
  message: string;
}

/**
 * Sends ETH from the user's wallet to the seller
 *
 * @param amount - Amount in ETH to send
 * @returns Transaction result object
 */
export const sendTransaction = async (
  amount: number
): Promise<TransactionResult> => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    // Check network and switch if needed
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const sepoliaChainId = "0xaa36a7";
    if (chainId !== sepoliaChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: sepoliaChainId }],
        });
      } catch (error) {
        const switchError = error as any;
        if (switchError.code === 4902) {
          try {
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
          } catch (addError) {
            console.error("Error adding Sepolia network:", addError);
            return {
              status: "error",
              errorMessage:
                "Could not add Sepolia network. Please try again or add it manually.",
            };
          }
        } else {
          console.error("Error switching to Sepolia:", switchError);
          return {
            status: "error",
            errorMessage: `Could not switch to Sepolia network: ${switchError.message}`,
          };
        }
      }
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const from = accounts[0];

    // Convert ETH amount to Wei
    const amountInWei = parseEther(amount.toString());

    // Prepare transaction parameters
    const txParams = {
      from: from,
      to: SELLER_ADDRESS,
      value: "0x" + amountInWei.toString(16), // Convert to hex
      gas: "0x5208", // 21000 gas for a standard ETH transfer
    };

    // Send transaction
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });

    return {
      status: "success",
      transactionHash: txHash,
    };
  } catch (error) {
    console.error("Transaction failed:", error);
    const err = error as EthereumProviderError;

    let errorMessage = "Transaction failed";
    if (err.code === 4001) {
      errorMessage = "Transaction rejected by user";
    } else if (err.message) {
      errorMessage = err.message;
    }

    return {
      status: "error",
      errorMessage,
    };
  }
};

/**
 * Check if user has sufficient balance
 *
 * @param quantity - Number of NFTs to check
 * @returns True if user has sufficient balance, false otherwise
 */
export const checkBalance = async (quantity: number): Promise<boolean> => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];

    // Get user's balance
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [account, "latest"],
    });

    // Convert balance from hex to decimal
    const balanceInWei = BigInt(balance);
    const requiredAmount = parseEther(NFT_PRICE.toString()) * BigInt(quantity);

    return balanceInWei >= requiredAmount;
  } catch (error) {
    console.error("Error checking balance:", error);
    return false;
  }
};

/**
 * Purchase a single NFT
 *
 * @returns Transaction result object
 */
export const purchaseNFT = async (): Promise<TransactionResult> => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    // Check balance first
    const hasBalance = await checkBalance(1);
    if (!hasBalance) {
      return {
        status: "error",
        errorMessage: "Insufficient funds to complete the purchase",
      };
    }

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const sepoliaChainId = "0xaa36a7";
    if (chainId !== sepoliaChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: sepoliaChainId }],
        });
      } catch (error) {
        const switchError = error as any;
        if (switchError.code === 4902) {
          try {
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
          } catch (addError) {
            console.error("Error adding Sepolia network:", addError);
            return {
              status: "error",
              errorMessage:
                "Could not add Sepolia network. Please try again or add it manually.",
            };
          }
        } else {
          console.error("Error switching to Sepolia:", switchError);
          return {
            status: "error",
            errorMessage: `Could not switch to Sepolia network: ${switchError.message}`,
          };
        }
      }
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const from = accounts[0];
    const priceInEth = parseEther(NFT_PRICE.toString());

    // Create a contract instance
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      signer
    );

    // Call the mintWithETH function directly
    const tx = await contract.mintWithETH(from, {
      value: priceInEth,
    });

    // Wait for transaction to be mined
    await tx.wait();

    return {
      status: "success",
      transactionHash: tx.hash,
    };
  } catch (error) {
    const err = error as Error;
    console.error("NFT purchase failed:", err);

    let errorMessage = "Failed to purchase NFT";
    if (err.message.includes("Max supply reached")) {
      errorMessage = "All NFTs have been sold out";
    } else if (err.message.includes("Insufficient ETH sent")) {
      errorMessage = "Insufficient payment. Please send the correct amount.";
    } else if (err.message.includes("execution reverted")) {
      errorMessage = "Transaction failed. The contract may be paused.";
    } else {
      errorMessage = err.message;
    }

    return {
      status: "error",
      errorMessage,
    };
  }
};

// Define Ethereum window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}
