import { ethers, Contract, Provider, Signer } from "ethers";
import contractInfo from "../../contract-info.json";
import { supabase } from "../lib/supabase";

// The address of our deployed contract
export const NFT_CONTRACT_ADDRESS = contractInfo.address;

// Contract ABI
export const NFT_CONTRACT_ABI = contractInfo.abi;

// NFT price in ETH
export const NFT_PRICE = 0.114;

// Get the NFT contract instance
export const getNftContract = async (signer: Signer | Provider) => {
  return new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
};

// Get available NFTs for sale
export const getAvailableNFTs = async (provider: Provider) => {
  try {
    const contract = await getNftContract(provider);
    const tokensForSale = await contract.getTokensForSale();

    // Filter out any pre-purchased tokens
    const availableTokens = [];
    for (const tokenId of tokensForSale) {
      const prePurchaser = await contract.getPrePurchaser(tokenId);
      if (prePurchaser === ethers.ZeroAddress) {
        availableTokens.push(Number(tokenId));
      }
    }

    return availableTokens;
  } catch (error) {
    console.error("Error getting available NFTs:", error);
    return [];
  }
};

// Get the current sale price from the contract
export const getMintPrice = async (provider: Provider) => {
  try {
    const contract = await getNftContract(provider);
    const price = await contract.mintPrice();
    return ethers.formatEther(price);
  } catch (error) {
    console.error("Error getting sale price:", error);
    return "0.11"; // Fallback to default price
  }
};

// Check if a specific token is for sale
export const isTokenForSale = async (provider: Provider, tokenId: number) => {
  try {
    const contract = await getNftContract(provider);
    return await contract.isTokenForSale(tokenId);
  } catch (error) {
    console.error("Error checking token sale status:", error);
    return false;
  }
};

// Check if a token is pre-purchased and by whom
export const getPrePurchaser = async (provider: Provider, tokenId: number) => {
  try {
    const contract = await getNftContract(provider);
    return await contract.getPrePurchaser(tokenId);
  } catch (error) {
    console.error("Error checking pre-purchase status:", error);
    return ethers.ZeroAddress;
  }
};

