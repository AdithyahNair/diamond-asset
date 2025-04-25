import { ethers } from "ethers";
import contractInfo from "../../contract-info.json";

// The address of our deployed contract
export const NFT_CONTRACT_ADDRESS = contractInfo.address;

// The ABI (Application Binary Interface) of our contract
export const NFT_CONTRACT_ABI = contractInfo.abi;

// NFT price in ETH
export const NFT_PRICE = 0.001;

// Get the NFT contract instance
export const getNftContract = async (
  signer: ethers.Signer | ethers.providers.Provider
) => {
  return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
};

// Get available NFTs
export const getAvailableNfts = async (provider: ethers.providers.Provider) => {
  try {
    // For testing marketplace functionality, always show 8 available
    return 8;
  } catch (error) {
    console.error("Error getting available NFTs:", error);
    return 0;
  }
};

// Purchase an NFT
export const purchaseNft = async (signer: ethers.Signer, recipient: string) => {
  try {
    const contract = await getNftContract(signer);

    // Instead of minting, transfer from your wallet to the buyer
    // You'll need to first approve the transfer (not shown here)
    // This is a simplified example - you'd typically use a marketplace contract

    const yourAddress = "0xb2197e9066170Bbe67e877437FfCf5f7f3f092D3"; // Your wallet address
    const tokenId = 1; // Token ID to transfer (would be dynamic in real implementation)

    // Send payment to your wallet
    const tx = await signer.sendTransaction({
      to: yourAddress,
      value: ethers.utils.parseEther(NFT_PRICE.toString()),
    });

    // When payment is received, transfer the NFT
    // In a real implementation, this would be handled by a marketplace smart contract

    return {
      success: true,
      transaction: tx,
      hash: tx.hash,
    };
  } catch (error) {
    console.error("Error purchasing NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to purchase NFT",
    };
  }
};

// Get NFTs owned by an address
export const getNftsOwnedBy = async (
  provider: ethers.providers.Provider,
  address: string
) => {
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
          ownedNfts.push({
            id: i,
            tokenURI,
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
