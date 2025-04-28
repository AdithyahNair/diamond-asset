import { ethers, Contract, Provider, Signer } from "ethers";
import contractInfo from "../../contract-info.json";

// The address of our deployed contract
export const NFT_CONTRACT_ADDRESS = contractInfo.address;

// The ABI (Application Binary Interface) of our contract
export const NFT_CONTRACT_ABI = contractInfo.abi;

// NFT price in ETH
export const NFT_PRICE = 0.001;

// Get the NFT contract instance
export const getNftContract = async (signer: Signer | Provider) => {
  return new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
};

// Get available NFTs
export const getAvailableNfts = async (provider: Provider) => {
  try {
    const contract = await getNftContract(provider);
    const maxSupply = 8;
    const currentSupply = await contract.getTokenCount();

    // Convert to number and ensure it's a valid value
    const currentSupplyNum = Number(currentSupply);
    const available = maxSupply - currentSupplyNum;

    return Math.max(0, available); // Ensure we don't return negative numbers
  } catch (error) {
    console.error("Error getting available NFTs:", error);
    return 0; // Return 0 on error
  }
};

// Get the current mint price from the contract
export const getMintPrice = async (provider: Provider) => {
  try {
    const contract = await getNftContract(provider);
    const price = await contract.mintPrice();
    return ethers.formatEther(price);
  } catch (error) {
    console.error("Error getting mint price:", error);
    return "0.001"; // Fallback to default price
  }
};

// Check if the contract is paused
export const isContractPaused = async (provider: Provider) => {
  try {
    const contract = await getNftContract(provider);
    return await contract.paused();
  } catch (error) {
    console.error("Error checking if contract is paused:", error);
    return true; // Assume paused on error to be safe
  }
};

// Purchase an NFT
export const purchaseNft = async (signer: Signer, recipient: string) => {
  try {
    const contract = await getNftContract(signer);

    // Check if contract is paused first
    const provider = await signer.provider;
    if (!provider) {
      throw new Error("No provider available");
    }
    const paused = await isContractPaused(provider);
    if (paused) {
      throw new Error(
        "Contract is currently paused. Minting is not available."
      );
    }

    // Get the current price from the contract
    const price = await contract.mintPrice();

    const tx = await contract.mintWithETH(recipient, {
      value: price, // Use the price from the contract
    });

    return {
      success: true,
      transaction: tx,
      hash: tx.hash,
    };
  } catch (error) {
    console.error("Error purchasing NFT:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to purchase NFT";
    if ((error as Error).message.includes("Max supply reached")) {
      errorMessage = "All NFTs have been sold out";
    } else if ((error as Error).message.includes("Insufficient ETH sent")) {
      errorMessage = "Insufficient payment. Please send the correct amount.";
    } else if (
      (error as Error).message.includes("Address has already purchased an NFT")
    ) {
      errorMessage = "You have already purchased an NFT";
    } else if (
      (error as Error).message.includes("Contract is currently paused")
    ) {
      errorMessage = "Minting is currently paused. Please try again later.";
    } else if ((error as Error).message.includes("execution reverted")) {
      errorMessage = "Transaction failed. The contract may be paused.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Get NFTs owned by an address
export const getNftsOwnedBy = async (provider: Provider, address: string) => {
  try {
    const contract = await getNftContract(provider);
    const totalSupply = await contract.getTokenCount();
    const ownedNfts = [];

    // This is a simplified approach - in a real app you might want to use events
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === address.toLowerCase()) {
          const tokenURI = await contract.tokenURI(i);
          const metadata = await getNFTMetadata(provider, i);
          ownedNfts.push({
            id: i,
            tokenURI,
            metadata,
            imageUrl: metadata?.image
              ? await getNFTImageUrl(provider, i)
              : null,
          });
        }
      } catch (err) {
        // Token might not exist or be burned
        console.warn(`Error checking token ${i}:`, err);
      }
    }

    return ownedNfts;
  } catch (error) {
    console.error("Error getting owned NFTs:", error);
    return [];
  }
};

// Get NFT metadata
export const getNFTMetadata = async (provider: Provider, tokenId: number) => {
  try {
    // Return hardcoded metadata for now
    return {
      name: "Turtle Timepiece Genesis",
      description:
        "Exclusive NFT that grants you unprecedented access and privileges",
      image:
        "https://purple-bright-chinchilla-487.mypinata.cloud/ipfs/bafybeia24wi54ltggaeq3524gdzjv77cxwmcpa64g45mclkfx3ccjednwm",
    };
  } catch (error) {
    console.error("Error getting NFT metadata:", error);
    return null;
  }
};

// Get NFT image URL
export const getNFTImageUrl = async (provider: Provider, tokenId: number) => {
  try {
    const metadata = await getNFTMetadata(provider, tokenId);
    if (!metadata || !metadata.image) {
      return null;
    }

    // If the image URL is an IPFS hash, construct the gateway URL
    if (metadata.image.startsWith("ipfs://")) {
      const ipfsGateway = "https://gateway.pinata.cloud/ipfs/";
      const ipfsHash = metadata.image.replace("ipfs://", "");
      return `${ipfsGateway}${ipfsHash}`;
    }

    return metadata.image;
  } catch (error) {
    console.error("Error getting NFT image URL:", error);
    return null;
  }
};