// Purchase an NFT with ETH
export const purchaseNft = async (signer: Signer, tokenId: number) => {
  try {
    const contract = await getNftContract(signer);

    // Check if contract is paused
    const paused = await contract.paused();
    if (paused) {
      throw new Error(
        "Contract is currently paused. Purchases are not available."
      );
    }

    // Check if the token is for sale
    const forSale = await contract.isTokenForSale(tokenId);
    if (!forSale) {
      throw new Error("This NFT is not available for sale");
    }

    // Check if token is pre-purchased
    const prePurchaser = await contract.getPrePurchaser(tokenId);
    if (prePurchaser !== ethers.ZeroAddress) {
      throw new Error("This NFT has been pre-purchased");
    }

    // Get the current price from the contract
    const price = await contract.mintPrice();

    const tx = await contract.purchaseNFT(tokenId, {
      value: price,
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
    if ((error as Error).message.includes("Token is not for sale")) {
      errorMessage = "This NFT is not available for purchase";
    } else if ((error as Error).message.includes("Insufficient ETH sent")) {
      errorMessage = "Insufficient payment. Please send the correct amount.";
    } else if ((error as Error).message.includes("Cannot buy your own token")) {
      errorMessage = "You cannot purchase your own NFT";
    } else if ((error as Error).message.includes("Token is pre-purchased")) {
      errorMessage = "This NFT has already been pre-purchased";
    } else if ((error as Error).message.includes("execution reverted")) {
      errorMessage = "Transaction failed. The contract may be paused.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Claim a pre-purchased NFT
export const claimNft = async (signer: Signer, tokenId: number) => {
  try {
    const contract = await getNftContract(signer);

    // Check if contract is paused
    const paused = await contract.paused();
    if (paused) {
      throw new Error(
        "Contract is currently paused. Claims are not available."
      );
    }

    // Check if the caller is the pre-purchaser
    const prePurchaser = await contract.getPrePurchaser(tokenId);
    const signerAddress = await signer.getAddress();

    if (prePurchaser.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("You are not authorized to claim this NFT");
    }

    const tx = await contract.claimToken(tokenId);

    return {
      success: true,
      transaction: tx,
      hash: tx.hash,
    };
  } catch (error) {
    console.error("Error claiming NFT:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to claim NFT";
    if ((error as Error).message.includes("Not authorized to claim")) {
      errorMessage = "You are not authorized to claim this NFT";
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

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await contract.ownerOf(i);
        const prePurchaserAddress = await contract.getPrePurchaser(i);

        if (owner.toLowerCase() === address.toLowerCase()) {
          const tokenURI = await contract.tokenURI(i);
          const forSale = await contract.isTokenForSale(i);
          const metadata = await getNFTMetadata(provider, i);
          ownedNfts.push({
            id: i,
            tokenURI,
            metadata,
            forSale,
            prePurchaser: prePurchaserAddress,
            imageUrl: metadata?.image
              ? await getNFTImageUrl(provider, i)
              : null,
          });
        } else if (
          prePurchaserAddress &&
          prePurchaserAddress.toLowerCase() === address.toLowerCase()
        ) {
          // Include pre-purchased NFTs that haven't been claimed yet
          const tokenURI = await contract.tokenURI(i);
          const metadata = await getNFTMetadata(provider, i);
          ownedNfts.push({
            id: i,
            tokenURI,
            metadata,
            forSale: false,
            prePurchaser: prePurchaserAddress,
            canClaim: true,
            imageUrl: metadata?.image
              ? await getNFTImageUrl(provider, i)
              : null,
          });
        }
      } catch (err) {
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
    console.log(`[DEBUG] Fetching metadata for token ${tokenId}...`);
    const contract = await getNftContract(provider);
    const tokenURI = await contract.tokenURI(tokenId);
    console.log(`[DEBUG] Raw token URI for ${tokenId}:`, tokenURI);

    // Convert URL to a gateway URL if it's IPFS
    let metadataUrl = tokenURI;
    if (tokenURI.startsWith("ipfs://")) {
      const ipfsPath = tokenURI.slice(7); // Remove 'ipfs://'
      // Always append .json for metadata files
      metadataUrl = `https://ipfs.io/ipfs/${ipfsPath}${
        ipfsPath.endsWith(".json") ? "" : ".json"
      }`;
    }
    console.log(`[DEBUG] Final metadata URL:`, metadataUrl);

    // Try multiple IPFS gateways
    const gateways = [
      "https://ipfs.io/ipfs/",
      "https://cloudflare-ipfs.com/ipfs/",
      "https://dweb.link/ipfs/",
      "https://gateway.pinata.cloud/ipfs/",
    ];

    let metadata = null;
    let lastError: Error | null = null;

    for (const gateway of gateways) {
      try {
        const gatewayUrl = metadataUrl.replace(
          "https://ipfs.io/ipfs/",
          gateway
        );
        console.log(`[DEBUG] Trying gateway: ${gatewayUrl}`);

        const response = await fetch(gatewayUrl);
        if (!response.ok) {
          console.warn(
            `[DEBUG] Gateway ${gateway} failed with status ${response.status}`
          );
          continue;
        }

        const text = await response.text();
        console.log(`[DEBUG] Raw response from ${gateway}:`, text);

        try {
          metadata = JSON.parse(text);
          // Keep the original IPFS URL in the metadata
          if (metadata.image && metadata.image.startsWith("https://")) {
            // Convert gateway URL back to IPFS URL
            const ipfsPath = metadata.image.split("/ipfs/")[1];
            if (ipfsPath) {
              metadata.image = `ipfs://${ipfsPath}`;
            }
          }
          console.log(
            `[DEBUG] Successfully parsed metadata from ${gateway}:`,
            metadata
          );
          break; // Exit loop if successful
        } catch (parseError) {
          console.warn(
            `[DEBUG] Failed to parse JSON from ${gateway}:`,
            parseError
          );
          continue;
        }
      } catch (fetchError) {
        console.warn(`[DEBUG] Failed to fetch from ${gateway}:`, fetchError);
        lastError =
          fetchError instanceof Error
            ? fetchError
            : new Error(String(fetchError));
        continue;
      }
    }

    if (!metadata) {
      throw new Error(
        `Failed to fetch metadata from all gateways. Last error: ${lastError?.message}`
      );
    }

    // Validate metadata structure
    if (!metadata.image) {
      console.warn(`[DEBUG] No image field in metadata for token ${tokenId}`);
    } else {
      console.log(`[DEBUG] Image URL from metadata:`, metadata.image);
    }

    return metadata;
  } catch (error) {
    console.error(
      `[DEBUG] Error getting NFT metadata for token ${tokenId}:`,
      error
    );
    return null;
  }
};

// Get NFT image URL
export const getNFTImageUrl = async (provider: Provider, tokenId: number) => {
  try {
    console.log(`[DEBUG] Getting image URL for token ${tokenId}...`);
    const metadata = await getNFTMetadata(provider, tokenId);

    if (!metadata) {
      console.error(`[DEBUG] No metadata found for token ${tokenId}`);
      return null;
    }

    if (!metadata.image) {
      console.error(`[DEBUG] No image field in metadata for token ${tokenId}`);
      return null;
    }

    console.log(`[DEBUG] Processing image URL:`, metadata.image);

    // If the image URL is an IPFS hash, construct multiple gateway URLs
    if (metadata.image.startsWith("ipfs://")) {
      const ipfsHash = metadata.image.slice(7); // Remove 'ipfs://'
      console.log(`[DEBUG] Converting IPFS hash to gateway URLs:`, ipfsHash);

      const urls = {
        primary: `https://ipfs.io/ipfs/${ipfsHash}`,
        fallbacks: [
          `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
          `https://dweb.link/ipfs/${ipfsHash}`,
          `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        ],
      };

      console.log(`[DEBUG] Generated gateway URLs:`, urls);
      return urls;
    }

    console.log(`[DEBUG] Using direct HTTP URL:`, metadata.image);
    return { primary: metadata.image, fallbacks: [] };
  } catch (error) {
    console.error(
      `[DEBUG] Error getting NFT image URL for token ${tokenId}:`,
      error
    );
    return null;
  }
};

// Mark a token as pre-purchased (for card payments)
export const markTokenAsPrePurchased = async (
  signer: Signer,
  tokenId: number,
  purchaserAddress: string
) => {
  try {
    const contract = await getNftContract(signer);

    // Check if contract is paused
    const paused = await contract.paused();
    if (paused) {
      throw new Error(
        "Contract is currently paused. Pre-purchases are not available."
      );
    }

    const tx = await contract.markTokenAsPrePurchased(
      tokenId,
      purchaserAddress
    );

    return {
      success: true,
      transaction: tx,
      hash: tx.hash,
    };
  } catch (error) {
    console.error("Error marking token as pre-purchased:", error);

    let errorMessage = "Failed to mark token as pre-purchased";
    if ((error as Error).message.includes("Token is not for sale")) {
      errorMessage = "This NFT is not available for pre-purchase";
    } else if (
      (error as Error).message.includes("Token already pre-purchased")
    ) {
      errorMessage = "This NFT has already been pre-purchased";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Claim a Stripe-purchased NFT
export const claimStripePurchasedNFT = async (
  signer: Signer,
  tokenId: number,
  email: string
) => {
  try {
    const contract = await getNftContract(signer);
    const signerAddress = await signer.getAddress();

    // Check if contract is paused
    const paused = await contract.paused();
    if (paused) {
      throw new Error(
        "Contract is currently paused. Claims are not available."
      );
    }

    // First verify the purchase in Supabase
    const { data: purchaseData } = await supabase
      .from("nft_purchases")
      .select("*")
      .eq("user_email", email)
      .eq("token_id", tokenId)
      .eq("status", "completed")
      .single();

    if (!purchaseData) {
      throw new Error("No valid purchase found for this NFT");
    }

    // Check if the token is already pre-purchased for this address
    const prePurchaser = await contract.getPrePurchaser(tokenId);

    // If not pre-purchased for anyone, mark it for this address
    if (prePurchaser === ethers.ZeroAddress) {
      try {
        const ownerSigner = new ethers.Wallet(
          import.meta.env.VITE_PRIVATE_KEY,
          signer.provider
        );
        const ownerContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          ownerSigner
        );
        const tx = await ownerContract.markTokenAsPrePurchased(
          tokenId,
          signerAddress
        );
        await tx.wait();
        console.log(
          `Token ${tokenId} marked as pre-purchased for ${signerAddress}`
        );
      } catch (error) {
        console.error("Error marking token as pre-purchased:", error);
        throw new Error(
          "Failed to mark token as pre-purchased. Please try again."
        );
      }
    }
    // If pre-purchased for a different address, throw error
    else if (prePurchaser.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error(
        "This NFT is pre-purchased for a different wallet address. Please use the correct wallet."
      );
    }

    // Now try to claim the token
    const tx = await contract.claimToken(tokenId);
    await tx.wait();

    return {
      success: true,
      transaction: tx,
      hash: tx.hash,
    };
  } catch (error) {
    console.error("Error claiming Stripe-purchased NFT:", error);
    let errorMessage = "Failed to claim NFT";
    if ((error as Error).message.includes("No valid purchase found")) {
      errorMessage = "No valid purchase found for this NFT";
    } else if ((error as Error).message.includes("different wallet address")) {
      errorMessage = (error as Error).message;
    } else if ((error as Error).message.includes("Failed to mark token")) {
      errorMessage = (error as Error).message;
    } else if ((error as Error).message.includes("execution reverted")) {
      errorMessage =
        "Transaction failed. Please make sure this NFT is available for claiming.";
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};

export { claimNft as claimToken };
