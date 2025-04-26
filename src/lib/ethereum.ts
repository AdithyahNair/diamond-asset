import { parseEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { NFT_CONTRACT_ADDRESS, NFT_PRICE } from "./nftContract";

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
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    // First check if we're already on Sepolia
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const sepoliaChainId = "0xaa36a7";

    // Only switch networks if we're not already on Sepolia
    if (chainId !== sepoliaChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: sepoliaChainId }], // chainId for Sepolia testnet in hex
        });
      } catch (error) {
        const switchError = error as EthereumProviderError;
        // This error code indicates that the chain has not been added to MetaMask
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
        } else if (switchError.code === 4001 || switchError.code === 4100) {
          // User rejected the request or unauthorized
          console.error("User rejected the network switch:", switchError);
          return {
            status: "error",
            errorMessage:
              "Network switch was rejected. Please manually switch to Sepolia network in MetaMask.",
          };
        } else {
          console.error("Error switching to Sepolia:", switchError);
          return {
            status: "error",
            errorMessage: `Could not switch to Sepolia network: ${switchError.message}`,
          };
        }
      }
    }

    // Request account access
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const from = accounts[0];

      // Convert ETH amount to wei (as a hex string)
      const value = parseEther(`${amount}`);

      // Send transaction
      const transactionHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from,
            to: SELLER_ADDRESS,
            value: value.toString(16),
            gas: "0x30D40", // 200,000 gas, much higher than minimum
            chainId: "0xaa36a7", // Ensure we're using Sepolia testnet
          },
        ],
      });

      return {
        status: "success",
        transactionHash,
      };
    } catch (error) {
      const txError = error as EthereumProviderError;
      // Handle user rejection of the transaction request
      if (txError.code === 4001) {
        return {
          status: "error",
          errorMessage: "Transaction was rejected by user.",
        };
      }

      console.error("Transaction failed:", txError);
      return {
        status: "error",
        errorMessage: txError.message || "Transaction failed",
      };
    }
  } catch (error) {
    const err = error as Error;
    console.error("Transaction failed:", err);
    return {
      status: "error",
      errorMessage: err.message || "Transaction failed",
    };
  }
};

/**
 * Hook for sending Ethereum transactions
 */
export const useEthereumTransaction = () => {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const sendPayment = async (
    amountInEth: number
  ): Promise<TransactionResult> => {
    try {
      await writeContract({
        address: SELLER_ADDRESS,
        abi: [], // Empty ABI since we're just sending ETH
        functionName: "", // No function name needed for direct ETH transfer
        value: parseEther(amountInEth.toString()),
      });

      if (isConfirming) {
        return {
          status: "pending",
          transactionHash: hash,
        };
      }

      return {
        status: isConfirmed ? "success" : "pending",
        transactionHash: hash,
      };
    } catch (error) {
      console.error("Payment failed:", error);
      return {
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Payment failed",
      };
    }
  };

  const buyNFT = async (): Promise<TransactionResult> => {
    try {
      await writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: [
          {
            name: "mintWithETH",
            type: "function",
            stateMutability: "payable",
            inputs: [],
            outputs: [],
          },
        ],
        functionName: "mintWithETH",
        value: parseEther(NFT_PRICE.toString()),
      });

      if (isConfirming) {
        return {
          status: "pending",
          transactionHash: hash,
        };
      }

      return {
        status: isConfirmed ? "success" : "pending",
        transactionHash: hash,
      };
    } catch (error) {
      console.error("NFT purchase failed:", error);
      return {
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "NFT purchase failed",
      };
    }
  };

  return {
    sendPayment,
    buyNFT,
  };
};

// Helper to pad address to 32 bytes
function padAddress(address: string) {
  return address.toLowerCase().replace("0x", "").padStart(64, "0");
}

/**
 * Purchases an NFT from the contract
 *
 * @returns Transaction result object
 */
export const purchaseNFT = async (): Promise<TransactionResult> => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const sepoliaChainId = "0xaa36a7";
    if (chainId !== sepoliaChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: sepoliaChainId }],
        });
      } catch (error) {
        const switchError = error as EthereumProviderError;
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
        } else if (switchError.code === 4001 || switchError.code === 4100) {
          console.error("User rejected the network switch:", switchError);
          return {
            status: "error",
            errorMessage:
              "Network switch was rejected. Please manually switch to Sepolia network in MetaMask.",
          };
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
    const value = parseEther(NFT_PRICE.toString());

    // Correct function selector for mintWithETH(address)
    const functionSelector = "0x5afcb497";
    const data = functionSelector + padAddress(from);

    const transactionHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to: NFT_CONTRACT_ADDRESS,
          value: value.toString(16),
          gas: "0x30D40",
          chainId: "0xaa36a7",
          data,
        },
      ],
    });

    return {
      status: "success",
      transactionHash: transactionHash as string,
    };
  } catch (error) {
    const err = error as Error;
    console.error("NFT purchase failed:", err);
    return {
      status: "error",
      errorMessage: err.message || "NFT purchase failed",
    };
  }
};

// Define Ethereum window interface
declare global {
  interface Window {
    ethereum: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
  }
}
