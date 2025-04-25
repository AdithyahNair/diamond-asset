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
            gas: "0x5208", // 21000 gas (standard transaction)
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
 * Purchases an NFT from the contract
 *
 * @param specificAccount - Optional specific account address to use for the purchase
 * @returns Transaction result object
 */
export const purchaseNFT = async (
  specificAccount?: string
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
            throw new Error("Could not add Sepolia network");
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
          throw new Error("Could not switch to Sepolia network");
        }
      }
    }

    // If a specific account was provided, use it
    // Otherwise, just get the available accounts (which will prompt MetaMask to show account selector)
    const method = specificAccount ? "eth_requestAccounts" : "eth_accounts";
    const accounts = await window.ethereum.request({
      method: method,
    });

    // If a specific account was provided, check if it's available
    // Otherwise use the first account in the list
    let from: string;
    if (specificAccount) {
      // Convert to lowercase for case-insensitive comparison
      const lowerSpecificAccount = specificAccount.toLowerCase();
      const foundAccount = accounts.find(
        (acc: string) => acc.toLowerCase() === lowerSpecificAccount
      );

      if (!foundAccount) {
        throw new Error("The specified account is not available in MetaMask");
      }
      from = foundAccount;
    } else {
      // No specific account provided, so let the user select in MetaMask
      // If no accounts available, this will trigger MetaMask's account selector
      if (accounts.length === 0) {
        const requestedAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        from = requestedAccounts[0];
      } else {
        from = accounts[0];
      }
    }

    // Convert ETH price to wei (as a hex string)
    const value = parseEther(`${NFT_PRICE}`);

    // Call mintWithETH function on the contract
    const transactionHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to: NFT_CONTRACT_ADDRESS,
          value: value.toString(16),
          gas: "0x55F0", // 22000 gas (slightly more than standard for contract interaction)
          data: "0x6a627842000000000000000000000000" + from.slice(2), // function mintWithETH(address)
          chainId: "0xaa36a7", // Ensure we're using Sepolia testnet
        },
      ],
    });

    return {
      status: "success",
      transactionHash,
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

/**
 * Hook for sending Ethereum transactions
 */
export const useEthereumTransaction = () => {
  const { writeContract, isPending, isSuccess, isError, error, data } =
    useWriteContract();

  // Get transaction receipt
  const {
    data: receipt,
    isLoading: isWaitingForReceipt,
    isSuccess: isReceiptSuccess,
  } = useWaitForTransactionReceipt({
    hash: data,
  });

  // Send payment to seller
  const sendPayment = async (amountInEth: number) => {
    try {
      await sendTransaction(amountInEth);
    } catch (error) {
      const err = error as Error;
      console.error("Payment failed:", err);
      throw err;
    }
  };

  // Purchase an NFT
  const buyNFT = async () => {
    try {
      return await purchaseNFT();
    } catch (error) {
      const err = error as Error;
      console.error("NFT purchase failed:", err);
      throw err;
    }
  };

  return {
    sendPayment,
    buyNFT,
    isPending: isPending || isWaitingForReceipt,
    isSuccess: isSuccess && isReceiptSuccess,
    isError,
    error,
    transactionHash: data,
    receipt,
  };
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
