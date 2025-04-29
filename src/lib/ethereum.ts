import { parseEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ethers } from "ethers";
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
        address: SELLER_ADDRESS as `0x${string}`,
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
      // Get the current user's address
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];

      await writeContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            name: "mintWithETH",
            type: "function",
            stateMutability: "payable",
            inputs: [{ name: "recipient", type: "address" }],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "mintWithETH",
        args: [userAddress],
        // We'll let the contract determine the price
        value: parseEther("0.001"), // This will be adjusted by the contract
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

      // Provide more specific error messages
      let errorMessage = "NFT purchase failed";
      if (error instanceof Error) {
        if (error.message.includes("Max supply reached")) {
          errorMessage = "All NFTs have been sold out";
        } else if (error.message.includes("Insufficient ETH sent")) {
          errorMessage =
            "Insufficient payment. Please send the correct amount.";
        } else if (
          error.message.includes("Address has already purchased an NFT")
        ) {
          errorMessage = "You have already purchased an NFT";
        } else if (error.message.includes("execution reverted")) {
          errorMessage = "Transaction failed. The contract may be paused.";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        status: "error",
        errorMessage,
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
 * Purchase multiple NFTs in a single transaction
 *
 * @param quantity - Number of NFTs to purchase
 * @returns Transaction result object
 */
export const batchPurchaseNFT = async (
  quantity: number
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

    // Check balance first
    const hasBalance = await checkBalance(quantity);
    if (!hasBalance) {
      return {
        status: "error",
        errorMessage: "Insufficient funds to complete the purchase",
      };
    }

    const value = parseEther(NFT_PRICE.toString()) * BigInt(quantity);

    // Function selector for batchMintWithETH(address,uint256)
    const functionSelector = "0x3f2e13d5"; // This is the first 4 bytes of keccak256("batchMintWithETH(address,uint256)")
    const encodedParams = encodeParameters(
      ["address", "uint256"],
      [from, quantity]
    );
    const data = functionSelector + encodedParams.slice(2); // Remove '0x' from encoded params

    const transactionHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to: NFT_CONTRACT_ADDRESS,
          value: value.toString(16), // Convert to hex
          chainId: sepoliaChainId,
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
    console.error("NFT batch purchase failed:", err);

    let errorMessage = "Failed to purchase NFTs";
    if (err.message.includes("Max supply reached")) {
      errorMessage = "All NFTs have been sold out";
    } else if (err.message.includes("Insufficient ETH sent")) {
      errorMessage = "Insufficient payment. Please send the correct amount.";
    } else if (err.message.includes("Would exceed max supply")) {
      errorMessage =
        "Cannot mint requested quantity - would exceed maximum supply";
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

// Helper function to encode parameters
function encodeParameters(types: string[], values: any[]): string {
  const abiCoder = new ethers.AbiCoder();
  return abiCoder.encode(types, values);
}

// Original single NFT purchase function
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

    // Function selector for mintWithETH(address)
    const functionSelector = "0x5afcb497";
    const data = functionSelector + padAddress(from);

    const transactionHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to: NFT_CONTRACT_ADDRESS,
          value: value.toString(16),
          chainId: sepoliaChainId,
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
    ethereum?: any;
  }
}
